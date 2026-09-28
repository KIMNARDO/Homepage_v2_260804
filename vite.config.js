const { defineConfig } = require('vite');
const { resolve } = require('path');
const { copyFileSync, mkdirSync, readdirSync, statSync, readFileSync } = require('fs');

const runtimeAssets = [
  ['images/hero-ev-parts', 'images/hero-ev-parts'],
  ['images/hero-aerospace-parts', 'images/hero-aerospace-parts'],
  ['images/hero-aerospace-blueprint.webp', 'images/hero-aerospace-blueprint.webp'],
  ['images/icons3d', 'images/icons3d'],
  ['images/product-tour', 'images/product-tour'],
  ['images/hero-equipment-digital-twin.png', 'images/hero-equipment-digital-twin.png'],
  ['images/hero-equipment-digital-twin.webp', 'images/hero-equipment-digital-twin.webp'],
  ['images/clip-2d-viewer.png', 'images/clip-2d-viewer.png'],
  ['images/clip-3d-viewer.png', 'images/clip-3d-viewer.png'],
  ['images/clip3d-viewer', 'images/clip3d-viewer'],
  ['images/cadwin_drawing_inspection.png', 'images/cadwin_drawing_inspection.png'],
  ['images/plm_project_dashboard.png', 'images/plm_project_dashboard.png'],
  ['images/pms_project_overview.png', 'images/pms_project_overview.png'],
  ['images/multibom_dashboard_real.webp', 'images/multibom_dashboard_real.webp'],
  ['images/cms_cost_dashboard.png', 'images/cms_cost_dashboard.png'],
  ['images/multibom_comparison_real.webp', 'images/multibom_comparison_real.webp'],
  ['videos/hero-cadwin.mp4', 'videos/hero-cadwin.mp4'],
  ['videos/clip-pdm-hero.mp4', 'videos/clip-pdm-hero.mp4'],
  ['videos/v3-overview.mp4', 'videos/v3-overview.mp4'],
  ['videos/clip-ai-chatbot-demo.webm', 'videos/clip-ai-chatbot-demo.webm'],
  ['videos/poster-cadwin-clean.png', 'videos/poster-cadwin-clean.png'],
  ['videos/v3-overview-preview.jpg', 'videos/v3-overview-preview.jpg'],
  ['clip_pdm_dashboard.png', 'clip_pdm_dashboard.png'],
  ['brochures', 'brochures'],
];

function copyRuntimeAssets() {
  const copyAsset = (source, destination) => {
    const entries = readdirSync(source, { withFileTypes: true });

    mkdirSync(destination, { recursive: true });

    for (const entry of entries) {
      const sourcePath = resolve(source, entry.name);
      const destinationPath = resolve(destination, entry.name);

      if (entry.isDirectory()) {
        copyAsset(sourcePath, destinationPath);
      } else {
        copyFileSync(sourcePath, destinationPath);
      }
    }
  };

  return {
    name: 'copy-runtime-assets',
    closeBundle() {
      for (const [source, target] of runtimeAssets) {
        const sourcePath = resolve(__dirname, source);
        const destination = resolve(__dirname, 'dist', target);

        if (statSync(sourcePath).isFile()) {
          mkdirSync(resolve(destination, '..'), { recursive: true });
          copyFileSync(sourcePath, destination);
        } else {
          copyAsset(sourcePath, destination);
        }
      }
    },
  };
}

function newsContent() {
  const contentPath = resolve(__dirname, 'content/news.json');
  return {
    name: 'papsnet-news-content',
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        if (!html.includes('<!-- PAPSNET_NEWS_CONTENT -->')) return html;
        const { validateNews, visibleNews, renderNewsItems, renderNewsFilters, renderNewsFallback, NEWS_PAGE_SIZE } = await import('./news-renderer.mjs');
        const data = validateNews(JSON.parse(readFileSync(contentPath, 'utf8')));
        const items = visibleNews(data);
        return html
          .replace('<!-- PAPSNET_NEWS_CONTENT -->', renderNewsItems(items.slice(0, NEWS_PAGE_SIZE), data))
          .replace('<!-- PAPSNET_NEWS_FILTERS -->', renderNewsFilters(data))
          .replace('<!-- PAPSNET_NEWS_FALLBACK -->', renderNewsFallback(data))
          .replace('<!-- PAPSNET_NEWS_COUNT -->', `${items.length}개의 소식`);
      },
    },
    configureServer(server) {
      server.watcher.add(contentPath);
      server.watcher.on('change', path => {
        if (resolve(path) === contentPath) server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

module.exports = defineConfig({
  base: './',
  plugins: [copyRuntimeAssets(), newsContent()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cadwin: resolve(__dirname, 'product-cadwin.html'),
        clippdm: resolve(__dirname, 'product-clippdm.html'),
        clippms: resolve(__dirname, 'product-clippms.html'),
        multibom: resolve(__dirname, 'product-multibom.html'),
        clipcms: resolve(__dirname, 'product-clipcms.html'),
        clip3dviewer: resolve(__dirname, 'product-clip3dviewer.html'),
        brochure: resolve(__dirname, 'brochure.html'),
        companyIntro: resolve(__dirname, 'company-intro.html'),
        contact: resolve(__dirname, 'contact.html'),
        contactComplete: resolve(__dirname, 'contact-complete.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    // WSL2에서 /mnt/d(Windows 마운트) 파일은 inotify 이벤트가 안 와서
    // HMR이 동작하지 않음 → 폴링으로 파일 변경 감지.
    watch: {
      usePolling: true,
      interval: 300,
    },
    allowedHosts: [
      'papsnet-vite-wsl.tail8a38b1.ts.net',
      'desktop-dj8os46.tail8a38b1.ts.net',
      'desktop-dj8os46',
      '100.113.148.44',
      '100.75.203.106',
      '172.26.228.233',
      '192.168.0.58',
      'localhost',
      '127.0.0.1',
    ],
  },
});
