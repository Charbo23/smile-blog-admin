const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');
module.exports = {
    publicPath: '/',
    devServer: {
        port: 8080,
    },
    configureWebpack: (config) => {
        if (process.env.NODE_ENV === "production") {
            config.plugins.push(new webpack.BannerPlugin('© 2019 Charbo. All Right Reserved.'));
            if (process.env.ANALYZE === 'true') {
                config.plugins.push(new BundleAnalyzerPlugin());
            }
        }
    },
};