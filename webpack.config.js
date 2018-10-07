const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  entry: "./bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  mode: "production",
  optimization: {
    // why does build break without this?
    sideEffects: false
  },
  plugins: [
    new CopyWebpackPlugin(['index.html', 'map_flatten.html', 'replace_none.html', 'useless_collect.html', 'style.css'])
  ],
};
