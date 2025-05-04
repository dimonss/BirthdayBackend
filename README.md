# Birthday Greeting Bot

A Telegram bot that allows users to send personalized birthday greetings through photos and audio messages, which are then displayed on a birthday celebration website.

## Features

- **Photo Upload**: Users can send photos that will be displayed on the birthday website
- **Audio Messages**: Users can send voice messages or audio files to accompany their greetings
- **Personalized Folders**: Each user gets their own folder to store their media files
- **Automatic Updates**: New media files replace old ones, ensuring the latest content is always displayed

## How It Works

1. Users send photos or audio messages to the Telegram bot
2. The bot automatically saves these files in a dedicated folder for each user
3. The birthday website displays these personalized greetings
4. When a user sends new content, it automatically replaces their previous submission

## Technical Details

- Built with Node.js and TypeScript
- Uses the Telegram Bot API
- Stores media files in a structured directory system
- Supports both photos and audio files

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Telegram bot token:
   ```
   BOT_TOKEN=your_telegram_bot_token
   ```
4. Start the bot:
   ```bash
   npm start
   ```

## Usage

1. Find the bot on Telegram
2. Send a photo or audio message
3. Your content will automatically appear on the birthday website

## Project Structure

```
birthday-bot/
├── index.ts          # Main bot logic
├── pages/            # User media storage
│   └── username/     # Individual user folders
│       ├── photo.jpg # User's photo
│       └── audio.mp3 # User's audio message
├── package.json      # Project dependencies
└── tsconfig.json     # TypeScript configuration
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License. 