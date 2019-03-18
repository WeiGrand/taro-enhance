module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
  },
  weapp: {
    module: {
      postcss: {
        url: {
          enable: true,
          config: {
            limit: 102400 // 增大 100 倍 也就是 1M 左右的图片才会限制
          }
        },
      }
    }
  },
  h5: {}
}
