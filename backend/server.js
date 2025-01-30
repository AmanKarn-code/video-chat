const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

mongoose.connect('mongodb://localhost:27017/videochat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  socketId: String,
  interest: String,
});
const User = mongoose.model('User', UserSchema);

app.use(express.json());
app.use(cors());

app.post('/api/interest', async (req, res) => {
  const { interest, socketId } = req.body;
  const user = new User({ interest, socketId });
  await user.save();
  res.json({ message: 'Interest saved' });
});

io.on('connection', (socket) => {
  socket.on('findPartner', async ({ interest }) => {
    const user = await User.findOne({ interest, socketId: { $ne: socket.id } });
    if (user) {
      io.to(user.socketId).emit('matchFound', { socketId: socket.id, interest });
      socket.emit('matchFound', { socketId: user.socketId, interest });
    }
  });

  socket.on('sendSignal', ({ signal, to }) => {
    io.to(to).emit('receiveSignal', { signal });
  });

  socket.on('disconnect', async () => {
    await User.deleteOne({ socketId: socket.id });
  });
});

server.listen(5000, () => console.log('Server running on port 5000'));