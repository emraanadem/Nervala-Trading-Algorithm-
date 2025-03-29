import { Server } from 'socket.io';

// Store active WebSocket connections
const connections = new Map();

// Handle WebSocket connections
const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...');
    
    // Create new Socket.IO instance
    const io = new Server(res.socket.server);
    
    // Store the Socket.IO instance on the server object
    res.socket.server.io = io;
    
    // Handle client connections
    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      connections.set(socket.id, socket);
      
      // Send welcome message
      socket.emit('connected', { message: 'Connected to Nervala trade notification system' });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        connections.delete(socket.id);
      });
    });
  }
  
  // Send response to signify connection is ready
  res.end();
};

// Function to broadcast new trade notifications to all connected clients
export const notifyNewTrade = (trade) => {
  const io = global.io;
  if (io) {
    io.emit('new-trade', { trade });
    console.log(`Notification sent for new trade: ${trade.pair} ${trade.direction}`);
  }
};

// Export the WebSocket handler
export default ioHandler; 