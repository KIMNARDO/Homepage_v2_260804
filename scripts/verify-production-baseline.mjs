import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Build first. This compares the local build with the public site, without
// submitting forms, changing the deployment, or accessing server credentials.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origin = new URL('https://www.papsnet.net/');
const dist = join(root, 'dist');
const output = join(root, 'output', 'production-baseline');
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
// Windows checkout line endings also leave standalone CR characters where
// Vite removes source tags. Removing CR reproduces the Linux build text.
const normalizeHtml = (buffer) => buffer.toString('utf8').replace(/\r/g, '');

async function getPublicFile(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`${url.pathname}: HTTP ${response.status}`);
  if (new URL(response.url).origin !== origin.origin) {
    throw new Error(`Unexpected redirect outside ${origin.origin}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function mapBatches(items, operation) {
  const results = [];
  for (let index = 0; index < items.length; index += 3) {
    results.push(...await Promise.all(items.slice(index, index + 3).map(operation)));
  }
  return results;
}

async function verify() {
  await mkdir(output, { recursive: true });
  const routes = (await readdir(dist)).filter((name) => name.endsWith('.html')).sort();
  if (!routes.includes('index.html')) throw new Error('Run npm run build first.');
  const assets = new Set();
  const pages = await mapBatches(routes, async (route) => {
    const url = new URL(route === 'index.html' ? '/' : route, origin);
    const [deployed, local] = await Promise.all([
      getPublicFile(url),
      readFile(join(dist, route)),
    ]);
    for (const match of deployed.toString('utf8').matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)) {
      const asset = new URL(match[1], origin);
      if (asset.origin === origin.origin && asset.pathname.startsWith('/assets/')) {
        assets.add(asset.pathname);
      }
    }
    // A .txt suffix keeps saved HTML from triggering Vite page reloads.
    await writeFile(join(output, `live-${route}.txt`), deployed);
    return {
      route,
      matchesIgnoringCarriageReturns: normalizeHtml(local) === normalizeHtml(deployed),
      deployedSha256: sha256(deployed),
      localSha256: sha256(local),
    };
  });

  const bundles = await mapBatches([...assets].sort(), async (asset) => {
    const deployed = await getPublicFile(new URL(asset, origin));
    let local;
    try {
      local = await readFile(join(dist, decodeURIComponent(asset.slice(1))));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      return { asset, matches: false, reason: 'Deployed filename missing from local build' };
    }
    return {
      asset,
      matches: local.equals(deployed),
      bytes: deployed.length,
      deployedSha256: sha256(deployed),
      localSha256: sha256(local),
    };
  });

  const allPagesMatch = pages.every((page) => page.matchesIgnoringCarriageReturns);
  const allBundlesMatch = bundles.length > 0 && bundles.every((bundle) => bundle.matches);
  const report = {
    checkedAt: new Date().toISOString(),
    site: origin.href,
    sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    normalization: 'HTML: remove CR characters from Windows checkout. JS/CSS: exact bytes.',
    matches: allPagesMatch && allBundlesMatch,
    pages,
    bundles,
  };
  await writeFile(join(output, 'verification.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    matches: report.matches,
    pages: `${pages.filter((page) => page.matchesIgnoringCarriageReturns).length}/${pages.length}`,
    bundles: `${bundles.filter((bundle) => bundle.matches).length}/${bundles.length}`,
    report: join(output, 'verification.json'),
  }, null, 2));
  if (!report.matches) process.exitCode = 1;
}

verify().catch((error) => {
  console.error(`Production baseline verification failed: ${error.message}`);
  process.exitCode = 1;
});
