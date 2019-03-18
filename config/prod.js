module.exports = {
  env: {
    NODE_ENV: '"production"'
  },
  defineConstants: {
  },
  weapp: {
    module: {
      postcss: {
        './helper/postcss-plugin-svg2iconfont': {
          config: {
            publicPath: 'https://imgcdn50.zuzuche.com'
          },
        },
        './helper/postcss-plugin-image': {
          enable: true,
          config: {
            publicPath: 'https://imgcdn50.zuzuche.com'
          },
        },
      }
    }
  },
  h5: {}
}
