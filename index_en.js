// Cloudflare Worker for Telegram Bot with Image Generation

// Helper function to access environment variables
const env = name => globalThis[name];

// Define command list and handlers
const commandHandlers = {
  '/start': {
    description: 'Start using the bot',
    fn: handleStart,
  },
  '/help': {
    description: 'Show help information',
    fn: handleHelp,
  },
  '/img': {
    description: 'Generate image',
    fn: handleImageGeneration,
    imageSize: '1024x1024',
  },
};

// Helper function to send a Telegram request (optimized for code reuse)
async function sendTelegramRequest(method, params) {
  const url = `https://api.telegram.org/bot${env('TELEGRAM_BOT_TOKEN')}/${method}`;
  console.log(`Sending Telegram request to ${method}`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  const result = await response.json();
  console.log(`Telegram API response:`, result);

  if (!result.ok) {
    if (result.error_code === 400 && result.description.includes('group chat was upgraded to a supergroup chat')) {
      const newChatId = result.parameters.migrate_to_chat_id;
      console.log(`Chat upgraded to supergroup. New chat ID: ${newChatId}`);
      // Update chat_id in parameters and retry the request
      params.chat_id = newChatId;
      return sendTelegramRequest(method, params);
    }
    throw new Error(`Telegram API error: ${result.description}`);
  }

  return result;
}

// Helper function to send a response to Telegram
async function sendMessage(chatId, text, parseMode = 'Markdown') {
  console.log(`Sending message to chat ${chatId}: ${text}`);
  return sendTelegramRequest('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
  });
}

// Helper function to send a photo to Telegram
async function sendPhoto(chatId, photoUrl, caption = '') {
  console.log(`Sending photo to chat ${chatId}: ${photoUrl}`);
  return sendTelegramRequest('sendPhoto', {
    chat_id: chatId,
    photo: photoUrl,
    caption,
  });
}

// Helper function to send chat action to Telegram
async function sendChatAction(chatId, action = 'upload_photo') {
  console.log(`Sending chat action ${action} to chat ${chatId}`);
  return sendTelegramRequest('sendChatAction', {
    chat_id: chatId,
    action,
  });
}

