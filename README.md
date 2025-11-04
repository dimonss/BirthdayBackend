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

______________________________________________________

🎉 Бот для поздравлений с днём рождения

Telegram-бот, который позволяет пользователям отправлять персональные поздравления с днём рождения через фотографии и аудиосообщения. Все поздравления отображаются на специальном сайте празднования дня рождения.

💡 Основные возможности

Загрузка фото — пользователи могут отправлять фотографии, которые будут показаны на сайте поздравлений

Аудиосообщения — можно отправлять голосовые или аудиофайлы вместе с поздравлением

Персональные папки — у каждого пользователя создаётся своя папка для хранения файлов

Автоматическое обновление — новые файлы заменяют старые, чтобы всегда отображалось актуальное содержимое

⚙️ Как это работает

Пользователь отправляет фото или аудиосообщение боту в Telegram

Бот автоматически сохраняет эти файлы в отдельную папку пользователя

Сайт дня рождения отображает эти персональные поздравления

Если пользователь отправляет новые файлы, старые автоматически заменяются

🧠 Технические детали

Реализовано на Node.js и TypeScript

Используется Telegram Bot API

Медиафайлы сохраняются в структурированных директориях

Поддерживаются как фото, так и аудио файлы

🚀 Установка

Клонируйте репозиторий

Установите зависимости:

npm install


Создайте файл .env и укажите токен вашего Telegram-бота:

BOT_TOKEN=ваш_токен_бота


Запустите бота:

npm start

🎧 Использование

Найдите бота в Telegram

Отправьте ему фотографию или аудиосообщение

Ваш контент автоматически появится на сайте поздравлений

📁 Структура проекта
birthday-bot/
├── index.ts          # Основная логика бота
├── pages/            # Хранилище пользовательских медиафайлов
│   └── username/     # Папка отдельного пользователя
│       ├── photo.jpg # Фото пользователя
│       └── audio.mp3 # Аудиопоздравление
├── package.json      # Зависимости проекта
└── tsconfig.json     # Конфигурация TypeScript

🤝 Участие в разработке

Вы можете отправлять предложения по улучшению и сообщать об ошибках через issues!

📜 Лицензия

Проект распространяется под лицензией MIT.