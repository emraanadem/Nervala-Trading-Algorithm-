const { spawn } = require("child_process");

const childPython = spawn('python3', ['./receive.py'])

childPython.stdout.on('data', (data) => {console.log('s '+ data);});

childPython.stderr.on('data', (data) => {console.error('s ' + data);});

childPython.on('close', (code) => {console.log('Child process exited with code ' + code)})

