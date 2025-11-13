import { Server } from "socket.io";

let io;

/**
 * Initialize Socket.IO server on top of existing HTTP server.
 * @param {import('http').Server} server - HTTP server instance
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      // Add all frontend origins here
      origin: [
        'http://localhost:3000',
        'http://localhost:4200',
        'https://angular-node-projekat.onrender.com',
        'https://angular-node-projekat-478018.web.app',
        'https://angular-node-projekat-478018.firebaseapp.com'
        // Add your other allowed frontend URLs here
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Welcome message to newly connected client
    socket.emit('serverEvent', { message: 'Welcome client!' });

    // Listen to client events
    socket.on('clientEvent', (data) => {
      console.log('Received from client:', data);
      // Optionally respond to the client
      socket.emit('serverEvent', { message: 'Hello from server!' });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

/**
 * Getter for io instance if you need to emit events outside connection handler.
 */
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};
