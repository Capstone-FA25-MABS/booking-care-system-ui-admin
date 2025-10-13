# VideoCall Component - WebRTC Integration Guide

## Current Implementation

The VideoCall component is built with WebRTC integration in mind. Currently it uses:

- Mock UI elements for video call interface
- State management for call controls (mute, video on/off, speaker)
- Refs prepared for future WebRTC streams

## Architecture for WebRTC Integration

### 1. Video Elements

- `localVideoRef`: For local camera stream
- `remoteVideoRef`: For remote participant stream

### 2. State Management

- `isMicMuted`: Controls microphone state
- `isVideoOff`: Controls camera state
- `isSpeakerMuted`: Controls speaker state
- `isCallActive`: Tracks call status
- `callDuration`: Timer for call duration

### 3. Future WebRTC Implementation

#### Step 1: Initialize MediaStream

```typescript
const initializeMedia = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        localStreamRef.current = stream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
    }
};
```

#### Step 2: Setup RTCPeerConnection

```typescript
const initializePeerConnection = () => {
    const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnectionRef.current = peerConnection;

    // Add local stream tracks
    if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStreamRef.current!);
        });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
    };

    return peerConnection;
};
```

#### Step 3: Signaling Server Integration

```typescript
// WebSocket connection for signaling
const signalingSocket = new WebSocket('ws://your-signaling-server');

signalingSocket.onmessage = async (message) => {
    const data = JSON.parse(message.data);

    switch (data.type) {
        case 'offer':
            await handleOffer(data.offer);
            break;
        case 'answer':
            await handleAnswer(data.answer);
            break;
        case 'ice-candidate':
            await handleIceCandidate(data.candidate);
            break;
    }
};
```

### 4. Control Functions Implementation

The toggle functions are already prepared for WebRTC:

```typescript
const toggleMic = () => {
    setIsMicMuted(!isMicMuted);
    if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
            track.enabled = isMicMuted;
        });
    }
};

const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((track) => {
            track.enabled = isVideoOff;
        });
    }
};
```

### 5. Cleanup on Call End

```typescript
const handleEndCall = () => {
    // Stop all tracks
    if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
    }

    // Close signaling connection
    if (signalingSocket) {
        signalingSocket.close();
    }

    // Reset state
    setIsCallActive(false);
    setCallDuration(0);
    onClose();
};
```

## Required Dependencies

Add these to package.json:

```json
{
    "dependencies": {
        "socket.io-client": "^4.x.x" // for signaling server
    }
}
```

## Backend Requirements

1. **Signaling Server**: WebSocket server for exchanging offers/answers/ICE candidates
2. **STUN/TURN Server**: For NAT traversal
3. **Room Management**: Logic to handle multiple participants

## Security Considerations

1. Implement proper authentication before starting calls
2. Use HTTPS for media device access
3. Implement proper room/session management
4. Add input validation for signaling messages

## Testing Strategy

1. Test with different browsers (Chrome, Firefox, Safari)
2. Test network conditions (slow, fast, mobile)
3. Test with firewall/NAT scenarios
4. Test call quality metrics

## Progressive Enhancement

The current implementation allows for progressive enhancement:

1. Start with basic video call UI (current state)
2. Add WebRTC media capture
3. Add peer-to-peer connection
4. Add signaling server integration
5. Add advanced features (screen sharing, recording, etc.)
