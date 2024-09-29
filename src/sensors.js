export const initAudio = async (onMessage) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.audioWorklet.addModule('/blackhole/build/audio-processor.js');
    const audioNode = new AudioWorkletNode(audioContext, 'audio-processor');
    // 사용자로부터 마이크 접근 권한 요청
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // 마이크 스트림 생성
    const microphone = audioContext.createMediaStreamSource(stream);
    
    // 마이크 -> AudioWorkletNode -> 출력
    microphone.connect(audioNode);
    audioNode.connect(audioContext.destination);
    
    audioNode.port.onmessage = (event) => {
      const { samples, t } = event.data;
      onMessage({ samples, t });
    };
    return { audioContext }
  } catch (error) {
    console.error(error);
  }
  return null;
}

export const initAccelerometer = async (onReading) => {
  try {
    const accPermissionResult = await navigator.permissions.query({ name: "accelerometer" });
  
    if (accPermissionResult.state === "denied") {
      alert("Permission to use accelerometer. gyroscope sensor is denied");
      return () => {};
    }
    
    if (!('Accelerometer' in window)) {
      alert('브라우저가 센서를 지원하지 않습니다.');
      return () => {};
    }

    const accelerometer = new window.Accelerometer({ frequency: 100 });
    accelerometer.addEventListener("reading", () => {
      onReading({
        t: Date.now(),
        x: accelerometer.x,
        y: accelerometer.y,
        z: accelerometer.z,
        a: Math.sqrt(accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2),
      })
    });
    accelerometer.start();
    return { accelerometer }
  } catch (error) {
    if (error.name === 'SecurityError') {
      alert('Sensor construction was blocked by the Permissions Policy.');
    } else if (error.name === 'ReferenceError') {
      alert('Sensor is not supported by the User Agent.');
    } else {
      alert(`${error.name} ${error.message}`);
    }
  }
  return null;
}

export const initGyroscope = async (onReading) => {
  try {
    const gyroPermissionResult = await navigator.permissions.query({ name: "gyroscope" });
  
    if (gyroPermissionResult.state === "denied") {
      alert("Permission to use accelerometer. gyroscope sensor is denied");
      return () => {};
    }

    if (!('Gyroscope' in window)) {
      alert('브라우저가 센서를 지원하지 않습니다.');
      return () => {};
    }

    const gyroscope = new window.Gyroscope({ frequency: 100 });
    gyroscope.addEventListener("reading", () => {
      onReading({
        t: Date.now(),
        x: gyroscope.x,
        y: gyroscope.y,
        z: gyroscope.z,
        a: Math.sqrt(gyroscope.x ** 2 + gyroscope.y ** 2 + gyroscope.z ** 2),
      })
    });
    gyroscope.start();
    return { gyroscope }
  } catch (error) {
    if (error.name === 'SecurityError') {
      alert('Sensor construction was blocked by the Permissions Policy.');
    } else if (error.name === 'ReferenceError') {
      alert('Sensor is not supported by the User Agent.');
    } else {
      alert(`${error.name} ${error.message}`);
    }
  }
  return null;
};