const webpack = require("webpack");

process.env.CHROME_BIN = require("puppeteer").executablePath();

module.exports = (config) => {
  config.set({
    files: ["tests/karmaTests.ts"],

    preprocessors: {
      "tests/karmaTests.ts": ["webpack", "sourcemap"],
    },

    frameworks: ["jasmine"],

    browsers: ["ChromeHeadless"],

    concurrency: 1,

    client: {
      jasmine: {
        timeoutInterval: 25000,
      },
    },

    browserNoActivityTimeout: 40000,

    webpack: {
      devtool: "inline-source-map",

      resolve: {
        extensions: [".json", ".js", ".mjs", ".ts"],
      },

      plugins: [
        new webpack.DefinePlugin({
          "process.env.FIRESTORE_EMULATOR_HOST": JSON.stringify(
            process.env.FIRESTORE_EMULATOR_HOST
          ),
          "process.env.FIREBASE_PROJECT_ID": JSON.stringify(
            process.env.FIREBASE_PROJECT_ID
          ),
          "process.env.FIREBASE_API_KEY": JSON.stringify(
            process.env.FIREBASE_API_KEY
          ),
          "process.env.FIREBASE_USERNAME": JSON.stringify(
            process.env.FIREBASE_USERNAME
          ),
          "process.env.FIREBASE_PASSWORD": JSON.stringify(
            process.env.FIREBASE_PASSWORD
          ),
        }),

        new webpack.IgnorePlugin({ resourceRegExp: /firebase-admin/ }),
      ],

      module: {
        rules: [
          {
            test: /\.(mjs|js|ts)$/,
            loader: "babel-loader",
            exclude: /node_modules/,
          },
        ],
      },
    },

    webpackMiddleware: {
      stats: "errors-only",
    },
  });
};
