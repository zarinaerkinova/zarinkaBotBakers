# Используем официальный Node.js образ
FROM node:20

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Открываем порт (не обязателен для Telegram-бота, но Northflank может требовать)
EXPOSE 3000

# Запускаем бота
CMD ["node", "index.js"]
