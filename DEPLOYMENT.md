# Руководство по развертыванию

## Быстрое развертывание на Vercel

### 1. Подготовка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Скопируйте URL проекта и ключи API
3. Выполните SQL миграции из папки `scripts/` в SQL Editor Supabase (в порядке нумерации)

### 2. Развертывание на Vercel

1. Импортируйте проект в Vercel
2. Подключите интеграцию Supabase через Vercel Integrations
3. Переменные окружения добавятся автоматически
4. Нажмите Deploy

### 3. Первоначальная настройка

После развертывания:

1. Зарегистрируйте первого пользователя
2. В Supabase Dashboard откройте таблицу `profiles`
3. Измените роль первого пользователя на `admin`
4. Войдите в систему и настройте отделы

## Ручное развертывание

### Требования

- Node.js 18+
- PostgreSQL 14+ (или Supabase)
- Vercel CLI (опционально)

### Шаги

1. Клонируйте репозиторий:
\`\`\`bash
git clone <repository-url>
cd employee-time-tracking
\`\`\`

2. Установите зависимости:
\`\`\`bash
npm install
\`\`\`

3. Настройте .env.local:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

4. Выполните миграции БД (через Supabase SQL Editor)

5. Соберите проект:
\`\`\`bash
npm run build
\`\`\`

6. Запустите:
\`\`\`bash
npm start
\`\`\`

## Конфигурация email для Supabase Auth

В настройках Supabase Auth:

1. Перейдите в Authentication → Email Templates
2. Настройте шаблоны писем для:
   - Подтверждение регистрации
   - Сброс пароля
   - Изменение email

3. Укажите URL редиректа:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

## Безопасность в продакшене

### 1. Настройка Supabase RLS

Убедитесь, что все таблицы имеют включенный RLS:
\`\`\`sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
-- и т.д. для всех таблиц
\`\`\`

### 2. HTTPS

Vercel автоматически настраивает HTTPS. Для других платформ убедитесь в наличии SSL сертификата.

### 3. Environment Variables

Никогда не коммитьте .env файлы. Используйте переменные окружения платформы развертывания.

### 4. CORS

Настройте разрешенные домены в Supabase:
- Dashboard → Settings → API → CORS

## Мониторинг

### Vercel Analytics

Включите в `next.config.js`:
\`\`\`js
module.exports = {
  // ... other config
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP']
  }
}
\`\`\`

### Supabase Logs

Мониторьте через Supabase Dashboard:
- Database → Logs
- API → Logs

## Резервное копирование

### Автоматическое (Supabase Pro)

Настройте ежедневные бэкапы в Supabase Dashboard.

### Ручное

\`\`\`bash
# Экспорт данных
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql

# Импорт данных
psql -h db.xxx.supabase.co -U postgres -d postgres < backup.sql
\`\`\`

## Обновления

### Обновление зависимостей

\`\`\`bash
npm update
npm audit fix
\`\`\`

### Миграции БД

Для новых миграций:
1. Создайте новый файл в `scripts/` с номером версии
2. Выполните в Supabase SQL Editor
3. Задокументируйте изменения

## Масштабирование

### Горизонтальное масштабирование

Vercel автоматически масштабирует фронтенд.

### База данных

Для увеличения нагрузки:
1. Обновите план Supabase
2. Настройте connection pooling
3. Добавьте индексы для часто используемых запросов

## Troubleshooting

### Проблемы с аутентификацией

1. Проверьте переменные окружения
2. Убедитесь, что email подтверждение включено
3. Проверьте redirect URLs в Supabase

### Ошибки БД

1. Проверьте RLS политики
2. Проверьте соединение с БД
3. Посмотрите логи в Supabase

### Проблемы с производительностью

1. Включите кэширование
2. Оптимизируйте SQL запросы
3. Добавьте индексы
