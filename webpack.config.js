const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background.js',
    popup: './src/popup.js',
    options: './src/options.js',
    newtab: './src/newtab.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'src/popup.html', to: 'src/popup.html' },
        { from: 'src/options.html', to: 'src/options.html' },
        { from: 'src/newtab.html', to: 'src/newtab.html' },
        { from: 'src/blocked.html', to: 'src/blocked.html' },
        { from: 'src/styles.css', to: 'src/styles.css' }
      ]
    })
  ],
  devtool: 'source-map',
  optimization: {
    minimize: false
  }
};
