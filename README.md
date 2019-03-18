# 增强 Taro 配置

**区分「开发包」和「生产包」，更好的图片管理方案** 

新增 `publish:weapp` 命令打包「生成包」

- `开发包`: `CSS` 的静态资源均以 `base64` 的形式引用
- `生产包`: `CSS` 的静态资源支持 `publichPath`，文件名根据内容 `hash` 

**支持 svg 自动生成 iconfont**

在 `src/componentns/svg` 下的 `svg` 文件自动生成 `iconfont`
其他用途的 `svg` 自行放在其他目录

