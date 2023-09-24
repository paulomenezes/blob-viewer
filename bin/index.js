#! /usr/bin/env node
const { spawn } = require('child_process');

const startNextJSServer = spawn('npm', ['run', 'dev']);

startNextJSServer.stdout.on('data', (data) => {
  console.log(data.toString());
});

startNextJSServer.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

startNextJSServer.on('error', (error) => {
  console.log(`error: ${error.message}`);
});

startNextJSServer.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
