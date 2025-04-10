import React, { useEffect, useRef, useContext } from 'react';
// import { UserContext } from '../context/UserContext';
import { io } from 'socket.io-client';

export const VideoChat = () => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef();
  const socket = useRef();
  const { user } = useContext(UserContext);

  useEffect(() => {
    const initializeVideoChat = async () => {
      try {
        // Get user's video and audio
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        localVideoRef.current.srcObject = stream;

        // Initialize WebSocket connection
        socket.current = io('http://localhost:3000');

        // Initialize RTCPeerConnection
        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // Add local stream to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.current.addTrack(track, stream);
        });

        // Handle incoming remote stream
        peerConnection.current.ontrack = (event) => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };

        // Socket event handlers
        socket.current.emit('find-match', { userId: user._id, interests: user.interests });

        socket.current.on('match-found', async (data) => {
          try {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            socket.current.emit('offer', { offer, to: data.matchedUser });
          } catch (error) {
            console.error('Error creating offer:', error);
          }
        });

        socket.current.on('offer', async (data) => {
          try {
            await peerConnection.current.setRemoteDescription(data.offer);
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socket.current.emit('answer', { answer, to: data.from });
          } catch (error) {
            console.error('Error handling offer:', error);
          }
        });

        socket.current.on('answer', async (data) => {
          try {
            await peerConnection.current.setRemoteDescription(data.answer);
          } catch (error) {
            console.error('Error handling answer:', error);
          }
        });

      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeVideoChat();

    return () => {
      // Cleanup
      if (socket.current) {
        socket.current.disconnect();
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full rounded-lg"
          />
          <p className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            You
          </p>
        </div>
        <div className="relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <p className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            Partner
          </p>
        </div>
      </div>
    </div>
  );
};