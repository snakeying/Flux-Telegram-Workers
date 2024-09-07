### Required Materials:

1. **SiliconFlow** API Key. Register your own account at [**SiliconFlow**](https://siliconflow.cn/). Just go get it yourself, SiliconFlow’s Flux is still free to use for now.
2. A **Cloudflare** account.
3. A Telegram account.
4. A working keyboard (Ctrl+C, Ctrl+V).
5. That’s it, I think…

### Getting the SiliconFlow API Key

First, get the **SiliconFlow** API Key and save it.

### Create a Telegram Bot and Get the Bot Token

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_1.png">

**Steps to Get It:**

1. Open Telegram and send the `/start` command to BotFather.
2. Send the `/newbot` command and give your bot a name.
3. Choose a unique username for your bot, ending with `_bot`.
4. BotFather will generate a Token. Copy it and keep it safe. This Token is the key tied to your bot, don’t share it with anyone!
5. Save it, and later fill in the **TELEGRAM_BOT_TOKEN** variable with this Token in the settings below.

### Cloudflare Setup

Then open **Cloudflare**, log in, and start creating a Worker:

#### Creating a Worker

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_2.png">

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_3.png">

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_4.png">

Give it a name, and click "Deploy."

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_5.png">

Then select "Continue to set up your project."

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_6.png">

#### Setting Environment Variables

Click "Settings" → "Variables" → "Add Variable."

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_7.png">

Add the following variables:

- **IMAGE_GEN_API_KEY**: Your own **SiliconFlow** API Key.
- **IMAGE_GEN_API_BASE**: `https://api.siliconflow.cn/v1/black-forest-labs/FLUX.1-schnell/text-to-image`.
- **OPENAI_API_BASE**: The API base of the OpenAI-compatible model you want to use, for example `https://123.321.com/v1`.
- **OPENAI_API_KEY**: The key for the OpenAI-compatible model you want to use.
- **OPENAI_MODEL**: The name of the OpenAI-compatible model you want to use, such as `gpt-4o`.
- **TELEGRAM_BOT_TOKEN**: The Bot Token you got earlier.
- **WHITELISTED_USERS**: User ID whitelist. Users not in the whitelist cannot use the Bot!!! For multiple users, separate them with commas (English commas!!!). Don’t know your user ID? Add @getmyid_bot (https://t.me/getmyid_bot) on Telegram to find out.

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_8.png">

Once done, remember to click "Deploy."

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_9.png">

#### Configuring the Telegram Webhook

1. In the Worker, click "Settings" → "Triggers" → "Routes," right-click on the connection in the Routes section and choose "Copy link address."

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_10.png">

2. Open a browser and visit the following URL (replace `<YOUR_BOT_TOKEN>` and `<YOUR_WORKER_URL>`):

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<YOUR_WORKER_URL>
```

Here, `<YOUR_BOT_TOKEN>` is the Token from earlier, and `<YOUR_WORKER_URL>` is the link address you just copied.

**Example:**

```
https://api.telegram.org/bot123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ/setWebhook?url=https://abcdef-ghijk.workers.dev
```

3. After visiting the URL, you should see a success response, indicating that the Webhook has been set.

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_11.png">

#### Final Step: Deploy the Code

1. Click "Workers and Pages" → Click "Overview" → Select the Worker you just created.

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_12.png">

2. Click "Edit Code."

<img style="max-width: 600px;" alt="image" src="/doc/pics/tutorial/tutorial_13.png">

3. In the editor, delete all existing code and copy-paste the code from [`index.js`](/index.js).

4. Once done, click "Deploy."

### That’s it, enjoy!

### Notes

1. All environment variables must be set properly.
2. Webhook must be used.
3. The Bot can join any group and be messaged by anyone, but only whitelisted users can call the Bot, including yourself.
