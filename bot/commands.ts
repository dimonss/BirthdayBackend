import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as path from 'path';
import {
    USER_PAGE_URL, PAGES_DIR,
    AVAILABLE_TEMPLATES, AVAILABLE_EVENTS,
    userTemplates, userEvents
} from '../config.js';
import { checkUserFiles, readClientConfig, writeClientConfig } from '../helpers.js';

export function registerCommands(bot: TelegramBot) {
    // Set bot commands
    bot.setMyCommands([
        { command: '/start', description: 'Начать работу с ботом' },
        { command: '/help', description: 'Показать справку' },
        { command: '/event', description: 'Выбрать тип события' },
        { command: '/template', description: 'Выбрать шаблон для поздравления' },
        { command: '/status', description: 'Проверить статус вашего поздравления' },
        { command: '/visibility', description: 'Отображение на главной странице' },
        { command: '/delete', description: 'Удалить ваше поздравление' }
    ]);

    // Handle /start command
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const username = msg.from?.username;

        if (!username) {
            await bot.sendMessage(
                chatId,
                'Добро пожаловать! 👋\n\n' +
                'Для использования бота необходимо установить username в настройках Telegram.\n\n' +
                'Как установить username:\n' +
                '1. Откройте настройки Telegram\n' +
                '2. Перейдите в раздел "Изменить профиль"\n' +
                '3. Нажмите на поле "Имя пользователя"\n' +
                '4. Введите желаемый username\n' +
                '5. Нажмите "Сохранить"\n\n' +
                'После установки username, напишите /start снова.'
            );
            return;
        }

        const userDir = path.join(PAGES_DIR!, username);
        const hasFiles = fs.existsSync(userDir) && checkUserFiles(userDir);

        const selectedTemplate = userTemplates.get(username);
        const templateInfo = selectedTemplate
            ? AVAILABLE_TEMPLATES.find(t => t.id === selectedTemplate)
            : null;

        const selectedEvent = userEvents.get(username);
        const eventInfo = selectedEvent
            ? AVAILABLE_EVENTS.find(e => e.id === selectedEvent)
            : null;

        await bot.sendMessage(
            chatId,
            'Добро пожаловать! 👋\n\n' +
            'Этот бот поможет вам создать персональное поздравление!\n\n' +
            'Как это работает:\n' +
            '1. Выберите тип события командой /event\n' +
            '2. Выберите шаблон командой /template\n' +
            '3. Отправьте фото для вашего поздравления\n' +
            '4. Отправьте аудио сообщение с вашими пожеланиями\n' +
            '5. Получите ссылку на вашу персональную страницу с поздравлением\n\n' +
            (eventInfo
                ? `Выбранное событие: ${eventInfo.name}\n`
                : '') +
            (templateInfo
                ? `Выбранный шаблон: ${templateInfo.name}\n\n`
                : '') +
            (hasFiles
                ? 'У вас уже есть готовое поздравление! Вы можете:\n' +
                '• Посмотреть его по ссылке: ' + `${USER_PAGE_URL}/${username}\n` +
                '• Изменить событие командой /event\n' +
                '• Изменить шаблон командой /template\n' +
                '• Обновить его, отправив новое фото или аудио'
                : 'Начните с выбора события командой /event!')
        );
    });

    // Handle /help command
    bot.onText(/\/help/, async (msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(
            chatId,
            '📚 Справка по использованию бота:\n\n' +
            '1. /start - Начать работу с ботом\n' +
            '2. /help - Показать эту справку\n' +
            '3. /event - Выбрать тип события\n' +
            '4. /template - Выбрать шаблон для поздравления\n' +
            '5. /status - Проверить статус вашего поздравления\n' +
            '6. /delete - Удалить ваше поздравление\n\n' +
            'Как создать поздравление:\n' +
            '1. Выберите тип события командой /event\n' +
            '2. Выберите шаблон командой /template\n' +
            '3. Отправьте фото (до 500KB)\n' +
            '4. Отправьте аудио сообщение (до 1MB)\n' +
            '5. Получите ссылку на вашу страницу\n\n' +
            'Доступные типы событий:\n' +
            '🎂 День рождения\n' +
            '🏆 Юбилей\n' +
            '💒 Свадьба\n' +
            '👶 Рождение ребенка\n\n' +
            'Вы можете обновить своё поздравление в любой момент, отправив новое фото или аудио.\n\n' +
            'Подсказка: если превью ссылки в Telegram не обновилось, отправьте её боту @WebpageBot — он обновит предпросмотр.'
        );
    });

    // Handle /event command
    bot.onText(/\/event/, async (msg) => {
        const chatId = msg.chat.id;
        const username = msg.from?.username;

        if (!username) {
            await bot.sendMessage(
                chatId,
                'Для выбора типа события необходимо установить username в настройках Telegram.'
            );
            return;
        }

        const keyboard = {
            inline_keyboard: AVAILABLE_EVENTS.map(event => [
                {
                    text: event.name,
                    callback_data: `event_${event.id}`
                }
            ])
        };

        let message = '🎉 Выберите тип события для поздравления:\n\n';

        await bot.sendMessage(chatId, message, { reply_markup: keyboard });
    });

    // Handle /template command
    bot.onText(/\/template/, async (msg) => {
        const chatId = msg.chat.id;
        const username = msg.from?.username;

        if (!username) {
            await bot.sendMessage(
                chatId,
                'Для выбора шаблона необходимо установить username в настройках Telegram.'
            );
            return;
        }

        const keyboard = {
            inline_keyboard: AVAILABLE_TEMPLATES.map(template => [
                {
                    text: template.name,
                    callback_data: `template_${template.id}`
                }
            ])
        };

        let message = '🎨 Выберите шаблон для вашего поздравления:\n\n';

        await bot.sendMessage(chatId, message, { reply_markup: keyboard });
    });

    // Handle /status command
    bot.onText(/\/status/, async (msg) => {
        const chatId = msg.chat.id;
        const username = msg.from?.username;

        if (!username) {
            await bot.sendMessage(
                chatId,
                'Для проверки статуса необходимо установить username в настройках Telegram.'
            );
            return;
        }

        const userDir = path.join(PAGES_DIR!, username);
        const hasPhoto = fs.existsSync(path.join(userDir, 'img.jpg'));
        const hasAudio = fs.existsSync(path.join(userDir, 'audio.mp3'));

        const selectedTemplate = userTemplates.get(username);
        const templateInfo = selectedTemplate
            ? AVAILABLE_TEMPLATES.find(t => t.id === selectedTemplate)
            : null;

        const selectedEvent = userEvents.get(username);
        const eventInfo = selectedEvent
            ? AVAILABLE_EVENTS.find(e => e.id === selectedEvent)
            : null;

        let statusMessage = '📊 Статус вашего поздравления:\n\n';
        statusMessage += `Событие: ${eventInfo ? `✅ ${eventInfo.name}` : '❌ Не выбрано'}\n`;
        statusMessage += `Шаблон: ${templateInfo ? `✅ ${templateInfo.name}` : '❌ Не выбран'}\n`;
        statusMessage += `Фото: ${hasPhoto ? '✅ Загружено' : '❌ Отсутствует'}\n`;
        statusMessage += `Аудио: ${hasAudio ? '✅ Загружено' : '❌ Отсутствует'}\n\n`;

        if (hasPhoto && hasAudio) {
            statusMessage += `Ваше поздравление готово!\nПосмотреть его можно здесь:\n${USER_PAGE_URL}/${username}`;
            if (eventInfo) {
                statusMessage += `\n\nТип события: ${eventInfo.name}`;
            }
            if (templateInfo) {
                statusMessage += `\nШаблон: ${templateInfo.name}`;
            }
        } else {
            statusMessage += 'Для завершения поздравления необходимо:\n';
            if (!eventInfo) statusMessage += '• Выбрать событие командой /event\n';
            if (!templateInfo) statusMessage += '• Выбрать шаблон командой /template\n';
            if (!hasPhoto) statusMessage += '• Загрузить фото\n';
            if (!hasAudio) statusMessage += '• Загрузить аудио';
        }

        await bot.sendMessage(chatId, statusMessage);
    });

    // Handle /visibility command
    bot.onText(/\/visibility/, async (msg) => {
        const chatId = msg.chat.id;
        const username = msg.from?.username;

        if (!username) {
            await bot.sendMessage(
                chatId,
                'Для изменения настроек необходимо установить username в настройках Telegram.'
            );
            return;
        }

        const userDir = path.join(PAGES_DIR!, username);
        const config = readClientConfig(userDir);

        const currentStatus = config.showOnMainPage
            ? '✅ Ваше поздравление отображается на главной странице'
            : '❌ Ваше поздравление скрыто с главной страницы';

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '✅ Показывать', callback_data: 'visibility_yes' },
                    { text: '❌ Скрыть', callback_data: 'visibility_no' }
                ]
            ]
        };

        await bot.sendMessage(
            chatId,
            `🌐 Отображение на главной странице\n\n${currentStatus}\n\nВыберите действие:`,
            { reply_markup: keyboard }
        );
    });

    // Handle /delete command
    bot.onText(/\/delete/, async (msg) => {
        const chatId = msg.chat.id;
        const username = msg.from?.username;

        if (!username) {
            await bot.sendMessage(
                chatId,
                'Для удаления поздравления необходимо установить username в настройках Telegram.'
            );
            return;
        }

        const userDir = path.join(PAGES_DIR!, username);

        if (!fs.existsSync(userDir)) {
            await bot.sendMessage(chatId, 'У вас пока нет загруженных файлов.');
            return;
        }

        try {
            // Remove photo and audio files if they exist
            const photoPath = path.join(userDir, 'img.jpg');
            const audioPath = path.join(userDir, 'audio.mp3');

            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
            }

            // Create default template instead of deleting directory
            const { copyDefaultTemplate } = await import('../helpers.js');
            copyDefaultTemplate(userDir, username);

            // Clear template and event preferences
            userTemplates.delete(username);
            userEvents.delete(username);

            await bot.sendMessage(
                chatId,
                '✅ Ваше поздравление успешно удалено.\nВы можете создать новое, выбрав событие командой /event.'
            );
        } catch (error) {
            console.error('Error deleting user files:', error);
            await bot.sendMessage(chatId, '❌ Произошла ошибка при удалении файлов. Пожалуйста, попробуйте позже.');
        }
    });
}
