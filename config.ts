import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
export const ROOT_DIR = dirname(__filename);

// File size limits in bytes
export const PHOTO_SIZE_LIMIT = 500 * 1024; // 500KB
export const AUDIO_SIZE_LIMIT = 1024 * 1024; // 1MB

// Get environment variables
export const BOT_TOKEN = process.env.BOT_TOKEN;
export const USER_PAGE_URL = process.env.USER_PAGE_URL;
export const PAGES_DIR = process.env.PAGES_DIR;
export const MAIN_PAGE_URL = process.env.MAIN_PAGE_URL || '';
export const API_PORT = process.env.API_PORT ? parseInt(process.env.API_PORT) : 3000;

if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined in environment variables');
}

if (!USER_PAGE_URL) {
    throw new Error('USER_PAGE_URL is not defined in environment variables');
}

if (!PAGES_DIR) {
    throw new Error('PAGES_DIR is not defined in environment variables');
}

// Telegram API URL
export const TELEGRAM_API_URL = `https://api.telegram.org/file/bot${BOT_TOKEN}`;

// Available templates
export const AVAILABLE_TEMPLATES = [
    { id: 'indexFirst', name: '🎨 Яркий и веселый', description: 'Цветной шаблон с конфетти и анимациями' },
    { id: 'indexTwo', name: '🌙 Современный темный', description: 'Стильный темный шаблон с эффектами стекла' },
    { id: 'indexThree', name: '✨ Элегантный золотой', description: 'Изысканный шаблон в золотых тонах' },
    { id: 'indexValentine', name: '💕 Романтический', description: 'Романтический шаблон с сердечками для Дня влюблённых' }
];

// Available event types
export const AVAILABLE_EVENTS = [
    { id: 'birthday', name: '🎂 День рождения', description: 'Поздравление с днем рождения' },
    { id: 'anniversary', name: '🏆 Юбилей', description: 'Поздравление с юбилеем' },
    { id: 'wedding', name: '💒 Свадьба', description: 'Поздравление со свадьбой' },
    { id: 'birth', name: '👶 Рождение ребенка', description: 'Поздравление с рождением ребенка' },
    { id: 'valentine', name: '💕 День влюблённых', description: 'Поздравление с Днём святого Валентина' }
];

// Event text mapping for templates
export const EVENT_TEXTS: Record<string, string> = {
    'birthday': 'С днём рождения!',
    'anniversary': 'С юбилеем!',
    'wedding': 'С днём свадьбы!',
    'birth': 'С рождением малыша!',
    'valentine': 'С Днём влюблённых!'
};

// User template preferences storage
export const userTemplates = new Map<string, string>();

// User event preferences storage
export const userEvents = new Map<string, string>();
