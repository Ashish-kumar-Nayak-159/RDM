const CompressionPlugin = require(`compression-webpack-plugin`);
module.exports = {
  plugins: [
    // new BrotliPlugin({
    //   asset: '[fileWithoutExt].[ext].br',
    //   test: /\.(js|css|html|svg|txt|eot|otf|ttf|gif)$/,
    // }),
    new CompressionPlugin({
      test: /\.(js|css|html|svg|txt|eot|otf|ttf|gif)$/,
      compressionOptions: { threshold: 8192, level: 9 },
    }),
  ],
};
