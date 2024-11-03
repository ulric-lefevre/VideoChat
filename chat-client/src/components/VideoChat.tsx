import { useRef, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import './VideoChat.css';

const VideoChat = () => {
    const socket = useRef<Socket | null>(null);
    const localStream = useRef<HTMLVideoElement>(null);
    const remoteStream = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        const initializeConnection = async () => {
            socket.current = io('https://localhost:4000');
            peerConnection.current = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
            });

            socket.current.on('connect', () => {
                console.log('Socket connected');
            });

            socket.current.on('offer', handleOffer);
            socket.current.on('answer', handleAnswer);
            socket.current.on('candidate', handleCandidate);

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localStream.current) {
                    console.log('Setting up local stream', stream);
                    localStream.current.srcObject = stream;
                }
                stream.getTracks().forEach((track) => {
                    peerConnection.current?.addTrack(track, stream);
                });
            } catch (err) {
                console.error("Error accessing media devices:", err);
            }

            peerConnection.current.ontrack = (event) => {
                if (remoteStream.current) {
                    console.log('Setting up remote stream', event.streams[0]);
                    remoteStream.current.srcObject = event.streams[0];
                }
            };

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate && socket.current) {
                    socket.current.emit('candidate', { candidate: event.candidate });
                }
            };

            createOffer();
        };

        initializeConnection();

        return () => {
            if (socket.current) {
                socket.current.off('connect');
                socket.current.off('offer', handleOffer);
                socket.current.off('answer', handleAnswer);
                socket.current.off('candidate', handleCandidate);
                socket.current.close();
            }
            if (peerConnection.current) {
                peerConnection.current.getSenders().forEach((sender) => sender.track?.stop());
                peerConnection.current.close();
            }
        };
    }, [peerConnection, socket]);

    const handleOffer = async (data: any) => {
        if (!peerConnection.current) return;

        try {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socket.current?.emit('answer', answer);
        } catch (err) {
            console.error("Error handling offer:", err);
        }
    };

    const handleAnswer = async (data: any) => {
        if (!peerConnection.current) return;

        try {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data));
        } catch (err) {
            console.error("Error handling answer:", err);
        }
    };

    const handleCandidate = (data: any) => {
        if (!peerConnection.current) return;

        const candidate = new RTCIceCandidate(data.candidate);
        peerConnection.current.addIceCandidate(candidate).catch((err) => {
            console.error("Error adding received ICE candidate", err);
        });
    };

    const createOffer = async () => {
        try {
            if (!peerConnection.current || !socket.current) return;

            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            socket.current.emit('offer', { offer });
        } catch (err) {
            console.error("Error creating offer:", err);
        }
    };

    return (
        <div className='video-chat'>
            <video className='remote-video' ref={remoteStream} autoPlay playsInline />
            <video className='local-video' ref={localStream} autoPlay playsInline />
        </div>
    );
};

export default VideoChat;
