import TelegramBot from 'node-telegram-bot-api';
import * as path from 'path';
import {
    PAGES_DIR,
    AVAILABLE_TEMPLATES, AVAILABLE_EVENTS,
    userTemplates, userEvents
} from '../config.js';
import { checkUserFiles, copyHtmlTemplate, readClientConfig, writeClientConfig } from '../helpers.js';

export function registerCallbackHandlers(bot: TelegramBot) {
    bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message?.chat.id;
        const username = callbackQuery.from?.username;
        const data = callbackQuery.data;

        if (!chatId || !username || !data) {
            return;
        }

        // Handle visibility consent
        if (data === 'visibility_yes' || data === 'visibility_no') {
            const userDir = path.join(PAGES_DIR!, username);
            const showOnMainPage = data === 'visibility_yes';
            const config = readClientConfig(userDir);
            config.showOnMainPage = showOnMainPage;
            writeClientConfig(userDir, config);

            await bot.answerCallbackQuery(callbackQuery.id, {
                text: showOnMainPage ? 'Поздравление будет показано' : 'Поздравление скрыто'
            });

            await bot.editMessageText(
                showOnMainPage
                    ? '✅ Ваше поздравление теперь отображается на главной странице!\n\nИзменить: /visibility'
                    : '❌ Ваше поздравление скрыто с главной страницы.\n\nИзменить: /visibility',
                {
                    chat_id: chatId,
                    message_id: callbackQuery.message?.message_id
                }
            );
            return;
        }

        // Handle event selection
        if (data.startsWith('event_')) {
            const eventId = data.replace('event_', '');
            const selectedEvent = AVAILABLE_EVENTS.find(e => e.id === eventId);

            if (!selectedEvent) {
                await bot.answerCallbackQuery(callbackQuery.id, { text: 'Событие не найдено' });
                return;
            }

            // Save user's event preference
            userEvents.set(username, eventId);

            // Update existing page if user has both files
            const userDir = path.join(PAGES_DIR!, username);
            if (checkUserFiles(userDir)) {
                const selectedTemplate = userTemplates.get(username) || 'indexFirst';
                copyHtmlTemplate(userDir, selectedTemplate, eventId, username);
            }

            await bot.answerCallbackQuery(callbackQuery.id, {
                text: `Выбрано событие: ${selectedEvent.name}`
            });

            await bot.editMessageText(
                `✅ Событие "${selectedEvent.name}" выбрано!\n\n` +
                `Описание: ${selectedEvent.description}\n\n` +
                (checkUserFiles(userDir)
                    ? 'Ваша страница обновлена с новым событием!'
                    : 'Теперь выберите шаблон командой /template и загрузите фото и аудио для создания поздравления.'),
                {
                    chat_id: chatId,
                    message_id: callbackQuery.message?.message_id
                }
            );
            return;
        }

        // Handle template selection
        if (data.startsWith('template_')) {
            const templateId = data.replace('template_', '');
            const selectedTemplate = AVAILABLE_TEMPLATES.find(t => t.id === templateId);

            if (!selectedTemplate) {
                await bot.answerCallbackQuery(callbackQuery.id, { text: 'Шаблон не найден' });
                return;
            }

            // Save user's template preference
            userTemplates.set(username, templateId);

            // Update existing page if user has both files
            const userDir = path.join(PAGES_DIR!, username);
            if (checkUserFiles(userDir)) {
                const selectedEvent = userEvents.get(username) || 'birthday';
                copyHtmlTemplate(userDir, templateId, selectedEvent, username);
            }

            await bot.answerCallbackQuery(callbackQuery.id, {
                text: `Выбран шаблон: ${selectedTemplate.name}`
            });

            await bot.editMessageText(
                `✅ Шаблон "${selectedTemplate.name}" выбран!\n\n` +
                `Описание: ${selectedTemplate.description}\n\n` +
                (checkUserFiles(userDir)
                    ? 'Ваша страница обновлена с новым шаблоном!'
                    : 'Когда вы загрузите фото и аудио, будет использован выбранный шаблон.'),
                {
                    chat_id: chatId,
                    message_id: callbackQuery.message?.message_id
                }
            );
        }
    });
}
