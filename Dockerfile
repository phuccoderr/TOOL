FROM node:20-bookworm-slim

# 1. Cài đặt ffmpeg và curl, sau đó tải thẳng file thực thi độc lập của yt-dlp về /usr/local/bin/yt-dlp
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg curl ca-certificates \
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