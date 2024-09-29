import { addConsoleLog } from "./consolelog";

export class EventDetector {
  constructor() {
    this.flagTs1 = false; // 첫 번째 소리 조건 (기존 flagTr1)
    this.flagTs2 = false; // 두 번째 소리 조건 (기존 flagTr2)

    this.soundTs1Sample = null;
    this.soundTs1Time = null;
    this.soundTs2Sample = null;
    this.soundTs2Time = null; // flagTs2가 트리거된 시간을 기록

    this.eventDataList = []; // 이벤트 데이터를 리스트로 저장
    this.flagChangeLog = []; // 플래그 변경 이력을 저장
  }

  // 플래그 변경 이력을 기록하는 메소드
  logFlagChange(flagName, value, t, message) {
    this.flagChangeLog.push({
      flag: flagName,
      value: {
        ts1: { flag: this.flagTs1, time: this.soundTs1Time, sample: this.soundTs1Sample, },
        ts2: { flag: this.flagTs2, time: this.soundTs2Time, sample: this.soundTs2Sample, },
        tr: {
          flag: flagName === 'flagTr' ? true : false,
          time: flagName === 'flagTr' ? t : null,
          a: flagName === 'flagTr' ? value : null,
        },
      },
      time: t,
      message,
    });
    console.log(`Flag ${flagName} changed to ${value} at time ${t}`);
    addConsoleLog(`Flag ${flagName} changed to ${value} at time ${t}`)
  }

  // Sound 데이터 입력
  inputSoundData({ samples, t }) {
    if (!this.flagTs1) {
      // 0.4 이상의 값이 있는지 확인하여 flagTs1 설정
      if (samples.some(sample => sample >= 0.4)) {
        this.flagTs1 = true;
        this.soundTs1Sample = samples.find(sample => sample >= 0.4);
        this.soundTs1Time = t;
        this.logFlagChange('flagTs1', true, t, '0.4 이상의 sample 발견');
      }
    } 
    // flagTs1이 설정된 후 100ms ~ 2000ms 사이에 flagTs2 조건 확인
    else if (this.flagTs1 && !this.flagTs2) {
      const timeDiff = t - this.soundTs1Time;

      // 2000 milliseconds가 지났으면 flagTs1을 false로 재설정
      if (timeDiff > 2000) {
        this.resetFlags(t, `Resetting flagTs1 and flagTs2 after 2000ms timeout.`);
      } 
      // 100ms ~ 2000ms 사이에 flagTs2 조건 확인
      else if (timeDiff >= 100 && timeDiff <= 2000) {
        if (samples.some(sample => sample >= 0.4)) {
          this.flagTs2 = true;
          this.soundTs2Sample = samples.find(sample => sample >= 0.4);
          this.soundTs2Time = t; // flagTs2가 트리거된 시간 기록
          this.logFlagChange('flagTs2', true, t, 'flagTs1=true 일 때 100 ~ 2000 사이에 0.4 이상의 sample 발견');
        }
      }
    }
  }

  // 가속도 데이터 입력
  inputAccelData({ a, t }) {
    if (this.flagTs2) {
      const timeSinceFlagTs2 = t - this.soundTs2Time; // flagTs2가 트리거된 시간과 비교

      // flagTs2가 설정된 후 70ms 이내에 가속도 값이 0.2 이상이어야 함
      if (timeSinceFlagTs2 <= 70) {
        if (a >= 0.2) {
          const eventData = {
            accel: a,
            soundTs1: { sample: this.soundTs1Sample, time: this.soundTs1Time },
            soundTs2: { sample: this.soundTs2Sample, time: this.soundTs2Time },
            eventTime: t
          };
          // 이벤트 데이터를 리스트에 저장
          this.eventDataList.push(eventData);
          this.logFlagChange('flagTr', a, t, `Event detected at time ${t}, accel: ${a}`);

          // 플래그 초기화
          this.resetFlags(t, `event 찾고 모든 flag reset`);
        }
      } else {
        // 70ms가 경과하면 flagTs2를 false로 설정
        this.flagTs2 = false;
        this.logFlagChange('flagTs2', false, t, `Resetting flagTs2 after 70ms timeout with no sufficient acceleration.`);
      }
    }
  }

  // 플래그 초기화
  resetFlags(t, message) {
    
    this.flagTs1 = false;
    this.flagTs2 = false;
    this.soundTs1Sample = null;
    this.soundTs1Time = null;
    this.soundTs2Sample = null;
    this.soundTs2Time = null;
    this.logFlagChange('flagTs1', false, t, message);
    this.logFlagChange('flagTs2', false, t, message);
  }

  // 이벤트 데이터를 반환하는 메소드
  getEventDataList() {
    return this.eventDataList;
  }

  // 플래그 변경 이력을 반환하는 메소드
  getFlagChangeLog() {
    return this.flagChangeLog;
  }
}
