# Чат (Sprint 1)

Учебный мессенджер: многостраничное приложение на **Vite**, **TypeScript**, **Handlebars** и **SCSS**. Авторизация и данные профиля хранятся в `localStorage` (мок).

## Стек

- Vite
- TypeScript
- Handlebars
- SCSS (модули: переменные, миксины, стили страниц и компонентов)
- Vitest (юнит-тесты утилит)

## Команды

Команда | Описание
`npm install` | Установка зависимостей
`npm run start` | Dev-сервер (**http://localhost:3000**)
`npm run build` | Проверка TypeScript и production-сборка в `dist/`
`npm run preview` | Локальный просмотр сборки
`npm test` | Запуск тестов

## Структура

- `index.html` — точка входа **React** (Vite): `src/main.tsx`
- `static/` — HTML многостраничного варианта (Handlebars), скрипты: `../src/entries/*.ts`
- `src/pages/` — шаблоны Handlebars (`.hbs`)
- `src/components/` — partials для Handlebars
- `src/styles/` — SCSS (`variables`, `mixins`, `components/`, `pages/`, `main.scss`)
- `src/utils/` — TypeScript-модули (auth, chats, валидация, DOM)
- `src/entries/` — скрипты страниц Handlebars (подключаются из `static/*.html`)
