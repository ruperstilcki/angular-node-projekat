// --- Core imports ---
import http from 'http'; // Native Node.js HTTP module to create the server
import debugLib from 'debug';
import app from './backend/app.js'; // Import Express app (Import the configured Express app)

// import Credentials and setup for MongoDB
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

// --- Initialize debug logger ---
const debug = debugLib('node-angular'); // Use Node's 'debug' module for logging

/* Normalize Port Function */
// Ensure that the port is a valid number, named pipe, or fallback
const normalizePort = val => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    // Named pipe
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
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE': // Port already in use
      console.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
};

/* Listening Callback */
// Log a message when the server is up and running
const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug(`Listening on ${bind}`); // Log using debug module
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

console.log(`🚀 Server running on port ${port}`);
