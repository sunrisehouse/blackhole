import { Box, Button, ButtonGroup, Divider, TextField, Typography } from "@mui/material";
// import { Box, Button, ButtonGroup, Checkbox, Divider, FormControlLabel, FormGroup, TextField, Typography } from "@mui/material";
import { useState } from "react";

export function SettingsView({
  initialSettings,
  onClickApply,
}) {
  const [settings, setSettings] = useState(initialSettings);

  const handleParametersChange = (event) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [event.target.name]: event.target.value,
    }));
  }
  // const handleUnitCheckBoxChange = (event) => {
  //   setSettings((prevUnitChekcs) => ({
  //     ...prevUnitChekcs,
  //     unit: event.target.name,
  //   }));
  // };

  const handleClickApply = () => {
    onClickApply(settings);
  };


  return (
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
          label="START PAUSE TIME (msec)"
          name="INITIALIZE_TIME"
          type="number"
          size="small"
          value={settings.INITIALIZE_TIME}
          onChange={handleParametersChange}
        />
      </div>
      <div>
        <TextField
          label="RESUME PAUSE TIME (Msec)"
          name="TR_WAITING"
          type="number"
          size="small"
          value={settings.TR_WAITING}
          onChange={handleParametersChange}
        />
      </div>
      <div>
        <TextField
          label="Sound_threshold"
          name="TS_CONDITION_MIN_VALUE"
          type="number"
          size="small"
          value={settings.TS_CONDITION_MIN_VALUE}
          onChange={handleParametersChange}
        />
      </div>
      <div>
        <TextField
          label="La_threshold_up"
          name="TL_CONDITION_UP_VALUE"
          type="number"
          size="small"
          value={settings.TL_CONDITION_UP_VALUE}
          onChange={handleParametersChange}
        />
      </div>
      <div>
        <TextField
          label="La_threshold_down"
          name="TL_CONDITION_DOWN_VALUE"
          type="number"
          size="small"
          value={settings.TL_CONDITION_DOWN_VALUE}
          onChange={handleParametersChange}
        />
      </div>
      <div>
        <TextField
          label="Ra_threshold"
          name="TR_CONDITION_MIN_VALUE"
          type="number"
          size="small"
          value={settings.TR_CONDITION_MIN_VALUE}
          onChange={handleParametersChange}
        />
      </div>
      <div>
        <TextField
          label="Time_available_max (msec)"
          name="TS2_CONDITION_MAX_TIME"
          type="number"
          size="small"
          value={settings.TS2_CONDITION_MAX_TIME}
          onChange={handleParametersChange}
        />
      </div>
      <div>
        <TextField
          label="Time-available_min (msec)"
          name="TS2_CONDITION_MIN_TIME"
          type="number"
          size="small"
          value={settings.TS2_CONDITION_MIN_TIME}
          onChange={handleParametersChange}
        />
      </div>
      <div>
        <TextField
          label="Limit_t2ra (msec)"
          name="TR_CONDITION_MAX_TIME"
          type="number"
          size="small"
          value={settings.TR_CONDITION_MAX_TIME}
          onChange={handleParametersChange}
        />
      </div>
      <div>
        <TextField
          label="Limit_t2la (msec)"
          name="TL_CONDITION_MAX_TIME"
          type="number"
          size="small"
          value={settings.TL_CONDITION_MAX_TIME}
          onChange={handleParametersChange}
        />
      </div>
      <div>
        <TextField
          label="User_Parameter"
          name="userParameter"
          type="number"
          size="small"
          value={settings.userParameter}
          onChange={handleParametersChange}
        />
      </div>
      <Divider/>
      {/* <Typography
        variant="h6"
      >
        Unit
      </Typography>
      <FormGroup>
        <FormControlLabel control={
          <Checkbox
            name='m'
            checked={settings.unit === 'm'}
            onChange={handleUnitCheckBoxChange} />} label="m" />
        <FormControlLabel control={
          <Checkbox
            name='ft'
            checked={settings.unit === 'ft'}
            onChange={handleUnitCheckBoxChange} />} label="ft" />
        <FormControlLabel control={
          <Checkbox
            name="mPerSteps"
            checked={settings.unit === 'mPerSteps'}
            onChange={handleUnitCheckBoxChange} />} label="m/steps" />
        <TextField
          label="m/steps"
          name="mPerSteps"
          type="number"
          size="small"
          value={settings.mPerSteps}
          onChange={handleParametersChange}
        />
        <FormControlLabel control={
          <Checkbox
            name="ftPerSteps"
            checked={settings.unit === 'ftPerSteps'}
            onChange={handleUnitCheckBoxChange} />} label="m/steps" />
        <TextField
          label="m/steps"
          name="ftPerSteps"
          type="number"
          size="small"
          value={settings.ftPerSteps}
          onChange={handleParametersChange}
        />
      </FormGroup> */}
      <div>
        <TextField
          label="ANRcoff"
          name="anrCoff"
          type="number"
          size="small"
          value={settings.anrCoff}
          onChange={handleParametersChange}
        />
      </div>
      <div>
        <TextField
          label="BNRcoff"
          name="bnrCoff"
          type="number"
          size="small"
          value={settings.bnrCoff}
          onChange={handleParametersChange}
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
  )
}