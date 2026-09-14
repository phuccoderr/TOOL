# YouTube MP3 Fastify API

API Fastify theo luồng `Routes -> Controllers -> Services -> Repositories`. API chỉ nên được dùng cho nội dung mà bạn có quyền tải/chuyển đổi và phải tuân thủ điều khoản của YouTube.

## Chạy local

Yêu cầu Node.js 20+, `yt-dlp` và `ffmpeg` có trong `PATH`.

```powershell
Copy-Item .env.example .env
npm install
npm start
```

Hoặc dùng Docker:

```powershell
docker build -t youtube-mp3-api .
docker run --rm -p 3000:3000 --env-file .env youtube-mp3-api
```

## API

`POST /api/v1/downloads` với body:

```json
{ "url": "https://www.youtube.com/watch?v=..." }
```

API trả về file `audio/mpeg` dạng stream tải xuống. `GET /api/v1/downloads` trả về lịch sử trong bộ nhớ của tiến trình.

## Swagger / OpenAPI

Sau khi khởi động server, mở Swagger UI tại `http://localhost:3000/docs`.
OpenAPI JSON có tại `http://localhost:3000/docs/json`.

Rate limit mặc định là 30 request/phút/IP. Không có dịch vụ nào có thể bảo đảm "không giới hạn lượt tải": YouTube, hạ tầng mạng, CPU, ổ đĩa và chính sách chống lạm dụng vẫn có giới hạn. Có thể điều chỉnh `RATE_LIMIT_MAX`, nhưng không nên tắt trong môi trường công khai.
