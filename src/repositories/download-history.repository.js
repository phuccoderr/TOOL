export class DownloadHistoryRepository {
  #records = [];
  #maxRecords;

  constructor(maxRecords = 100) {
    this.#maxRecords = maxRecords;
  }

  async add(record) {
    try {
      this.#records.unshift(record);
      this.#records = this.#records.slice(0, this.#maxRecords);
      return record;
    } catch (error) {
      throw new Error(`Không thể lưu lịch sử tải: ${error.message}`);
    }
  }

  async list() {
    try {
      return [...this.#records];
    } catch (error) {
      throw new Error(`Không thể đọc lịch sử tải: ${error.message}`);
    }
  }

  async clear() {
    try {
      const deletedCount = this.#records.length;
      this.#records = [];
      return deletedCount;
    } catch (error) {
      throw new Error(`Không thể xóa lịch sử tải: ${error.message}`);
    }
  }
}
