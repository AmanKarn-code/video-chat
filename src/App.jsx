import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [interest, setInterest] = useState('');
  const [matchedUser, setMatchedUser] = useState(null);
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    socket.on('matchFound', ({ socketId }) => {
      setMatchedUser(socketId);
      initiateCall(socketId);
    });

    socket.on('receiveSignal', ({ signal }) => {
      if (peerRef.current && signal) {
        peerRef.current.signal(signal);
      }
    });

    return () => {
      socket.off('matchFound');
      socket.off('receiveSignal');
    };
  }, []);

  const handleSubmit = async () => {
    await fetch('http://localhost:5000/api/interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interest, socketId: socket.id }),
    });
    socket.emit('findPartner', { interest });
  };

  const initiateCall = (socketId) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported in this browser");
      return;
    }
  
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
        const peer = new Peer({ initiator: true, trickle: false, stream });
  
        peer.on('signal', (data) => {
          socket.emit('sendSignal', { signal: data, to: socketId });
        });
  
        peer.on('stream', (userStream) => {
          if (userVideo.current) {
            userVideo.current.srcObject = userStream;
          }
        });
  
        peerRef.current = peer;
      })
      .catch((err) => console.error('Error accessing media devices:', err));
  };
  

  return (
    <div className="container">
      {!matchedUser ? (
        <div className="input-container">
          <input value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="Enter your interest" />
          <button onClick={handleSubmit}>Find Chat Partner</button>
        </div>
      ) : (
        <div className="video-chat">
          <video ref={myVideo} autoPlay playsInline className="video" />
          <video ref={userVideo} autoPlay playsInline className="video" />
        </div>
      )}
    </div>
  );
}

export default App;