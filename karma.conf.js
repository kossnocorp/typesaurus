const webpack = require('webpack')

process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = (config) => {
  config.set({
    files: ['test/karmaTests.ts'],

    preprocessors: {
      'test/karmaTests.ts': ['webpack', 'sourcemap']
    },

    frameworks: ['jasmine'],

    browsers: ['ChromeHeadless'],

    concurrency: 1,

    client: {
      jasmine: {
        timeoutInterval: 25000
      }
    },

    browserNoActivityTimeout: 40000,

    webpack: {
      devtool: 'inline-source-map',

      resolve: {
        extensions: ['.json', '.js', '.ts']
      },

      plugins: [
        new webpack.DefinePlugin({
          'process.env.FIREBASE_PROJECT_ID': JSON.stringify(
            process.env.FIREBASE_PROJECT_ID
          ),
          'process.env.FIREBASE_API_KEY': JSON.stringify(
            process.env.FIREBASE_API_KEY
          ),
          'process.env.FIREBASE_USERNAME': JSON.stringify(
            process.env.FIREBASE_USERNAME
          ),
          'process.env.FIREBASE_PASSWORD': JSON.stringify(
            process.env.FIREBASE_PASSWORD
          )
        })
      ],

      module: {
        rules: [
          {
            test: /\.ts$/,
            loader: 'babel-loader',
            exclude: /node_modules/
          }
        ]
      }
    },

    webpackMiddleware: {
      stats: 'errors-only'
    }
  })
}
