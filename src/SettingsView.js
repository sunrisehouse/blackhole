import { Box, Button, ButtonGroup, Checkbox, Divider, FormControlLabel, FormGroup, TextField, Typography } from "@mui/material";
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
  const handleUnitCheckBoxChange = (event) => {
    setSettings((prevUnitChekcs) => ({
      ...prevUnitChekcs,
      unit: event.target.name,
    }));
  };

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
          label="ALcoff"
          name="alCoff"
          type="number"
          size="small"
          value={settings.alCoff}
          onChange={handleParametersChange}
        />
      </div>
      <div>
        <TextField
          label="BLcoff"
          name="blCoff"
          type="number"
          size="small"
          value={settings.blCoff}
          onChange={handleParametersChange}
        />
      </div>
      <div>
        <TextField
          label="CLcoff"
          name="clCoff"
          type="number"
          size="small"
          value={settings.clCoff}
          onChange={handleParametersChange}
        />
      </div>
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
      <div>
        <TextField
          label="CNRcoff"
          name="cnrCoff"
          type="number"
          size="small"
          value={settings.cnrCoff}
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
      <Typography
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
      </FormGroup>
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