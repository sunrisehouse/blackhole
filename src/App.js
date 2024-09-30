import { useEffect, useReducer, useRef, useState } from 'react';
import './App.css';
import { AppBar, Box, Button, ButtonGroup, Container, Divider, Drawer, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Toolbar, Typography } from '@mui/material';
import { CircularBuffer } from './circulate-buffer';
import { initAccelerometer, initAudio, initGyroscope } from './sensors';
import { EventDetector } from './event-detector';
import SensorsIcon from '@mui/icons-material/Sensors';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import PauseCircleFilledRoundedIcon from '@mui/icons-material/PauseCircleFilledRounded';
import NotStartedRoundedIcon from '@mui/icons-material/NotStartedRounded';
import { DebuggingView } from './DebuggingView';
import { addConsoleLog } from './consolelog';

const APP_VERSION = 'v0.0.6';

const audioBuffer = new CircularBuffer(10000000);
const accelBuffer = new CircularBuffer(10000000);
const gyroBuffer = new CircularBuffer(10000000);

let audioContext = null;
let accelerometer = null;
let gyroscope = null;

const detector = new EventDetector();

let startTime = 0;

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
  const inputRefs = {
    alCoffRef: useRef(null),
    blCoffRef: useRef(null),
    clCoffRef: useRef(null),
    anrCoffRef: useRef(null),
    bnrCoffRef: useRef(null),
    cnrCoffRef: useRef(null),
    userParameterRef: useRef(null),
  }
  const [settings, setSettings] = useState({
    alCoff: 4.5741,
    blCoff: -1.336,
    clCoff: 0.0,
    anrCoff: 0.0077,
    bnrCoff: 0.155,
    cnrCoff: 0.4794,
    userParameter: 2.5,
  });

  useEffect(() => {
    return () => {
      if (audioContext) audioContext.close();
      if (accelerometer) accelerometer.stop();
      if (gyroscope) gyroscope.stop();
    };
  }, []);

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
              const timeDelta = (event.ts2Time - event.ts1Time) * 0.001; // sec 로 변환
              const laserVal = settings.alCoff * (timeDelta ** settings.blCoff) + settings.clCoff;
              const resultVal =
                (settings.anrCoff * (laserVal ** 2) + settings.bnrCoff * laserVal + settings.cnrCoff)
                * settings.userParameter;
              return { laserVal, resultVal, time: event.trTime - startTime, timeDelta };
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
        accelBuffer.add(data);
      });
      accelerometer = accel;
    }
    async function initGyro() {
      const { gyroscope: gyro } = await initGyroscope((data) => {
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
      startTime = Date.now();
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

  const handleClickApply = (e) => {
    try {
      setSettings({
        alCoff: Number(inputRefs.alCoffRef.current.value),
        blCoff: Number(inputRefs.blCoffRef.current.value),
        clCoff: Number(inputRefs.clCoffRef.current.value),
        anrCoff: Number(inputRefs.anrCoffRef.current.value),
        bnrCoff: Number(inputRefs.bnrCoffRef.current.value),
        cnrCoff: Number(inputRefs.cnrCoffRef.current.value),
      });
      dispatchSettingView({ type: 'close' })
    } catch(e) {
      addConsoleLog(e.message)
    }
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
            Blackhole {APP_VERSION}
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => dispatchSettingView({ type: 'toggle' })}
          >
            <SettingsRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm"
        sx={{
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <Paper
          sx={{ padding: '20px' }}
        >
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
          <Typography
            variant="h5"
            sx={{
              margin: '20px 0'
            }}
          >
            {results.length > 0 ? results[results.length - 1].resultVal : '0'}
          </Typography>
          <TableContainer
            component={Paper}
            sx={{ marginTop: '20px' }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {/* <TableCell>Parameters</TableCell> */}
                  <TableCell align="center">ALcoff</TableCell>
                  <TableCell align="center">BLcoff</TableCell>
                  <TableCell align="center">CLcoff</TableCell>
                  <TableCell align="center">ANRcoff</TableCell>
                  <TableCell align="center">BNRcoff</TableCell>
                  <TableCell align="center">CNRcoff</TableCell>
                  <TableCell align="center">User_Parameter</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {/* <TableCell align="center"></TableCell> */}
                  <TableCell align="center">{settings.alCoff}</TableCell>
                  <TableCell align="center">{settings.blCoff}</TableCell>
                  <TableCell align="center">{settings.clCoff}</TableCell>
                  <TableCell align="center">{settings.anrCoff}</TableCell>
                  <TableCell align="center">{settings.bnrCoff}</TableCell>
                  <TableCell align="center">{settings.cnrCoff}</TableCell>
                  <TableCell align="center">{settings.userParameter}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <TableContainer
          component={Paper}
          sx={{ marginTop: '20px' }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Time</TableCell>
                <TableCell align="center">Time_Delta</TableCell>
                <TableCell align="center">Laser_Val</TableCell>
                <TableCell align="center">Result_Val</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result, index) => (
                <TableRow
                  key={index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="center">{result.time}</TableCell>
                  <TableCell align="center">{result.timeDelta}</TableCell>
                  <TableCell align="center">{result.laserVal}</TableCell>
                  <TableCell align="center">{result.resultVal}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
          // component="form"
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
              label="ALcoff"
              name="alCoff"
              defaultValue={settings.alCoff}
              type="number"
              size="small"
              inputRef={inputRefs.alCoffRef}
            />
          </div>
          <div>
            <TextField
              label="BLcoff"
              name="blCoff"
              defaultValue={settings.blCoff}
              type="number"
              size="small"
              inputRef={inputRefs.blCoffRef}
            />
          </div>
          <div>
            <TextField
              label="CLcoff"
              name="clCoff"
              defaultValue={settings.clCoff}
              type="number"
              size="small"
              inputRef={inputRefs.clCoffRef}
            />
          </div>
          <div>
            <TextField
              label="ANRcoff"
              name="anrCoff"
              defaultValue={settings.anrCoff}
              type="number"
              size="small"
              inputRef={inputRefs.anrCoffRef}
            />
          </div>
          <div>
            <TextField
              label="BNRcoff"
              name="bnrCoff"
              defaultValue={settings.bnrCoff}
              type="number"
              size="small"
              inputRef={inputRefs.bnrCoffRef}
            />
          </div>
          <div>
            <TextField
              label="CNRcoff"
              name="cnrCoff"
              defaultValue={settings.cnrCoff}
              type="number"
              size="small"
              inputRef={inputRefs.cnrCoffRef}
            />
          </div>
          <div>
            <TextField
              label="User_Parameter"
              name="userParameter"
              defaultValue={settings.userParameter}
              type="number"
              size="small"
              inputRef={inputRefs.userParameterRef}
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
              type="submit"
              onClick={handleClickApply}
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
