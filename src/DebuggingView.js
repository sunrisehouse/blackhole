import { Box, Pagination, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs } from "@mui/material";
import { Console } from "./Console";
import { useState } from "react";

export function DebuggingView({
  flagChageLogs,
  startTime,
}) {
  const [tabIdx, setTabIdx] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIdx(newValue);
  };

  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 20;
  const handlePageChange = (event, value) => {
    setPageNumber(value);
  };
  const maxPageSize = Math.ceil(flagChageLogs.length / pageSize)

  return (
    <Paper>
      <Tabs value={tabIdx} onChange={handleTabChange} >
        <Tab label="console" value={0}/>
        <Tab label="flag logs" value={1}/> 
      </Tabs>
      {tabIdx === 0 ? (
        <Console/>
      ) : tabIdx === 1 ? (
        <Box>
          <Pagination count={maxPageSize} size="small" onChange={handlePageChange}/>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="right">time</TableCell>
                  <TableCell align="right">flag</TableCell>
                  <TableCell align="right">message</TableCell>
                  <TableCell align="right">ts1 flag</TableCell>
                  <TableCell align="right">ts1 time</TableCell>
                  <TableCell align="right">ts1 sample</TableCell>
                  <TableCell align="right">ts2 flag</TableCell>
                  <TableCell align="right">ts2 time</TableCell>
                  <TableCell align="right">ts2 sample</TableCell>
                  <TableCell align="right">tr flag</TableCell>
                  <TableCell align="right">tr time</TableCell>
                  <TableCell align="right">tr sample</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flagChageLogs.slice((pageNumber - 1) * pageSize, (pageNumber - 1) * pageSize + pageSize).map((log, index) => (
                  <TableRow
                    key={index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {/* <TableCell component="th" scope="row">{index}</TableCell> */}
                    <TableCell align="right">{log.time - startTime}</TableCell>
                    <TableCell align="right">{log.flag}</TableCell>
                    <TableCell align="right">{log.message}</TableCell>
                    <TableCell align="right">{log.value.ts1.flag ? 'true' : 'false'}</TableCell>
                    <TableCell align="right">{log.value.ts1.time - startTime}</TableCell>
                    <TableCell align="right">{log.value.ts1.sample}</TableCell>
                    <TableCell align="right">{log.value.ts2.flag ? 'true' : 'false'}</TableCell>
                    <TableCell align="right">{log.value.ts2.time - startTime}</TableCell>
                    <TableCell align="right">{log.value.ts2.sample}</TableCell>
                    <TableCell align="right">{log.value.tr.flag ? 'true' : 'false'}</TableCell>
                    <TableCell align="right">{log.value.tr.time - startTime}</TableCell>
                    <TableCell align="right">{log.value.tr.a}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <></>
      )}   
    </Paper>
  )
};
