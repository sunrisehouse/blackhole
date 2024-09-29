import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { addConsoleLog } from './consolelog';

const handleWindowError = (msg, url, lineNo, columnNo, error) => {
  const logMessage = `[Error] ${msg} at ${url}:${lineNo}:${columnNo} \n${error?.stack || ''}`;
  addConsoleLog(logMessage);
  return false; // 브라우저 기본 에러 처리를 방지하지 않음
};

// 전역 에러 핸들러
window.onerror = handleWindowError;

// 전역 Promise rejection 핸들러 (비동기 에러)
window.addEventListener('unhandledrejection', (event) => {
  const logMessage = `[Unhandled Rejection] ${event.reason}`;
  addConsoleLog(logMessage);
});

// 리소스 로드 에러 핸들러 (예: 이미지나 스크립트 로드 실패)
window.addEventListener('error', (event) => {
  if (event.target !== window) {
    const logMessage = `[Resource Error] ${event.target.localName} failed to load: ${event.target.src}`;
    addConsoleLog(logMessage);
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