// Function to revise the sentence using OpenAI
async function reviseSentenceToPrompt(sentence) {
  console.log(`Revising prompt: ${sentence}`);
  const openaiPrompt = `TEXT-TO-IMAGE PROMPT GENERATOR
## OBJECTIVE
Convert user input into a concise, effective text-to-image prompt.

## OUTPUT STRUCTURE
- Single paragraph, comma-separated
- Maximum 50 words, aim for 30-40
- Always start with: "masterpiece, best quality, 8k"
- Include: style, main subject, key scene elements

## INSTRUCTIONS
1. Extract key visual elements from user input
2. Determine style:
   - Use explicitly mentioned style if provided
   - If no style mentioned, infer from description or use "photorealistic"
3. Prioritize main subject and essential scene elements
4. Add brief details on composition, lighting, or color if word count allows
5. Generate ONE prompt in English
6. Return ONLY the generated prompt

## EXAMPLES
User Input: "A cat sitting on a windowsill"
Output: masterpiece, best quality, 8k, photorealistic, orange tabby cat, alert posture, sunlit wooden windowsill, soft focus cityscape outside, warm afternoon light

User Input: "Futuristic city in anime style"
Output: masterpiece, best quality, 8k, anime, sprawling futuristic metropolis, towering skyscrapers, flying vehicles, neon lights, dynamic composition, vibrant color palette

## EXECUTION
Input: ${sentence}
Output: [Generated prompt based on above guidelines]`;

  console.log(`Sending request to OpenAI API`);
  const response = await fetch(`${env('OPENAI_API_BASE')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env('OPENAI_MODEL'),
      messages: [{ role: 'user', content: openaiPrompt }],
    }),
  });

  if (!response.ok) {
    console.error(`OpenAI API responded with status ${response.status}`);
    const text = await response.text();
    console.error(`OpenAI API response: ${text}`);
    throw new Error(`OpenAI API responded with status ${response.status}`);
  }

  const data = await response.json();
  const revisedPrompt = data.choices[0].message.content.trim();
  console.log(`Revised prompt: ${revisedPrompt}`);
  return revisedPrompt;
}

// Function to generate image using the API
async function generateImage(prompt, imageSize) {
  console.log(`Generating image with prompt: ${prompt}`);
  console.log(`Sending request to Image Generation API`);
  const response = await fetch(env('IMAGE_GEN_API_BASE'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env('IMAGE_GEN_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      image_size: imageSize,
      num_inference_steps: 50,
    }),
  });

  if (!response.ok) {
    console.error(`Image API responded with status ${response.status}`);
    const text = await response.text();
    console.error(`Image API error response: ${text}`);
    throw new Error(`Image API responded with status ${response.status}`);
  }

  const data = await response.json();
  console.log(`Full Image API response: ${JSON.stringify(data, null, 2)}`);

  if (data.images && data.images.length > 0 && data.images[0].url) {
    console.log(`Generated image URL: ${data.images[0].url}`);
    return data.images[0].url;
  } else {
    console.error('Unexpected API response format:', data);
    throw new Error('No image URL found in the API response');
  }
}

// Function to handle /start command
async function handleStart(chatId) {
  console.log(`Handling /start command for chat ${chatId}`);
  const welcomeMessage = "Welcome to your creative journey! ✨ Get ready for me to create unique images for you. Want to know how to play? Use /help to find out~";
  await sendMessage(chatId, welcomeMessage);
}

// Updated Function to handle /help command
async function handleHelp(chatId) {
  console.log(`Handling /help command for chat ${chatId}`);
  const helpMessage = `Available commands:
/start - Start using the bot
/help - Show help information
/img [aspect ratio] <description> - Generate image

When generating an image, you can add the following aspect ratio options before the description:
1:1 (default, 1024x1024), 
1:2 (512x1024), 
3:2 (768x512), 
3:4 (768x1024), 
16:9 (1024x576), 
9:16 (576x1024)

For example: /img 3:4 a cat sitting on a windowsill

Note: Remember to leave a space between the aspect ratio and the description when using the /img command. If no aspect ratio is specified, I will generate a 1:1 image by default.`;

  await sendMessage(chatId, helpMessage);
}

// Updated Function to handle image generation commands
async function handleImageGeneration(chatId, message, defaultImageSize) {
  console.log(`Handling image generation command for chat ${chatId}`);
  const parts = message.text.split(' ');
  const command = parts[0];
  let imageSize = defaultImageSize;
  let promptStart = 1;

  // Check if the second part is a valid aspect ratio
  const ratioPart = parts[1];
  const validRatios = ['1:1', '1:2', '3:2', '3:4', '16:9', '9:16'];
  if (ratioPart && ratioPart.includes(':')) {
    if (validRatios.includes(ratioPart)) {
      imageSize = getImageSize(ratioPart);
      promptStart = 2;
    } else {
      // If an invalid ratio is provided
      await sendMessage(chatId, `The image aspect ratio "${ratioPart}" is invalid. Please use /help to view the available aspect ratio options.`);
      return;
    }
  }

  const prompt = parts.slice(promptStart).join(' ');

  console.log(`Command: ${command}, Image Size: ${imageSize}, Prompt: ${prompt}`);

  if (!prompt) {
    await sendMessage(chatId, `Generating images is simple! Use ${command} [aspect ratio] <description>. Need more help? Use /help for detailed instructions.`);
    return;
  }

  if (imageSize === defaultImageSize && promptStart === 1) {
    await sendMessage(chatId, `No aspect ratio specified? No problem, I'll generate a 1:1 (1024x1024) image by default. You can also add the aspect ratio before the description, for example: /img 3:4 <description>.`);
  }

  try {
    // Send "uploading photo" action
    await sendChatAction(chatId, 'upload_photo');

    console.log(`Original prompt: ${prompt}`);
    const revisedPrompt = await reviseSentenceToPrompt(prompt);
    console.log(`Revised prompt: ${revisedPrompt}`);

    // Send another "uploading photo" action to keep the status active
    await sendChatAction(chatId, 'upload_photo');

    const imageUrl = await generateImage(revisedPrompt, imageSize);

    if (imageUrl) {
      const caption = `Prompt used: ${revisedPrompt}`;
      await sendPhoto(chatId, imageUrl, caption);
      console.log(`Successfully sent image to chat ${chatId}`);
    } else {
      await sendMessage(chatId, "Failed to generate image. Please try a different description.");
      console.error(`Failed to generate image for prompt: ${revisedPrompt}`);
    }
  } catch (error) {
    console.error('Error:', error);
    await sendMessage(chatId, `An error occurred while processing your request: ${error.message}. Please try again later or contact support.`);
  }
}

