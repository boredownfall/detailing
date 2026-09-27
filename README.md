# PPF Select — MVP лидген-сайта

Готовый статический лендинг для лидогенерации на защитную оклейку PPF в Москве.

## Что уже есть
- премиальный responsive-дизайн;
- mobile sticky CTA;
- 6-шаговый квиз;
- ориентиры цен 55–75 тыс. ₽ и 230–250 тыс. ₽;
- гарантия 1 год на работы / до 5 лет на плёнку;
- сроки 1–4 дня;
- сбор UTM, referrer и landing URL;
- отправка лида в webhook;
- события для аналитики;
- базовые SEO meta, JSON-LD, robots.txt и sitemap.xml;
- блоки под реальные фото.

## 1. Что заменить перед публикацией
1. `PPF Select` — временное название. Найдите все вхождения и замените на финальный бренд.
2. В `index.html` замените `https://example.ru/` на ваш домен.
3. В `robots.txt` и `sitemap.xml` тоже замените `example.ru`.
4. Замените карточки «Добавить фото» реальными фотографиями.
5. Заполните юридическую информацию в `privacy.html`.

## 2. Подключение заявок
Откройте `script.js` и заполните:

```js
const CONFIG = {
  webhookUrl: "https://...",
  telegramUrl: "https://t.me/...",
  whatsappUrl: "https://wa.me/7..."
};
```

### Самый простой сценарий
Make.com:
1. Custom Webhook;
2. Telegram Bot → Send a message;
3. Google Sheets → Add a row.

В webhook прилетят: марка, модель, год, пакет, выбранные зоны, срок, контакты, UTM, referrer, URL и timestamp.

## 3. Публикация бесплатно
### Cloudflare Pages
- создайте новый Pages-проект;
- загрузите папку как static site (или подключите GitHub);
- build command не нужен;
- output directory — корень проекта.

### Vercel
- импортируйте GitHub-репозиторий;
- Framework Preset: Other;
- Build command: пусто;
- Output: `.`

## 4. SEO после запуска
Не создавайте сразу сотни страниц. Начните с 5–10 сильных страниц под реальные авто и реальные фото:
- BMW X5 / X7;
- Mercedes-Benz GLE / GLS;
- Li Auto L7 / L9;
- Zeekr 001;
- Voyah Free.

После появления данных расширяйте структуру `/cars/brand/model`.

## 5. Аналитика
В `script.js` уже заложены события:
- calculator_started
- car_brand_selected
- protection_package_selected
- calculator_step_completed
- lead_submitted

Для Яндекс Метрики достаточно подключить счётчик и задать `window.YM_COUNTER_ID`.


## Реальные заявки → Telegram

Форма теперь отправляет POST на `/api/lead`. Для работы задеплой папку проекта на Vercel и добавь Environment Variables:

- `TELEGRAM_BOT_TOKEN` — токен бота. Добавь его вручную в Vercel; в коде токена нет.
- `TELEGRAM_CHAT_ID` — `683525048`.
- `GOOGLE_SHEETS_WEBHOOK` — необязательно, URL Web App из `google-apps-script.gs`.

В Vercel открой **Project → Settings → Environment Variables** и добавь:

```text
TELEGRAM_BOT_TOKEN = <новый токен бота>
TELEGRAM_CHAT_ID = 683525048
```

Для обеих переменных отметь Production (и Preview, если хочешь тестировать preview-deploy). После изменения переменных сделай Redeploy.

Важно: токен бота хранится только в server-side Environment Variables. Не вставляй его в `index.html`, JavaScript браузера или публичный GitHub.

После заполнения формы посетитель получает success-state только если Telegram API подтвердил отправку сообщения.

### Как получить TELEGRAM_CHAT_ID

1. Открой своего бота в Telegram и нажми Start / отправь `/start`.
2. Получи числовой chat ID любым безопасным способом (например, через `getUpdates` Bot API локально) и добавь его в Vercel как `TELEGRAM_CHAT_ID`.

### Google Sheets

Файл `google-apps-script.gs` — готовый receiver. Вставь его в Apps Script, задеплой как Web App и добавь URL в `GOOGLE_SHEETS_WEBHOOK`. Telegram при этом остаётся основным каналом, поэтому сбой таблицы не теряет лид.
