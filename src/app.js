import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "./config/env.js";
import { swaggerOptions, swaggerUiOptions } from "./config/swagger.js";
import { DownloadController } from "./controllers/download.controller.js";
import { DownloadHistoryRepository } from "./repositories/download-history.repository.js";
import { YoutubeAudioService } from "./services/youtube-audio.service.js";
import { downloadRoutes } from "./routes/download.routes.js";

export async function buildApp(overrides = {}) {
  try {
    const app = Fastify({ logger: overrides.logger ?? true });
    const config = { ...env, ...overrides };
    const allowedCorsOrigins = new Set([
      ...config.corsOrigins,
      `http://localhost:${config.port}`,
      `http://127.0.0.1:${config.port}`,
    ]);

    await app.register(helmet);
    await app.register(cors, {
      origin: (origin, callback) => {
        if (!origin || allowedCorsOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin không được phép."), false);
      },
    });
    await app.register(rateLimit, {
      max: config.rateLimitMax,
      timeWindow: config.rateLimitTimeWindow,
      allowList: [],
    });
    await app.register(swagger, swaggerOptions);
    await app.register(swaggerUi, swaggerUiOptions);

    const historyRepository = new DownloadHistoryRepository();
    const audioService = new YoutubeAudioService(
      historyRepository,
      config.downloadTimeoutMs,
    );
    const controller = new DownloadController(audioService, historyRepository);

    app.get(
      "/health",
      {
        schema: {
          tags: ["System"],
          summary: "Kiểm tra trạng thái API",
          response: {
            200: {
              type: "object",
              required: ["status"],
              properties: { status: { type: "string", example: "ok" } },
            },
          },
        },
      },
      async (request, reply) => {
        try {
          return reply.send({ status: "ok" });
        } catch (error) {
          request.log.error({ err: error }, "Health check failed");
          return reply.code(500).send({ error: "Internal Server Error" });
        }
      },
    );

    await app.register(downloadRoutes, { prefix: "/api/v1", controller });

    app.setErrorHandler(async (error, request, reply) => {
      request.log.error({ err: error }, "Unhandled request error");
      if (error.validation) {
        return reply
          .code(400)
          .send({ error: "Bad Request", message: "Body không hợp lệ." });
      }
      if (error.statusCode === 429) {
        return reply.code(429).send({
          error: "Too Many Requests",
          message: "Bạn đã vượt quá giới hạn request.",
        });
      }
      return reply.code(error.statusCode ?? 500).send({
        error: "Internal Server Error",
        message: "Đã xảy ra lỗi máy chủ.",
      });
    });

    return app;
  } catch (error) {
    throw new Error(`Không thể khởi tạo ứng dụng: ${error.message}`);
  }
}
