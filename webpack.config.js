const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  mode: "development", // TODO: 'production'
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
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
  resolve: {
    extensions: [".ts", ".js", ".vue"],
    alias: {
      vue$: "vue/dist/vue.esm-bundler.js",
      "@shared": path.resolve(__dirname, "src/shared/"),
      "@content_script": path.resolve(__dirname, "src/content_script/"),
      "@shared": path.resolve(__dirname, "src/shared/"),
    },
  },
  devtool: "inline-source-map",
  watch: true,
};
