/**
 * Created by heweiguang on 2019-03-17.
 */

const postcss = require('postcss');
const path = require('path');
const fs = require('fs-extra');
const webFont = require("webfont").default;
const XXH = require('xxhashjs');
const types = ['eot', 'ttf', 'woff', 'woff2', 'svg'];
const svgSymbol = '/* @svg2iconfont */';

const generateFontFromSvg = (svgPath, fontClassName, publicPath) => {
  console.log('--- 开始将 SVG 转为 FONT ---');

  return new Promise((resolve, reject) => {

    webFont({
      files: path.join(svgPath, '*.svg'),
      fontName: 'iconfont',
      template: "css",
      templateClassName: fontClassName,
      templateFontPath: publicPath ? `${publicPath}/static/fonts/` : '/'
    })
    .then(result => {
      const {
        ttf,
        eot,
        woff,
        woff2,
        // svg,
        template,
        config
      } = result;

      const folder = path.resolve('static/fonts');

      // 生产环境
      if (publicPath) {
        if (!fs.existsSync(folder)) {
          fs.mkdirpSync(folder);
        }

        const fontName = `${config.fontName}-${XXH.h32(0).update(eot).digest()}`;

        types.forEach(type => {
          fs.writeFileSync(path.resolve(path.join(folder, `${fontName}.${type}`)), result[type]);
        });

        console.log('--- 完成 ---');

        const reg = new RegExp(`([^#])${config.fontName}`, 'g');

        resolve(template.replace(reg, `$1${fontName}`));

        return;
      }

      const base64header = 'data:image/png;base64,';

      const style = template
      .replace(/([^"]*ttf[^"]*)/g, base64header + ttf.toString('base64'))
      .replace(/([^"]*eot[^"]*)/g, base64header + eot.toString('base64'))
      .replace(/([^"]*woff[^"]*)/g, base64header + woff.toString('base64'))
      .replace(/([^"]*woff2[^"]*)/g, base64header + woff2.toString('base64'));

      console.log('--- 完成 ---');

      resolve(style);
    })
    .catch(error => {
      reject(error);
    });
  })
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
