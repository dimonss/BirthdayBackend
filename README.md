# Birthday Greeting Bot

A Telegram bot that allows users to create personalized greeting pages with photos, audio messages, and customizable HTML templates for various celebration events.

## Features

- **Multiple Event Types**: Birthday, Anniversary, Wedding, Baby Birth, Valentine's Day
- **Template Selection**: Choose from 4 visual themes (Bright, Dark, Gold, Romantic)
- **Photo Upload**: Send photos to display on the greeting page (up to 500KB)
- **Audio Messages**: Send voice messages or audio files (up to 1MB)
- **Personalized Pages**: Each user gets a unique web page with their greeting
- **HTTP API**: REST endpoint to list active greeting pages
- **Dev Server**: Local template preview server for development

## How It Works

1. Start the bot and choose an event type with `/event`
2. Select a visual template with `/template`
3. Send a photo and an audio message
4. Receive a link to your personalized greeting page
5. Update your greeting anytime by sending new media

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Start the bot |
| `/help` | Show help |
| `/event` | Choose event type |
| `/template` | Choose visual template |
| `/status` | Check greeting status |
| `/delete` | Delete your greeting |

## HTTP API

### `GET /pages`

Returns a sorted list of active greeting page folders (newest first). Only pages with both photo and audio are included.

**Response:**
```json
{ "folders": ["username1", "username2"] }
```

## Project Structure

```
BirthdayBackend/
├── index.ts              # Entry point — bot init & handler registration
├── config.ts             # Environment variables, constants, templates & events data
├── helpers.ts            # Utility functions (file ops, template copying, formatting)
├── api.ts                # Express HTTP API server (GET /pages)
├── metadata-config.ts    # HTML metadata configuration & marker replacement
├── database.ts           # SQLite database operations
├── bot/
│   ├── commands.ts       # Bot command handlers (/start, /help, /event, etc.)
│   ├── messages.ts       # Photo & audio message handlers
│   └── callbacks.ts      # Inline keyboard callback handlers
├── htmlTemplates/        # HTML greeting page templates
├── htmlAssets/           # Shared assets (images, audio) for templates
├── dev-server.ts         # Local dev server for template preview
├── dev-server/           # Dev server UI template
├── package.json
└── tsconfig.json
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   BOT_TOKEN=your_telegram_bot_token
   USER_PAGE_URL=https://your-domain.com/pages
   PAGES_DIR=/path/to/pages/directory
   API_PORT=3000
   ```
4. Build and start:
   ```bash
   npm run build
   npm start
   ```

## Development

- **Preview templates locally:**
  ```bash
  npm run dev:preview
  ```
  Opens at `http://localhost:3000` with a list of all available templates.

- **Build in watch mode:**
  ```bash
  npm run watch
  ```

## Tech Stack

- **Runtime**: Node.js ≥ 18
- **Language**: TypeScript
- **Bot**: node-telegram-bot-api
- **HTTP Server**: Express
- **Database**: SQLite (sqlite3)

## License

This project is licensed under the **MIT** License.

______________________________________________________

# Бот поздравлений

Телеграм-бот для создания персонализированных страниц поздравлений с фото, аудио и выбором HTML-шаблонов для различных событий.

## Возможности

- **Типы событий**: День рождения, Юбилей, Свадьба, Рождение ребёнка, День влюблённых
- **Выбор шаблонов**: 4 визуальные темы (Яркий, Тёмный, Золотой, Романтический)
- **Загрузка фото**: отправка фото для страницы поздравления (до 500KB)
- **Аудиосообщения**: голосовые или аудиофайлы (до 1MB)
- **Персональные страницы**: каждый пользователь получает уникальную веб-страницу
- **HTTP API**: REST-эндпоинт для получения списка активных страниц
- **Dev-сервер**: локальный сервер для превью шаблонов

---

## Как это работает

1. Запустите бота и выберите тип события командой `/event`
2. Выберите визуальный шаблон командой `/template`
3. Отправьте фото и аудиосообщение
4. Получите ссылку на персональную страницу поздравления
5. Обновляйте поздравление в любой момент, отправив новые медиафайлы

---

## Команды бота

| Команда | Описание |
|---------|----------|
| `/start` | Начать работу с ботом |
| `/help` | Показать справку |
| `/event` | Выбрать тип события |
| `/template` | Выбрать шаблон поздравления |
| `/status` | Проверить статус поздравления |
| `/delete` | Удалить поздравление |

---

## HTTP API

### `GET /pages`

Возвращает отсортированный список папок с активными страницами (новые первыми). Включаются только страницы с загруженными фото и аудио.

**Ответ:**
```json
{ "folders": ["username1", "username2"] }
```

---

## Структура проекта

```
BirthdayBackend/
├── index.ts              # Точка входа — инициализация бота и регистрация обработчиков
├── config.ts             # Переменные окружения, константы, данные шаблонов и событий
├── helpers.ts            # Утилиты (работа с файлами, копирование шаблонов, форматирование)
├── api.ts                # Express HTTP API сервер (GET /pages)
├── metadata-config.ts    # Конфигурация метаданных и замена маркеров в HTML
├── database.ts           # Операции с базой данных SQLite
├── bot/
│   ├── commands.ts       # Обработчики команд (/start, /help, /event и т.д.)
│   ├── messages.ts       # Обработка фото и аудио сообщений
│   └── callbacks.ts      # Обработка inline-клавиатуры
├── htmlTemplates/        # HTML-шаблоны страниц поздравлений
├── htmlAssets/           # Общие ассеты (изображения, аудио) для шаблонов
├── dev-server.ts         # Локальный dev-сервер для превью шаблонов
├── dev-server/           # UI-шаблон dev-сервера
├── package.json
└── tsconfig.json
```

---

## Настройка

1. Клонируйте репозиторий
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Создайте файл `.env`:
   ```env
   BOT_TOKEN=ваш_токен_бота
   USER_PAGE_URL=https://ваш-домен.com/pages
   PAGES_DIR=/путь/к/папке/pages
   API_PORT=3000
   ```
4. Сборка и запуск:
   ```bash
   npm run build
   npm start
   ```

---

## Разработка

- **Превью шаблонов локально:**
  ```bash
  npm run dev:preview
  ```
  Открывается на `http://localhost:3000` со списком всех доступных шаблонов.

- **Сборка в режиме наблюдения:**
  ```bash
  npm run watch
  ```

---

## Технологии

- **Среда выполнения**: Node.js ≥ 18
- **Язык**: TypeScript
- **Бот**: node-telegram-bot-api
- **HTTP-сервер**: Express
- **База данных**: SQLite (sqlite3)

---

## Лицензия

Этот проект распространяется под лицензией **MIT**.
