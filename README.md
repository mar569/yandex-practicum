# Чат (Sprint 2)

Учебный мессенджер с MVC-архитектурой, компонентами и строгой типизацией на TypeScript. Вся логика страниц реализована на стороне клиента, данные хранятся в `localStorage`.

## Стек

- Vite
- TypeScript
- Handlebars
- SCSS
- ESLint
- Stylelint
- Vitest

## Команды

Команда | Описание
--- | ---
`npm install` | Установка зависимостей
`npm run start` | Запуск dev-сервера (http://localhost:3000)
`npm run build` | Проверка типов и production-сборка
`npm run preview` | Локальный просмотр сборки
`npm test` | Запуск тестов
`npm run lint` | Проверка TypeScript, ESLint и Stylelint

## Структура

- `src/core/` — базовый класс `Block`
- `src/components/` — переиспользуемые UI-компоненты
- `src/controllers/` — контроллеры для страниц и бизнес-логики
- `src/utils/` — утилиты для валидации, DOM, хранилища и данных
- `src/pages/` — Handlebars-шаблоны страниц
- `src/entries/` — точка входа для каждой страницы

## Функциональность

- MVC-подход: View, Model, Controller
- Валидация по `blur` и `submit`
- Обработка данных форм без перезагрузки
- Клиентская генерация страниц на стороне браузера
- Переиспользуемые компоненты: `Input`, `Button`, `Form`, `ChatMessage`, `ChatItem`

## Качество

- Строгая TypeScript-конфигурация
- ESLint для TypeScript
- Stylelint для SCSS
- `npm run lint` проверяет все правила
