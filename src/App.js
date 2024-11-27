import { useEffect, useReducer, useState } from 'react';
import './App.css';
import { AppBar, Box, Button, Container, Drawer, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography } from '@mui/material';
// import { CircularBuffer } from './circulate-buffer';
import { initAccelerometer, initAudio, initGyroscope } from './sensors';
import { EventDetector } from './event-detector';
import SensorsIcon from '@mui/icons-material/Sensors';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import PauseCircleFilledRoundedIcon from '@mui/icons-material/PauseCircleFilledRounded';
import NotStartedRoundedIcon from '@mui/icons-material/NotStartedRounded';
import { DebuggingView } from './DebuggingView';
import { addConsoleLog } from './consolelog';
import { SettingsView } from './SettingsView';

const APP_VERSION = 'v0.0.14';

// const audioBuffer = new CircularBuffer(10000000);
// const accelBuffer = new CircularBuffer(10000000);
// const gyroBuffer = new CircularBuffer(10000000);

let audioContext = null;
let accelerometer = null;
let gyroscope = null;

const detector = new EventDetector();

let startTime = 0;
const INITIALIZE_TIME = 7000;
const EVENT_FECHING_TIME = 500;

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

function getUnitSign(unit) {
  if (unit === 'm') return 'm';
  else if (unit === 'ft') return 'ft';
  else if (unit === 'mPerSteps') return 'm/steps';
  else if (unit === 'ftPerSteps') return 'ft/steps';
  return '';
}

function getResultValueString(resultVal, settings) {
  return `${(
    resultVal * (
    settings.unit === 'm' ? settings.mPerM
    : settings.unit === 'ft' ? settings.ftPerM
    : settings.unit === 'mPerSteps' ? settings.mPerSteps
    : settings.unit === 'ftPerSteps' ? settings.ftPerSteps
    : 1)
  ).toFixed(1)}`;
}

function App() {
  const [settingViewState, dispatchSettingView] = useReducer(settingViewReducer, { isOpen: false });
  const [measurementState, dispatchMeasurement] = useReducer(measurementReducer, { isInit: false, isStart: false });
  const [fetchDataIntervalId, setFetchDataIntervalId] = useState(null);
  const [flagChageLogs, setFlagChangeLogs] = useState([]);
  const [results, setResults] = useState([]);
  const [settings, setSettings] = useState({
    alCoff: 4.5741,
    blCoff: -1.336,
    clCoff: 0.0,
    anrCoff: 2.7543,
    bnrCoff: -1.513,
    cnrCoff: -0.1557,
    userParameter: 1.0,
    unit: 'm',
    mPerM: 1,
    ftPerM: 3.28084,
    mPerSteps: 0.8,
    ftPerSteps: 2.3,
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
                (settings.anrCoff * (timeDelta ** settings.bnrCoff))
                * settings.userParameter;
              return {
                laserVal,
                resultVal,
                time: event.trTime - startTime,
                timeDelta,
              };
            });
          } else {
            return results;
          }
        });
      }, EVENT_FECHING_TIME)
    );
  }

  const handleClickStart = () => {
    async function initAC() {
      const { audioContext: ac } = await initAudio((data) => {
        // audioBuffer.add(data);
        detector.inputSoundData(data);
      });
      audioContext = ac;
    }
    async function initAccel() {
      const { accelerometer: accel } = await initAccelerometer((data) => {
        // accelBuffer.add(data);
      });
      accelerometer = accel;
    }
    async function initGyro() {
      const { gyroscope: gyro } = await initGyroscope((data) => {
        // gyroBuffer.add(data);
        detector.inputGyroData(data);
      });
      gyroscope = gyro;
    }
    initAC();
    initAccel();
    initGyro();
    setTimeout(() => {
      detector.start();
      setfetchDataInterval();
      dispatchMeasurement({ type: 'init' });
      startTime = Date.now();
    }, INITIALIZE_TIME);
    dispatchMeasurement({ type: 'start' });
  };

  const handleClickPause = () => {
    detector.stop();
    if (fetchDataIntervalId) clearInterval(fetchDataIntervalId);
    dispatchMeasurement({ type: 'pause' });
  };

  const handleClickRestart = () => {
    detector.start();
    setfetchDataInterval();
    dispatchMeasurement({ type: 'start' });
  };

  const handleClickApply = ({
    alCoff, blCoff, clCoff, anrCoff, bnrCoff, cnrCoff, userParameter,
    unit, mPerM, ftPerM, mPerSteps, ftPerSteps,
  }) => {
    try {
      setSettings({
        alCoff: Number(alCoff),
        blCoff: Number(blCoff),
        clCoff: Number(clCoff),
        anrCoff: Number(anrCoff),
        bnrCoff: Number(bnrCoff),
        cnrCoff: Number(cnrCoff),
        userParameter: Number(userParameter),
        unit,
        mPerM: Number(mPerM),
        ftPerM: Number(ftPerM),
        mPerSteps: Number(mPerSteps),
        ftPerSteps: Number(ftPerSteps),
      });
      dispatchSettingView({ type: 'close' })
    } catch(e) {
      addConsoleLog(e.message);
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
            variant="h1"
            sx={{
              margin: '20px 0',
              fontSize: '8rem'
            }}
          >
            {!measurementState.isInit && measurementState.isStart
            ? '##.#'  // 초기화 중일 때만 "##.#" 표시
            : getResultValueString(
            results.length > 0
            ? results[results.length - 1].resultVal
            : 0,
            settings
            )} 
            <span style={{fontSize:'20px'}}>{getUnitSign(settings.unit)}</span>
          </Typography>
          <TableContainer
            component={Paper}
            sx={{ marginTop: '20px' }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {/* <TableCell>Parameters</TableCell> */}
                  {/* <TableCell align="center">ALcoff</TableCell> */}
                  {/* <TableCell align="center">BLcoff</TableCell> */}
                  {/* <TableCell align="center">CLcoff</TableCell> */}
                  <TableCell align="center">ANRcoff</TableCell>
                  <TableCell align="center">BNRcoff</TableCell>
                  {/* <TableCell align="center">CNRcoff</TableCell> */}
                  <TableCell align="center">User_Parameter</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {/* <TableCell align="center"></TableCell> */}
                  {/* <TableCell align="center">{settings.alCoff}</TableCell> */}
                  {/* <TableCell align="center">{settings.blCoff}</TableCell> */}
                  {/* <TableCell align="center">{settings.clCoff}</TableCell> */}
                  <TableCell align="center">{settings.anrCoff}</TableCell>
                  <TableCell align="center">{settings.bnrCoff}</TableCell>
                  {/* <TableCell align="center">{settings.cnrCoff}</TableCell> */}
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
                  <TableCell align="center">{getResultValueString(result.resultVal, settings)}</TableCell>
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
        <SettingsView
          initialSettings={settings}
          onClickApply={handleClickApply}
        />
      </Drawer>
    </div>
  );
}

export default App;
