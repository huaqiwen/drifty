const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin([
      'index.html',
      { from: 'models3d' },
    ]),
    new VueLoaderPlugin(),
  ],
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js', '.vue']
  },
  module: {
    rules: [
      // All files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          // this line took 2 fucking hours to figure out
           appendTsSuffixTo: [/\.vue$/],
        },
      },
      // Loading Vue single-file components
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader',
        ],
      },
    ],
  },
};
