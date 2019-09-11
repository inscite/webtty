import * as express from 'express';
import * as pty from 'node-pty';

const app = express();
const expressWs = require('express-ws')(app);

// Serve static assets from ./static
app.use(express.static(`${__dirname}/static`));

// Instantiate shell and set up data handlers
expressWs.app.ws('/shell', (ws, req) => {

  const username = req.query.user ? req.query.user : '';
  const target = req.query.target ? req.query.target : '';

  var host:string;
  switch (target) {
    case "nurion": { host = "nurion.ksc.re.kr"; break; }
    case "kepler": { host = "glogin01.ksc.re.kr"; break; }
    case "volta": { host = "glogin02.ksc.re.kr"; break; }
    default: { host = ""; break; }
  }

  // Spawn the ssh process
  // const shell = pty.spawn('/bin/bash', [], {
  const shell = pty.spawn(
      '/usr/bin/ssh',
      ['-p', '22', '-l', username, host],
      {
    name: 'xterm-color',
    cwd: process.env.PWD,
    env: process.env
  });

  // resie shell
  shell.resize(120, 40);

  // For all shell data send it to the websocket
  shell.on('data', (data) => { ws.send(data); });

  // For all websocket data send it to the shell
  ws.on('message', (msg) => { shell.write(msg); });
});

// Start the application
app.listen(3600);
