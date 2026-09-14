export class DownloadController {
  #audioService;
  #historyRepository;

  constructor(audioService, historyRepository) {
    this.#audioService = audioService;
    this.#historyRepository = historyRepository;
  }

  async download(request, reply) {
    try {
      const result = await this.#audioService.downloadMp3(request.body.url);
      reply.header("Content-Type", "audio/mpeg");
      reply.header(
        "Content-Disposition",
        `attachment; filename="${result.fileName}"`,
      );
      reply.header("Content-Length", result.fileSize);
      reply.raw.on("close", result.cleanup);
      return reply.send(result.stream);
    } catch (error) {
      request.log.error({ err: error }, "MP3 download failed");
      return reply.code(error.statusCode ?? 500).send({
        error: error.statusCode === 400 ? "Bad Request" : "Download Failed",
        message: error.message ?? "Đã xảy ra lỗi khi tải nhạc.",
      });
    }
  }

  async history(request, reply) {
    try {
      return reply.send({ data: await this.#historyRepository.list() });
    } catch (error) {
      request.log.error({ err: error }, "Download history failed");
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Không thể đọc lịch sử tải.",
      });
    }
  }

  async clearHistory(request, reply) {
    try {
      const deletedCount = await this.#historyRepository.clear();
      return reply.send({
        message: "Đã xóa lịch sử tải trong bộ nhớ.",
        deletedCount,
      });
    } catch (error) {
      request.log.error({ err: error }, "Clear download history failed");
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Không thể xóa lịch sử tải.",
      });
    }
  }
}
