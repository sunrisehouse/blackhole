import { useEffect, useReducer, useState } from 'react';
import './App.css';
import { AppBar, Box, Button, ButtonGroup, Container, Divider, Drawer, IconButton, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Toolbar, Typography } from '@mui/material';
import { CircularBuffer } from './circulate-buffer';
import { initAccelerometer, initAudio, initGyroscope } from './sensors';
import { EventDetector } from './event-detector';
import SensorsIcon from '@mui/icons-material/Sensors';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import PauseCircleFilledRoundedIcon from '@mui/icons-material/PauseCircleFilledRounded';
import NotStartedRoundedIcon from '@mui/icons-material/NotStartedRounded';
import { addConsoleLog, getConsoleLog } from './consolelog';
import { Console } from './Console';
import { DebuggingView } from './DebuggingView';

const APP_VERSION = 'v0.0.3';

const audioBuffer = new CircularBuffer(10000000);
const accelBuffer = new CircularBuffer(10000000);
const gyroBuffer = new CircularBuffer(10000000);

let audioContext = null;
let accelerometer = null;
let gyroscope = null;

const detector = new EventDetector();

function settingViewReducer(state, action) {
  if (action.type === 'open') return { ...state, isOpen: true };
  else if (action.type === 'close') return { ...state, isOpen: false };
  else if (action.type === 'toggle') return { ...state, isOpen: !state.isOpen };
  throw Error('Unknown action.');
}

function measurementReducer(state, action) {
  if (action.type === 'init') return { ...state, isInit: true };
  else if (action.type === 'start') return { ...state, isStart: true };
  else if (action.type === 'pause') return { ...state, isStart: false };
  throw Error('Unknown action.');
}

