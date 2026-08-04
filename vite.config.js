const { defineConfig } = require('vite');
const { resolve } = require('path');
const { copyFileSync, mkdirSync, readdirSync, statSync } = require('fs');

const runtimeAssets = [
  ['images/hero-ev-parts', 'images/hero-ev-parts'],
  ['images/hero-aerospace-parts', 'images/hero-aerospace-parts'],
  ['images/icons3d', 'images/icons3d'],
  ['images/product-tour', 'images/product-tour'],
  ['images/hero-equipment-digital-twin.png', 'images/hero-equipment-digital-twin.png'],
  ['images/clip-2d-viewer.png', 'images/clip-2d-viewer.png'],
  ['images/clip-3d-viewer.png', 'images/clip-3d-viewer.png'],
  ['images/cadwin_drawing_inspection.png', 'images/cadwin_drawing_inspection.png'],
  ['images/plm_project_dashboard.png', 'images/plm_project_dashboard.png'],
  ['images/pms_project_overview.png', 'images/pms_project_overview.png'],
  ['images/multibom_dashboard_real.webp', 'images/multibom_dashboard_real.webp'],
  ['images/cms_cost_dashboard.png', 'images/cms_cost_dashboard.png'],
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

module.exports = defineConfig({
  base: './',
  plugins: [copyRuntimeAssets()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cadwin: resolve(__dirname, 'product-cadwin.html'),
        clippdm: resolve(__dirname, 'product-clippdm.html'),
        clippms: resolve(__dirname, 'product-clippms.html'),
        multibom: resolve(__dirname, 'product-multibom.html'),
        clipcms: resolve(__dirname, 'product-clipcms.html'),
        brochure: resolve(__dirname, 'brochure.html'),
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
