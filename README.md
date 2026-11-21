# BRONYA AUTO — лидген-сайт по защитной оклейке (PPF)

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

## 1. Что заполнить перед запуском

1. `index.html` → блок `CONFIG` в начале скрипта: `telegramUrl`, `whatsappUrl` (пока пусты — ссылки в футере скрыты).
2. `privacy.html` — подставить реквизиты оператора, e-mail, срок хранения (поля подсвечены жёлтым `.todo`).
3. Домен в canonical / sitemap / robots уже `bronya-auto.ru`.

## 2. Подключение заявок
Форма отправляет POST на `/api/lead` (см. раздел «Реальные заявки → Telegram» ниже). Webhook-вариант через Make.com больше не нужен.

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
Цели Яндекс Метрики (JS-событие, нужно создать в интерфейсе Метрики):
- calculator_started
- car_brand_selected
- protection_package_selected
- calculator_step_completed
- lead_success  _(основная цель)_

Счётчик Метрики (`113135482`) уже подключён во всех страницах.


## Реальные заявки → Telegram

Форма теперь отправляет POST на `/api/lead`. Для работы задеплой папку проекта на Vercel и добавь Environment Variables:

- `TELEGRAM_BOT_TOKEN` — токен бота. Добавь его вручную в Vercel; в коде токена нет.
- `TELEGRAM_CHAT_ID` — `683525048`.
- `GOOGLE_SHEETS_WEBHOOK` — необязательно, URL Web App из `google-apps-script.gs`.
- `GOOGLE_SHEETS_SECRET` — необязательно, общий секрет (тот же, что `SECRET` в Apps Script).
- `ALLOWED_ORIGINS` — необязательно, список доменов через запятую, если форма вызывается не с домена самого сайта.

В Vercel открой **Project → Settings → Environment Variables** и добавь:

```text
TELEGRAM_BOT_TOKEN = <новый токен бота>
TELEGRAM_CHAT_ID = 683525048
```

Для обеих переменных отметь Production (и Preview, если хочешь тестировать preview-deploy). После изменения переменных сделай Redeploy.

Важно: токен бота хранится только в server-side Environment Variables. Не вставляй его в `index.html`, JavaScript браузера или публичный GitHub.

Посетитель видит success-state, только если заявка дошла хотя бы в один канал (Telegram или Google Sheets). Сервер проверяет согласие, телефон/Telegram, Origin и ограничивает частоту запросов.

### Как получить TELEGRAM_CHAT_ID

1. Открой своего бота в Telegram и нажми Start / отправь `/start`.
2. Получи числовой chat ID любым безопасным способом (например, через `getUpdates` Bot API локально) и добавь его в Vercel как `TELEGRAM_CHAT_ID`.

### Google Sheets

Файл `google-apps-script.gs` — готовый receiver. Вставь его в Apps Script, задеплой как Web App и добавь URL в `GOOGLE_SHEETS_WEBHOOK`. Telegram при этом остаётся основным каналом, поэтому сбой таблицы не теряет лид.

## Ссылки с предзаполнением квиза

Кнопки на подстраницах ведут на `/?brand=BMW&model=X5#calculator` или `/?package=Зоны%20риска#calculator` — квиз открывается сразу на нужном шаге. UTM/yclid/gclid сохраняются в `sessionStorage` на любой странице, поэтому источник не теряется при переходе «SEO-страница → главная».
