const downloadBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["url"],
  properties: {
    url: { type: "string", minLength: 12, maxLength: 2048, format: "uri" },
  },
};

export async function downloadRoutes(fastify, options) {
  const { controller } = options;

  fastify.post(
    "/downloads",
    {
      schema: {
        tags: ["Downloads"],
        summary: "Tải video YouTube dưới dạng MP3",
        description:
          "Nhập URL YouTube mà người dùng có quyền tải và chuyển đổi.",
        body: downloadBodySchema,
        response: {
          200: {
            type: "string",
            format: "binary",
            description: "File MP3 dạng stream",
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => controller.download(request, reply),
  );

  fastify.get(
    "/downloads",
    {
      schema: {
        tags: ["Downloads"],
        summary: "Xem lịch sử tải trong bộ nhớ",
        response: {
          200: {
            type: "object",
            required: ["data"],
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    url: { type: "string", format: "uri" },
                    fileName: { type: "string" },
                    size: { type: "integer" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => controller.history(request, reply),
  );

  fastify.delete(
    "/downloads",
    {
      schema: {
        tags: ["Downloads"],
        summary: "Xóa toàn bộ lịch sử tải trong bộ nhớ",
        response: {
          200: {
            type: "object",
            required: ["message", "deletedCount"],
            properties: {
              message: { type: "string" },
              deletedCount: { type: "integer", minimum: 0 },
            },
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => controller.clearHistory(request, reply),
  );
}
