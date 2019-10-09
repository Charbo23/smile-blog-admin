const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');
const assetsCDN = {
    css: [
        // 'https://cdn.remixicon.com/releases/v2.0.0/remixicon.css',
        '//netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
    ],
   
    js: [
     
    ]
  }
module.exports = {
    publicPath: '/',
    devServer: {
        port: 8080,
        open: true
    },
    chainWebpack: (config) => {
        config.plugin('html').tap(args => {
            args[0].cdn = assetsCDN
            return args
        })
    },
    configureWebpack: (config) => {
        if (process.env.NODE_ENV === "production") {
            config.plugins.push(new webpack.BannerPlugin('© 2019 Charbo. All Right Reserved.'));
            if (process.env.VUE_APP_ANALYZE === 'true') {
                config.plugins.push(new BundleAnalyzerPlugin());
            }
        }
    },
};