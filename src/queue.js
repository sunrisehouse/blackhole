export class Queue {
  constructor(maxSize) {
    this.queue = [];
    this.maxSize = maxSize;
  }

  // 큐에 요소를 추가하는 메소드
  enqueue(item) {
    if (this.queue.length >= this.maxSize) {
      this.queue.shift(); // 큐의 길이가 maxSize를 초과하면 가장 오래된 요소 제거
    }
    this.queue.push(item); // 새로운 요소를 큐에 추가
  }

  // 큐에서 요소를 제거하는 메소드
  dequeue() {
    if (this.isEmpty()) {
      console.log("Queue is empty");
      return null;
    }
    return this.queue.shift(); // 가장 오래된 요소 반환 및 제거
  }

  // 큐의 첫 번째 요소를 반환하는 메소드 (제거하지 않음)
  peek() {
    if (this.isEmpty()) {
      console.log("Queue is empty");
      return null;
    }
    return this.queue[0];
  }

  // 큐가 비어있는지 확인하는 메소드
  isEmpty() {
    return this.queue.length === 0;
  }

  // 큐의 현재 크기를 반환하는 메소드
  size() {
    return this.queue.length;
  }

  // 큐의 전체 내용을 출력하는 메소드
  printQueue() {
    console.log(this.queue);
  }

  getQueue() {
    return this.queue;
  }
}
