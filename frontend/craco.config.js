const path = require("path");
require("dotenv").config();

module.exports = {
  // 🔥 MATIKAN ESLINT TOTAL (WAJIB)
  eslint: {
    enable: false,
  },

  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig) => {
      webpackConfig.watchOptions = {
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/build/**",
          "**/dist/**",
          "**/coverage/**",
          "**/public/**",
        ],
      };
      return webpackConfig;
    },
  },
};
