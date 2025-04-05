// next.config.js
module.exports = {
    transpilePackages: ['@ensdomains/content-hash', 'multiformats'],
    webpack: (config) => {
      // 必要に応じてwebpack設定をカスタマイズ
      return config;
    }
}