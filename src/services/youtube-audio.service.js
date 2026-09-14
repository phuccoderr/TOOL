import { createReadStream } from "node:fs";
import { mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ytDlp from "yt-dlp-exec";

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const tempRoot = path.resolve(currentDirectory, "../../.tmp");

export class YoutubeAudioService {
  #historyRepository;
  #timeoutMs;

  constructor(historyRepository, timeoutMs) {
    this.#historyRepository = historyRepository;
    this.#timeoutMs = timeoutMs;
  }

  #validateUrl(url) {
    try {
      const parsedUrl = new URL(url);
      if (
        parsedUrl.protocol !== "https:" ||
        !YOUTUBE_HOSTS.has(parsedUrl.hostname.toLowerCase())
      ) {
        return false;
      }
      return (
        parsedUrl.hostname.toLowerCase() === "youtu.be" ||
        parsedUrl.searchParams.has("v") ||
        parsedUrl.pathname.length > 1
      );
    } catch {
      return false;
    }
  }

  async downloadMp3(url) {
    let temporaryDirectory;
    try {
      if (!this.#validateUrl(url)) {
        const error = new Error("Chỉ chấp nhận URL YouTube HTTPS hợp lệ.");
        error.statusCode = 400;
        throw error;
      }

      await mkdir(tempRoot, { recursive: true });
      temporaryDirectory = await mkdtemp(path.join(tempRoot, "download-"));
      const outputTemplate = path.join(temporaryDirectory, "%(title)s.%(ext)s");

      await ytDlp(
        url,
        {
          extractAudio: true,
          audioFormat: "mp3",
          audioQuality: 0,
          noPlaylist: true,
          noWarnings: true,
          output: outputTemplate,
          restrictFilenames: true,
          socketTimeout: Math.ceil(this.#timeoutMs / 1000),
          maxFilesize: "100M",
          // cookiesFromBrowser: "chrome",
          extractorArgs: "youtube:player_client=ios,web",
        },
        { timeout: this.#timeoutMs },
      );

      const files = (await import("node:fs/promises")).readdir(
        temporaryDirectory,
      );
      const generatedFiles = await files;
      const audioFile = generatedFiles.find((file) =>
        file.toLowerCase().endsWith(".mp3"),
      );
      if (!audioFile) {
        throw new Error("yt-dlp không tạo được file MP3.");
      }

      const filePath = path.join(temporaryDirectory, audioFile);
      const fileInfo = await stat(filePath);
      await this.#historyRepository.add({
        url,
        fileName: audioFile,
        size: fileInfo.size,
        createdAt: new Date().toISOString(),
      });

      return {
        fileName: audioFile,
        fileSize: fileInfo.size,
        stream: createReadStream(filePath),
        cleanup: async () => {
          try {
            await rm(temporaryDirectory, { recursive: true, force: true });
          } catch {
            // Cleanup failure must not break an already completed response.
          }
        },
      };
    } catch (error) {
      if (temporaryDirectory) {
        await rm(temporaryDirectory, { recursive: true, force: true }).catch(
          () => undefined,
        );
      }
      if (error.statusCode) {
        throw error;
      }
      const serviceError = new Error(
        `Không thể chuyển đổi video: ${error.message}`,
      );
      serviceError.statusCode = error.timedOut ? 504 : 502;
      throw serviceError;
    }
  }
}
