const { defineConfig } = require('vite');
const { resolve } = require('path');

module.exports = defineConfig({
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
