const path = require("path");
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({  
  indexPath: "vftu003.html", //this change target html to specified file name
  outputDir: "vftu003", //this change target folder to spcified name
  pages: {
    index: {
      entry: 'src/vftu003.js',
      title: 'API Configuration',
    }
  },
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' /* this is BASE_URL in index.html */
    ? './' /*+ process.env.CI_PROJECT_NAME + '/'*/
    : './',
  configureWebpack: {
    devtool: "source-map",
    optimization: {
      minimize: false
    },
    resolve: {
      alias: {
        // bind version of jquery-ui
        "jquery-ui": "jquery-ui-dist/jquery-ui.js",
        // bind to modules;
        modules: path.join(__dirname, "node_modules")
      }
    },
  }    
})
