/**
 * Created by heweiguang on 2019-03-18.
 */

const postcss = require('postcss');
const path = require('path');
const fs = require('fs-extra');
const XXH = require('xxhashjs');

module.exports = postcss.plugin('svg2iconfont', options => {
  const { publicPath } = options;

  return function (root, result) {
    return new Promise((resolve) => {
      if (!publicPath) {
        resolve();

        return;
      }

      const { opts } = result;
      const from = opts.from ? path.dirname(opts.from) : '.';

      root.walkDecls(decl => {
        const { value } = decl;

        if (/url\(.*\.(png|jpe?g|gif|bpm|svg)(\?.*)?\)$/g.test(value)) {
          decl.value = value.replace(/(url\(\s*['"]?)([^"')]+)(["']?\s*\))/g, (matched, before, url, after) => {
            let index = url.indexOf('?');

            if (index !== -1) {
              url = url.substr(0, index)
            }

            const sourcePath = path.join(from, url);
            const sourceBuffer = fs.readFileSync(sourcePath);
            const ext = path.extname(sourcePath);
            const fileName = path.basename(sourcePath, ext);
            const target = `${fileName}-${XXH.h32(0).update(sourceBuffer).digest()}${ext}`;

            const folder = path.resolve('static/images');

            if (!fs.existsSync(folder)) {
              fs.mkdirpSync(folder);
            }

            const targetPath = path.join(folder, target);

            fs.copyFileSync(sourcePath, targetPath);

            console.log(targetPath);

            return `${before}${publicPath}/static/images/${path.basename(target)}${after}`;
          });
        }
      });

      resolve();
    });
  };
});