// Function to get image size based on ratio
function getImageSize(ratio) {
  const sizeMap = {
    '1:1': '1024x1024',
    '1:2': '512x1024',
    '3:2': '768x512',
    '3:4': '768x1024',
    '16:9': '1024x576',
    '9:16': '576x1024'
  };
  return sizeMap[ratio] || '1024x1024'; // Default to 1:1 if ratio is not recognized
}

// Function to handle unknown commands
async function handleUnknownCommand(chatId, message) {
  console.log(`Handling unknown command for chat ${chatId}`);
  await sendMessage(chatId, "Unknown command. Use /help to view available commands.");
}

// Main handler for the Cloudflare Worker
addEventListener('fetch', event => {
  console.log('Received a fetch event');
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  console.log('Handling request');
  console.log(`Request method: ${request.method}`);
  console.log(`Request URL: ${request.url}`);

  // Print all request headers
  console.log('Request headers:');
  for (let [key, value] of request.headers.entries()) {
    console.log(`${key}: ${value}`);
  }

  console.log(`IMAGE_GEN_API_BASE: ${env('IMAGE_GEN_API_BASE')}`);
  console.log(`IMAGE_GEN_API_KEY: ${env('IMAGE_GEN_API_KEY').substring(0, 5)}...`);
  console.log('TELEGRAM_BOT_TOKEN:', env('TELEGRAM_BOT_TOKEN') ? 'Set' : 'Not set');
  console.log('WHITELISTED_USERS:', env('WHITELISTED_USERS'));
  console.log('OPENAI_API_BASE:', env('OPENAI_API_BASE'));
  console.log('OPENAI_API_KEY:', env('OPENAI_API_KEY') ? 'Set' : 'Not set');
  console.log('OPENAI_MODEL:', env('OPENAI_MODEL'));

  if (request.method !== 'POST') {
    console.log('Received non-POST request');
    return new Response('Send a POST request to this endpoint.', { status: 405 });
  }

  let body;
  try {
    body = await request.json();
    console.log('Request body:', JSON.stringify(body));
  } catch (error) {
    console.error('Error parsing request body:', error);
    return new Response('Invalid JSON in request body', { status: 400 });
  }

  // Handle different update types
  let messageObj;
  if (body.message) {
    messageObj = body.message;
  } else if (body.edited_message) {
    messageObj = body.edited_message;
  } else if (body.my_chat_member) {
    console.log('Received chat member update');
    return new Response('OK', { status: 200 });
  } else {
    console.log('Unhandled update type:', Object.keys(body));
    return new Response('OK', { status: 200 });
  }

  // Handle special message types
  if (messageObj.new_chat_participant || messageObj.new_chat_member) {
    console.log('Bot added to a new chat');
    // You can add a welcome message here
    return new Response('OK', { status: 200 });
  }

  if (messageObj.migrate_from_chat_id) {
    console.log(`Group ${messageObj.migrate_from_chat_id} upgraded to supergroup ${messageObj.chat.id}`);
    // You can add logic here to update the group ID in your database or cache
    return new Response('OK', { status: 200 });
  }

  if (!messageObj.text && !messageObj.caption) {
    console.log('Message without text or caption:', messageObj);
    return new Response('OK', { status: 200 });
  }

  const text = messageObj.text || messageObj.caption || '';
  const chatId = messageObj.chat.id;
  const userId = messageObj.from ? messageObj.from.id : null;

  console.log('User ID:', userId);
  console.log('Chat ID:', chatId);

  // Check if the user is whitelisted
  const whitelistedUsers = env('WHITELISTED_USERS').split(',').map(Number);
  const isUserWhitelisted = userId && whitelistedUsers.includes(userId);

  if (text.startsWith('/')) {
    if (!isUserWhitelisted) {
      console.log(`User ${userId} is not whitelisted`);
      await sendMessage(chatId, "You do not have permission to call~");
      return new Response('OK', { status: 200 });
    }

    // Extract the command, removing the possible "@botname" part
    const fullCommand = text.split(' ')[0].toLowerCase();
    const command = fullCommand.split('@')[0];
    console.log('Received command:', command);

    if (command in commandHandlers) {
      let handler = commandHandlers[command].fn;
      console.log('Handler found for command:', commandHandlers[command].description);
      await handler(chatId, messageObj, commandHandlers[command].imageSize);
    } else {
      console.log('Unknown command');
      await handleUnknownCommand(chatId, messageObj);
    }
  } else {
    console.log('Not a command');
  }

  return new Response('OK', { status: 200 });
}
