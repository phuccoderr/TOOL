FROM node:20-bookworm-slim

# 1. Cài đặt các công cụ hệ thống cơ bản và python3-pip để quản lý gói Python sạch sẽ
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip curl \
  && rm -rf /var/lib/apt/lists/*

# 2. Cài đặt yt-dlp thông qua pip (Tránh hoàn toàn lỗi permission/exit code 77 của curl vào /usr/local/bin)
RUN pip3 install --no-cache-dir --upgrade yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY .env.example ./.env.example

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]