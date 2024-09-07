### 需要材料如下：

1. **SiliconFlow** API Key，账号自己注册 [**SiliconFlow**](https://siliconflow.cn/)，你自己去搞定就行，反正现在 **SiliconFlow** 的 Flux 还能白嫖。
2. 一个 **Cloudflare** 账号。
3. 一个 Telegram 账号。
4. 一个还能用的键盘（Ctrl+C, Ctrl+V）。
5. 没了吧？应该...

### 获取 SiliconFlow API Key

首先获取 **SiliconFlow** API Key，记下来。

### 新建 Telegram 机器人，获得 Bot Token

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_1.png">

**获取流程：**

1. 打开 Telegram 并向 BotFather 发送 `/start` 命令。
2. 发送 `/newbot` 命令，并给你的机器人起一个名字。
3. 给你的机器人取一个唯一的用户名，以 `_bot` 结尾。
4. BotFather 会生成一个 Token，复制下来保存好，这个 Token 是和你的机器人绑定的密钥，不要泄露给他人！
5. 记下来，在下面的设置中将这个 Token 填入 **TELEGRAM_BOT_TOKEN** 变量中。

### Cloudflare 设置

然后打开 **Cloudflare**，登录，开始创建 Worker：

#### 创建一个 Worker

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_2.png">

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_3.png">

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_4.png">

名字自己改，点击“部署”。

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_5.png">

然后选择“继续处理项目”。

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_6.png">

#### 设置环境变量

点击“设置”---“变量”---“添加变量”。

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_7.png">

添加以下变量：


- **IMAGE_GEN_API_KEY**: 你自己的 **SiliconFlow** API Key。
- **IMAGE_GEN_API_BASE**: `https://api.siliconflow.cn/v1/black-forest-labs/FLUX.1-schnell/text-to-image`。
- **OPENAI_API_BASE**: 你想调用的兼容 OpenAI API 的模型的 API Base，比如 `https://123.321.com/v1`。
- **OPENAI_API_KEY**: 你想调用的兼容 OpenAI API 的模型的 Key。
- **OPENAI_MODEL**: 你想调用的兼容 OpenAI API 的模型名称，比如 `gpt-4o`。
- **TELEGRAM_BOT_TOKEN**: 上面获取的 Bot Token。
- **WHITELISTED_USERS**: 用户 ID 白名单，没有加入白名单的用户将无法调用 Bot！！！多用户的话请使用逗号（英文逗号！！！）隔开。不知道自己的用户 ID？在 Telegram 中添加 @getmyid_bot (https://t.me/getmyid_bot) 获取。

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_8.png">

完事了记得点击“部署”。

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_9.png">

#### 配置 Telegram Webhook

1. 在 Worker 中点击“设置”--“触发器”--“路由”，在路由中的连接中鼠标右键选择“复制连接地址”。

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_10.png">


2. 打开浏览器，访问以下 URL（替换 `<YOUR_BOT_TOKEN>` 和 `<YOUR_WORKER_URL>`）：

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<YOUR_WORKER_URL>
```

其中的 `<YOUR_BOT_TOKEN>` 还是上面的 Token，`<YOUR_WORKER_URL>` 就是刚才你复制的连接地址。

**示例：**

```
https://api.telegram.org/bot123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ/setWebhook?url=https://abcdef-ghijk.workers.dev
```

3. 网页打开后你应该看到一个成功的响应，表明 Webhook 已设置。

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_11.png">

#### 最后一步：部署代码

1. 点击“Workers 和 Pages”---点击“概述”--选择你刚创建的 Worker。

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_12.png">

2. 点击“编辑代码”。

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_13.png">

3. 进入编辑页面，删除原来所有的代码，复制粘贴[`index.js`](/index_cn.js)的代码。

4. 完事记得点击“部署”。

### 好了，去爽吧。

### 注意

1. 必须完整设置好所有环境变量。
2. 必须使用 Webhook。
3. Bot 可以加入任何群组，也可以被任何人私聊，但只有加入白名单的用户可以调用 Bot，包括你自己。
