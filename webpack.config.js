const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const webpack = require("webpack");

module.exports = {
  entry: {
    background: "./src/background/index.ts",
    content_script: "./src/content_script/index.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: { appendTsSuffixTo: [/\.vue$/] },
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      // Enable the Options API
      __VUE_OPTIONS_API__: JSON.stringify(true),
      // Disable Vue devtools in production
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      // Disable detailed hydration mismatch warnings in production
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
    }),
  ],
  resolve: {
    extensions: [".ts", ".js", ".vue"],
    alias: {
      vue$: "vue/dist/vue.esm-bundler.js",
      "@background": path.resolve(__dirname, "src/background/"),
      "@content_script": path.resolve(__dirname, "src/content_script/"),
      "@shared": path.resolve(__dirname, "src/shared/"),
    },
  },
  devtool: "inline-source-map",
  watch: true,
};