function App() {
  const [settingViewState, dispatchSettingView] = useReducer(settingViewReducer, { isOpen: false });
  const [measurementState, dispatchMeasurement] = useReducer(measurementReducer, { isInit: false, isStart: false });
  const [fetchDataIntervalId, setFetchDataIntervalId] = useState(null);
  const [flagChageLogs, setFlagChangeLogs] = useState([]);
  const [results, setResults] = useState([]);
  const [startTime, setStartTime] = useState(0);

  const setfetchDataInterval = () => {
    setFetchDataIntervalId(
      setInterval(async () => {
        const logs = detector.getFlagChangeLog();
        setFlagChangeLogs((prevLogs) => {
          if (logs.length > prevLogs.length) {
            return [...logs];
          } else {
            return prevLogs;
          }
        });
        const events = detector.getEventDataList();
        setResults((results) => {
          if (events.length > results.length) {
            return events.map((event) => {
              const alCoff = 4.5741;
              const blCoff = -1.336;
              const clCoff = 0.0;
              const anrCoff = 0.0077;
              const bnrCoff = 0.155;
              const cnrCoff = 0.4794;
              const timeDelta = event.ts2Time - event.ts1Time;
              const laserVal = alCoff * (timeDelta ** blCoff) + clCoff;
              const resultVal = anrCoff * (laserVal ** 2) + bnrCoff * laserVal + cnrCoff;
              return { laserVal, resultVal, time: event.trTime };
            });
          } else {
            return results;
          }
        });
      }, 1000)
    );
  }

  const handleClickStart = () => {
    async function initAC() {
      const { audioContext: ac } = await initAudio((data) => {
        // addConsoleLog(`get audio data - ${data.t} ${data.samples.length}`);
        audioBuffer.add(data);
        detector.inputSoundData(data);
      });
      audioContext = ac;
    }
    async function initAccel() {
      const { accelerometer: accel } = await initAccelerometer((data) => {
        addConsoleLog(`accel data - ${data.t} ${data.a}`);
        accelBuffer.add(data);
      });
      accelerometer = accel;
    }
    async function initGyro() {
      const { gyroscope: gyro } = await initGyroscope((data) => {
        addConsoleLog(`gyro data - ${data.t} ${data.a}`);
        gyroBuffer.add(data);
        detector.inputGyroData(data);
      });
      gyroscope = gyro;
    }
    initAC();
    initAccel();
    initGyro();
    setTimeout(() => {
      setfetchDataInterval();
      dispatchMeasurement({ type: 'init' });
      setStartTime(Date.now())
    }, 1000);
    dispatchMeasurement({ type: 'start' });
  };

  const handleClickPause = () => {
    if (fetchDataIntervalId) clearInterval(fetchDataIntervalId);
    dispatchMeasurement({ type: 'pause' });
  };

  const handleClickRestart = () => {
    setfetchDataInterval();
    dispatchMeasurement({ type: 'start' });
  };

  return (
    <div className="App">
      <AppBar position="static" color="primary">
        <Toolbar>
          <SensorsIcon
            sx={{ mr: 1 }}
          />
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 2,
              display: { md: 'flex' },
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1,
              textAlign: 'left'
            }}
          >
            Blackhole
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => dispatchSettingView({ type: 'toggle' })}
          >
            <SettingsRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <Paper
          sx={{
            marginTop: '40px',
            padding: '20px 0 40px',
            '& .MuiTextField-root': { marginTop: '10px' },
          }}
        >
          <Typography
            variant="h5"
            noWrap
            sx={{
              mr: 2,
              display: { md: 'flex' },
              fontWeight: 700,
            }}
          >
            Blackhole {APP_VERSION}
          </Typography>
          {measurementState.isInit
            ? measurementState.isStart
              ? <Button
                variant="contained"
                onClick={handleClickPause}
                color="secondary"
              >
                <PauseCircleFilledRoundedIcon />
                pause
              </Button>
              : <Button
                variant="contained"
                onClick={handleClickRestart}
              >
                <NotStartedRoundedIcon />
                restart
              </Button>
            : measurementState.isStart
              ? <Button
                disabled
                variant="contained"
              >
                initializing
              </Button>
              : <Button
                variant="contained"
                onClick={handleClickStart}
              >
                <PlayCircleFilledRoundedIcon />
                start
              </Button>
          }
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {/* <TableCell>ID</TableCell> */}
                  <TableCell align="right">Time</TableCell>
                  <TableCell align="right">Laser_Val</TableCell>
                  <TableCell align="right">Result_Val</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow
                    key={index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="right">{result.time}</TableCell>
                    <TableCell align="right">{result.laserVal}</TableCell>
                    <TableCell align="right">{result.resultVal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <Box sx={{ marginTop: '20px' }}>
          <DebuggingView
            flagChageLogs={flagChageLogs}
            startTime={startTime}
          />
        </Box>
      </Container>
      <Drawer
        anchor={"left"}
        open={settingViewState.isOpen}
        onClose={() => dispatchSettingView({ type: 'toggle' })}
      >
        <Box
          component="form"
          sx={{
            padding: '20px',
            '& .MuiTextField-root': { m: 1, width: '25ch' },
            '& .MuiTypography-root': { marginTop: '12px' },
            '& .MuiDivider-root': { margin: '12px 0' },
          }}
          noValidate
          autoComplete="off"
        >
          <Typography
            variant="h5"
          >
            Settings
          </Typography>
          <Divider/>
          <Typography
            variant="h6"
          >
            Parameters
          </Typography>
          <div>
            <TextField
              label="setting1"
              defaultValue="0"
              type="number"
              size="small"
            />
          </div>
          <div>
            <TextField
              label="setting1"
              defaultValue="0"
              type="number"
              size="small"
            />
          </div>
          <div>
            <TextField
              label="setting1"
              defaultValue="0"
              type="number"
              size="small"
            />
          </div>
          <Divider/>
          <Typography
            variant="h6"
          >
            Unit
          </Typography>
          <div>
            <TextField
              label="setting1"
              defaultValue="0"
              type="number"
              size="small"
            />
          </div>
          <div>
            <TextField
              label="setting1"
              defaultValue="0"
              type="number"
              size="small"
            />
          </div>
          <div>
            <TextField
              label="setting1"
              defaultValue="0"
              type="number"
              size="small"
            />
          </div>
          <Divider/>
          <ButtonGroup>
            <Button
              variant="contained"
            >
              Apply
            </Button>
          </ButtonGroup>
        </Box>
      </Drawer>
    </div>
  );
}

export default App;
