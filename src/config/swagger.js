export const swaggerOptions = {
  openapi: {
    openapi: "3.0.3",
    info: {
      title: "YouTube MP3 API",
      description:
        "API chuyển đổi nội dung YouTube được phép sử dụng sang MP3.",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:3000", description: "Local server" }],
    tags: [
      { name: "System", description: "System endpoints" },
      { name: "Downloads", description: "YouTube audio endpoints" },
    ],
  },
};

export const swaggerUiOptions = {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: false,
  },
  staticCSP: true,
};
