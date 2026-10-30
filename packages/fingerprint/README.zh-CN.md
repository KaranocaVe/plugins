# Magpie Fingerprint

[English](README.md) · [Magpie](https://github.com/yetone/magpie) · [lm-detector](https://github.com/Ikaleio/lm-detector)

在 Magpie 内检查疑似模型替换：比较不同渠道的同名模型，或在服务变化后重新采样。复用已有登录与网关配置，基于 `lmfpd-sdk` 的数字指纹展示参考库中的相近候选，为核查保留证据。候选排名不能单独证明模型身份。

![检测界面，图中为明确标识的示例数据](docs/preview.png)

- 一批最多选择 24 个模型，共用三个挑战，便于横向比较。
- 实时显示采样数量与状态，支持取消、总超时和并发设置。
- 保存实际路由、原始回答、推理参数与参考库版本。
- 展示候选排名、模型家族和部分样本等状态。
- 复用 Magpie 原生页面桥接、控件样式与设计变量，主题和语言跟随宿主。
- 本地历史、JSON 导出与复制；紧凑列表、键盘切换与窄屏布局。

## 安装

在 Magpie 的 **Plugins → Discover** 中安装 **Fingerprint**，也可执行：

```sh
magpie plugin add @magpie-community/page-fingerprint
```

需要支持 `page.service` 的当前 Magpie 版本和 Bun 1.4.2+。启用后，从侧栏「模型指纹」或 provider 菜单「检测指纹」进入。点击开始会为每个模型发送三条采样请求，消耗对应通道的额度。

## 开发

在 `packages/fingerprint/` 中运行以下命令。源码、测试和可安装的 `dist/` 均纳入版本控制；MIT SDK 0.2.0 固定在 `vendor/lmfpd-sdk/`。安装插件及运行离线测试无需下载包，仅重建 UI、执行类型检查需要开发依赖。构建工具版本固定在 `package.json`；源码更新后重建并提交 `dist/`，不依赖安装或打包时执行脚本。

独立项目及发布记录见 [KaranocaVe/magpie-fingerprint](https://github.com/KaranocaVe/magpie-fingerprint)。

```sh
bun install
bun run check
bun start
```

页面服务默认监听 `3488`，通过 `http://127.0.0.1:3425` 使用 Magpie 网关。首次加载会下载并缓存 lm-detector 参考库，刷新可重新检查；参考库下载不携带 provider 凭证或模型回答。仅主动开始任务才会通过网关发送采样提示。网关认证、`magpie web`、环境变量和显式的 `--demo` fixture 见 [integration.md](integration.md)。

## 范围与限制

首版实现数字指纹，分词器探测留待后续。概率只在参考库候选中分配，不能当成模型身份的证明。Magpie 的 middleware 和协议适配仍会生效；检测到实际 provider/model 变化时，该目标停止评分。固定账号可选，支持填写账号标识；已缓存的订阅账号可供补全。

`bun start --demo` 提供独立的示例模式，不调用真实模型。任务被宿主重启打断后会标为「已中断」，保留已收到的回答。

采用 MIT 许可证。第三方声明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
