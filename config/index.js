'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

module.exports = {
  dev: {

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      //网信中心-水文站监测数据接口
      '/cjwsjymonitor': {
        target: 'http://10.6.1.57:2345',
        pathRewrite: {
          '^/cjwsjymonitor': ''
        }
      },
      //宏数水库基本信息接口
      '/cjwsjysj': {
        target: 'http://10.6.189.40:8080',
        pathRewrite: {
          '^/cjwsjysj': ''
        }
      },
      //178雨量站接口
      '/api': {
        target: 'http://10.6.172.178:8086',
        pathRewrite: {
          '^/api': ""
        }
      },
      '/models': {
        target: 'http://10.6.172.166:8080',
        pathRewrite: {
          '^/models': ""
        }
      },
      '/map178': {
        target: 'http://10.6.172.178:6080',
        pathRewrite: {
          '^/map178': '/arcgis'
        },
        changeOrigin: true,
        cookiePathRewrite: "/"
      },
      '/localmap': {
        target: 'http://localhost:6080',
        pathRewrite: {
          '^/localmap': '/arcgis'
        },
        changeOrigin: true,
        cookiePathRewrite: "/"
      },
      '/locgeoserver': {
        target: 'http://localhost:8010',
        pathRewrite: {
          '^/locgeoserver': '/geoserver'
        },
        changeOrigin: true,
        cookiePathRewrite: "/"
      },
      '/geoserver229': {
        target: 'http://106.14.203.229:8010',
        pathRewrite: {
          '^/geoserver229': '/geoserver'
        },
        changeOrigin: true,
        cookiePathRewrite: "/"
      },
      '/map229': {
        target: 'http://106.14.203.229:6080',
        pathRewrite: {
          '^/map229': '/arcgis'
        },
        changeOrigin: true,
        cookiePathRewrite: "/"
      },
      //cesiumlab代理服务
      '/cesiumlab': {
        target: 'http://106.14.203.229:8088/',
        pathRewrite: {
          '^/cesiumlab': '/cesiumlab'
        },
        changeOrigin: true,
        cookiePathRewrite: "/"
      },
      '/geoserver178': {
        target: 'http://10.6.172.178:8010',
        pathRewrite: {
          '^/geoserver178': '/geoserver'
        },
        changeOrigin: true,
        cookiePathRewrite: "/"
      },
      '/geoserver166': {
        target: 'http://10.6.172.166:8010',
        pathRewrite: {
          '^/geoserver166': '/geoserver'
        },
        changeOrigin: true,
        cookiePathRewrite: "/"
      },
      '/map116': {
        target: 'http://10.6.96.116:6080',
        pathRewrite: {
          '^/map116': '/arcgis'
        },
        changeOrigin: true,
        cookiePathRewrite: "/"
      },
      '/map252': {
        target: 'http://10.6.97.252:6080',
        pathRewrite: {
          '^/map252': '/arcgis'
        },
        changeOrigin: true,
        cookiePathRewrite: "/"
      },
      '/map172166': {
        target: 'http://10.6.172.166:6080',
        pathRewrite: {
          '^/map172166': '/arcgis'
        },
        changeOrigin: true,
        cookiePathRewrite: "/"
      },

      '/model3d': {
        target: '10.6.172.177:10200',
        pathRewrite: {
          '^/model3d': '/FixedData'
        },
        changeOrigin: true,
        cookiePathRewrite: "/"
      }
    },

    // Various Dev Server settings
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-


    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    cssSourceMap: true
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',

    /**
     * Source Maps
     */

    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
