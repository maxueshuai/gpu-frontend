module.exports = {
  transpileDependencies: ['element-plus'],
  configureWebpack: {
    resolve: {
      fallback: {
        "path": require.resolve("path-browserify"),
        "global": false,
        "module": false,
        "fs": false,
        "crypto": false,
        "stream": false,
        "buffer": false,
        "util": false,
        "assert": false,
        "http": false,
        "https": false,
        "os": false,
        "url": false,
        "zlib": false
      }
    }
  },
  devServer: {
    port: 8082,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api/v1'
        },
        ws: true
      }
    }
  }
} 