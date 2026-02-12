// Конфигурация метаданных для разных типов событий
export interface EventMetadata {
    title: string;
    description: string;
    keywords: string;
    name: string;
}

export interface TemplateMetadata {
    name: string;
    description: string;
}

// Метаданные для разных типов событий
export const EVENT_METADATA: Record<string, EventMetadata> = {
    'birthday': {
        title: 'С днём рождения!',
        description: 'Персональное поздравление с днём рождения',
        keywords: 'день рождения, поздравление, праздник, торжество, именинник',
        name: 'День рождения'
    },
    'anniversary': {
        title: 'С юбилеем!',
        description: 'Торжественное поздравление с юбилеем',
        keywords: 'юбилей, поздравление, годовщина, торжество, праздник',
        name: 'Юбилей'
    },
    'wedding': {
        title: 'С днём свадьбы!',
        description: 'Романтичное поздравление со свадьбой',
        keywords: 'свадьба, поздравление, бракосочетание, любовь, семья',
        name: 'Свадьба'
    },
    'birth': {
        title: 'С рождением малыша!',
        description: 'Трогательное поздравление с рождением ребёнка',
        keywords: 'рождение, малыш, ребёнок, поздравление, семья, радость',
        name: 'Рождение ребёнка'
    },
    'valentine': {
        title: 'С Днём влюблённых!',
        description: 'Романтическое поздравление с Днём святого Валентина',
        keywords: 'день влюблённых, валентинка, любовь, романтика, 14 февраля',
        name: 'День святого Валентина'
    }
};

// Метаданные для разных шаблонов
export const TEMPLATE_METADATA: Record<string, TemplateMetadata> = {
    'indexFirst': {
        name: 'Яркий и веселый',
        description: 'Цветной шаблон с конфетти и анимациями'
    },
    'indexTwo': {
        name: 'Современный темный',
        description: 'Стильный темный шаблон с эффектами стекла'
    },
    'indexThree': {
        name: 'Элегантный золотой',
        description: 'Изысканный шаблон в золотых тонах'
    },
    'indexValentine': {
        name: 'Романтический',
        description: 'Романтический шаблон с сердечками для Дня влюблённых'
    }
};

// Функция для получения метаданных события
export function getEventMetadata(eventId: string): EventMetadata {
    return EVENT_METADATA[eventId] || EVENT_METADATA['birthday'];
}

// Функция для получения метаданных шаблона
export function getTemplateMetadata(templateId: string): TemplateMetadata {
    return TEMPLATE_METADATA[templateId] || TEMPLATE_METADATA['indexFirst'];
}

// Функция для замены маркеров в HTML шаблоне
export function replaceMetadataMarkers(
    htmlContent: string,
    eventId: string,
    templateId: string,
    pageUrl: string = '',
    creationDate: string = '',
    modificationDate: string = ''
): string {
    const eventMeta = getEventMetadata(eventId);
    const templateMeta = getTemplateMetadata(templateId);

    // Заменяем маркеры в HTML
    return htmlContent
        .replace(/{{EVENT_TITLE}}/g, eventMeta.title)
        .replace(/{{EVENT_DESCRIPTION}}/g, eventMeta.description)
        .replace(/{{EVENT_KEYWORDS}}/g, eventMeta.keywords)
        .replace(/{{EVENT_NAME}}/g, eventMeta.name)
        .replace(/{{TEMPLATE_NAME}}/g, templateMeta.name)
        .replace(/{{PAGE_URL}}/g, pageUrl)
        .replace(/{{CREATION_DATE}}/g, creationDate)
        .replace(/{{MODIFICATION_DATE}}/g, modificationDate);
}
