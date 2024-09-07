<h1 align="center">
Flux-Telegram-Workers
</h1>

<p align="center">
    <br> <a href="README.md">English</a> | 中文
</p>
<p align="center">
    <em>轻松在Cloudflare Workers上部署你自己的Telegram FLUX机器人。</em>
</p>


## 关于

最简单快捷部署属于自己的FLUX Telegram机器人的方法。使用Cloudflare Workers，单文件，直接复制粘贴完事，无需任何依赖，无需配置本地开发环境，不用域名，服务器都不用。

<details>
<summary>查看Demo</summary>
<img style="max-width: 600px;" alt="image" src="doc/demo1.png">
<img style="max-width: 600px;" alt="image" src="doc/demo2.png">
</details>


## Bot的工作流程
在 Cloudflare Worker 上运行，并调用指定的兼容 OpenAI API 的模型来优化提示词，最后使用 Silicon Flow 的 API 来生成图像，并且在图像下方显示经过优化后的提示词。

## 文档

- [部署Cloudflare Workers](./doc/cn/DEPLOY.md)

## 许可证

**FLUX-Telegram-Workers** 以 MIT 许可证发布。[详见 LICENSE](LICENSE) 获取详情。
