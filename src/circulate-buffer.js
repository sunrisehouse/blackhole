export class CircularBuffer {
  constructor(size) {
    this.size = size;
    this.buffer = new Array(size);
    this.start = 0;
    this.end = 0;
    this.isFull = false;
    this.currentTask = Promise.resolve(); // 모든 작업은 이 체인에 연결됩니다.
  }

  // 새로운 작업을 비동기적으로 순차 실행
  async scheduleTask(task) {
    this.currentTask = this.currentTask.then(() => task());
    return this.currentTask;
  }

  // 데이터를 비동기적으로 추가
  async add(data) {
    return this.scheduleTask(async () => {
      this.buffer[this.end] = data;
      this.end = (this.end + 1) % this.size;

      if (this.isFull) {
        this.start = (this.start + 1) % this.size;
      }

      if (this.end === this.start) {
        this.isFull = true;
      }
    });
  }

  // 주어진 인덱스부터 가장 최근 데이터까지 반환
  async getRecentFromIndex(index) {
    return this.scheduleTask(async () => {
      if (index < 0 || index >= this.size) {
        throw new Error("Index out of bounds");
      }

      let result = [];
      if (this.end === this.start && !this.isFull) {
        return result;
      }

      let currentIndex = index;
      while (currentIndex !== this.end) {
        result.push(this.buffer[currentIndex]);
        currentIndex = (currentIndex + 1) % this.size;
        
        if (!this.isFull && currentIndex === this.start) {
          break;
        }
      }

      return { buffer: result, end: this.end };
    });
  }

  // 전체 버퍼를 start부터 end까지 반환
  async getAll() {
    return this.scheduleTask(async () => {
      let result = [];
      let currentIndex = this.start;

      // 버퍼가 비어있을 때
      if (this.end === this.start && !this.isFull) {
        return result;
      }

      // 버퍼가 가득 차거나 데이터가 있을 때
      while (currentIndex !== this.end) {
        result.push(this.buffer[currentIndex]);
        currentIndex = (currentIndex + 1) % this.size;
      }

      return result;
    });
  }

  async getEnd() {
    return this.scheduleTask(async () => {
      return this.end;
    });
  }

  // 현재 버퍼에 얼마나 데이터가 차 있는지 반환
  async getLength() {
    return this.scheduleTask(async () => {
      if (this.isFull) {
        return this.size; // 버퍼가 가득 찼을 때
      }

      if (this.end >= this.start) {
        return this.end - this.start; // end가 start보다 크거나 같은 경우
      } else {
        return this.size - this.start + this.end; // 순환 구조로 버퍼가 돌아간 경우
      }
    });
  }
}
