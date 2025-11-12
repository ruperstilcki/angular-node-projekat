// -----------------------------
// 🚀 Server Entry Point (server.js)
// -----------------------------

// --- Load environment variables from .env file ---
import dotenv from 'dotenv';
dotenv.config(); // Initialize dotenv to load environment variables

// --- Core Node.js imports ---
import http from 'node:http'; // Native Node.js HTTP module for creating servers
import debugLib from 'debug'; // Debug utility for logging
import app from './app.js'; // Import configured Express app

// --- Initialize debug logger ---
const debug = debugLib('node-angular'); // Create a debug instance for namespaced logging

// -----------------------------
// Normalize Port
// -----------------------------
// Converts environment port to a valid number, named pipe, or false if invalid.
const normalizePort = val => {
  const port = Number.parseInt(val, 10);
  if (Number.isNaN(port)) {
    // If it's not a number, treat it as a named pipe (Windows/IPC)
    return val;
  }
  if (port >= 0) {
    // Valid numeric port
    return port;
  }
  return false; // Invalid port
};

// -----------------------------
// Set and Configure Port
// -----------------------------
// Use environment variable PORT or fallback to 3000
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port); // Store the port inside Express app

// -----------------------------
// Create HTTP Server
// -----------------------------
// Create a new HTTP server that uses the Express app as a request handler
const server = http.createServer(app);

// -----------------------------
// Error Handler
// -----------------------------
// Handles server-specific errors such as permission issues or port conflicts
const onError = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port;

  switch (error.code) {
    case 'EACCES': // Permission denied
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE': // Port is already in use
      console.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
};

// -----------------------------
// Listening Handler
// -----------------------------
// Triggered when the server successfully starts listening on the configured port
const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug(`✅ Listening on ${bind}`);
  console.log(`🚀 Server is running and listening on ${bind}`);
};

// -----------------------------
// Start Server
// -----------------------------
server.listen(port); // Start the server on the configured port
server.on('error', onError); // Bind error event
server.on('listening', onListening); // Bind listening event
