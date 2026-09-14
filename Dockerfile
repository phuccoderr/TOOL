FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# Thêm python3 vào danh sách cài đặt để đáp ứng yêu cầu của yt-dlp-exec
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg curl ca-certificates python3 \
  && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod a+rx /usr/local/bin/yt-dlp \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY .env.example ./.env.example

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]