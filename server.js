// Import the configured Express app
const app = require('./backend/app');
// Use Node's 'debug' module for logging
const debug = require('debug')('node-angular');
// Native Node.js HTTP module to create the server
const http = require('http');

/* Normalize Port Function */
// Ensure that the port is a valid number, named pipe, or fallback
const normalizePort = val => {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // If not a number, treat as named pipe (used in Windows/IPC)
    return val;
  }
  if (port >= 0) {
    // Valid port number
    return port;
  }
  return false; // Invalid port
};

/* Error Handling Callback */
// Handle specific server errors (e.g., permission or port in use)
const onError = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port;
  switch (error.code) {
    case 'EACCES': // Requires elevated privileges
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE': // Port already in use
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/* Listening Callback */
// Log a message when the server is up and running
const onListening = () => {
  const addr = server.address();
  const bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port;
  debug('Listening on ' + bind); // Log using debug module
};

/* Bootstrapping the Server */
// Set server port (from env variable or default to 3000)
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port); // Save it inside the Express app

/* Create and Start the HTTP Server */
const server = http.createServer(app); // Create server with Express app
// Bind error handler
server.on('error', onError);
// Bind listening handler
server.on('listening', onListening);
// Start the server on the configured port
server.listen(port);
