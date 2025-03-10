import * as express from 'express';
import * as pty from 'node-pty';

const app = express();
const expressWs = require('express-ws')(app);

// Serve static assets from ./static
app.use(express.static(`${__dirname}/static`));

// Instantiate shell and set up data handlers
expressWs.app.ws('/shell', (ws, req) => {

  // Spawn the shell
  // Compliments of http://krasimirtsonev.com/blog/article/meet-evala-your-terminal-in-the-browser-extension
  const shell = pty.spawn('/bin/bash', [], {
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
