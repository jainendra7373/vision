const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: ["babel-polyfill", "./src/index.js"], // string | object | array
  output: {
    path: path.resolve(__dirname, "./static/frontend"), // string (default)
    filename: "[name].js", // string (default)
    sourceMapFilename: "[name].js.map",
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },

  optimization: {
    minimize: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development"),
        //NODE_ENV: JSON.stringify("production"),
      },
    }),
  ],
};
