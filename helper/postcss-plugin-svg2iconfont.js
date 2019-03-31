/**
 * Created by heweiguang on 2019-03-17.
 */

const postcss = require('postcss');
const path = require('path');
const fs = require('fs-extra');
const webfontsGenerator = require('webfonts-generator');
const types = ['eot', 'ttf', 'woff', 'woff2'];
const svgSymbol = '/* @svg2iconfont */';

const base64header = type => `data:application/font-${type};charset=utf-8;base64,`;

const generateFontFromSvg = (svgPath, fontName, publicPath) => {
  console.log('--- 开始将 SVG 转为 FONT ---');

  return new Promise((resolve, reject) => {
    const options = {
      files: [],
      fontName,
      writeFiles: false,
      dest: '',
      cssTemplate: path.resolve('helper/templates/css.hbs'),
      types,
      templateOptions: {
        classPrefix: 'icons-',
        baseSelector: '.icons',
      },
    }

    // 生产环境需要生成文件上传到 CDN，并且加上 publicPath
    if (publicPath) {
      // options.writeFiles = true;
      // options.dest = path.resolve('static/font');
      // options.cssFontsUrl = publicPath;
    }

    // 生成 SVG 文件列表
    try {
      const svgArray = fs.readdirSync(svgPath);

      svgArray.forEach(svg => {
        if (path.extname(svg) !== '.svg') {
          return;
        }

        options.files.push(path.join(svgPath, svg));
      });
    } catch (error) {
      reject(error);
    }

    webfontsGenerator(options, function(error, result) {
      if (error) {
        return reject(error);
      }

      const {
        generateCss
      } = result;

      if (publicPath) {
        console.log('--- 完成将 SVG 转为 FONT ---');

        return resolve(generateCss());
      }

      const urls = {};

      types.forEach(type => {
        urls[type] = base64header(type) + result[type].toString('base64')
      });

      console.log('--- 完成将 SVG 转为 FONT ---');

      resolve(generateCss(urls));
    });
  });
}

module.exports = postcss.plugin('svg2iconfont', options => {
  const { svgPath, publicPath } = options;

  return function (root) {
    return new Promise((resolve) => {
      let shouldHandle = false;

      if (root.nodes) {
        shouldHandle = root.nodes.some(node => {
          return node.type === 'comment' && node.toString() === svgSymbol
        });
      }

      if (!shouldHandle) {
        resolve();

        return;
      }

      root.walkComments(comment => {
        if (comment.toString() === svgSymbol) {

          generateFontFromSvg(svgPath, 'icons', publicPath).then(fontFaceStyle => {
            const fontFace = postcss.parse(fontFaceStyle);
            const { nodes } = fontFace;

            comment.replaceWith(nodes);

            resolve();
          });

          return;
        }

        resolve();
      });


    });
  };
});
