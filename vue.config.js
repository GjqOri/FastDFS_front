module.exports = {
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  devServer: {
    proxy: {
      // 当请求以/开头时，全部转换到http://localhost:8082这个服务器（Vue开发环境的服务器是代理）
      "/": {
        target: "http://localhost:8082",
        // ws: true, // 代理websocket
        changeOrigin: true
      }
    }
  }
};
