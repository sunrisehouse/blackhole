import { useEffect, useState } from "react";
import { getConsoleLog } from "./consolelog";
import { Box, Paper, Typography } from "@mui/material";

export function Console() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // 1초 주기로 새로운 로그 추가
    const interval = setInterval(() => {
      setLogs([...getConsoleLog()]);
    }, 1000);

    // 컴포넌트 언마운트 시 interval 제거
    return () => clearInterval(interval);
  }, []);

  return (
    <Paper sx={{ padding: '16px', height: '400px', overflowY: 'auto', backgroundColor: '#1e1e1e', color: '#fff' }}>
      <Box sx={{ textAlign: 'left' }}>
        {logs.map((log, index) => (
          <Typography key={index} sx={{ fontFamily: 'monospace' , fontSize: '8px'}}>
            {log}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
}
