import { useRef, useState, useCallback, useEffect } from 'react';
import { useSharedChatHub } from './useSharedChatHub';
import type {
    WebRTCOfferData,
    WebRTCAnswerData,
    ICECandidateData,
    CallAcceptedData,
    CallDeclinedData,
    CallEndedData,
    UserBusyData,
} from './useChatHub';

// WebRTC Configuration
const RTC_CONFIG: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
    ],
};

export type CallState =
    | 'idle'
    | 'calling'
    | 'ringing'
    | 'connecting'
    | 'connected'
    | 'ended'
    | 'declined'
    | 'busy'
    | 'failed';

export interface WebRTCCallbacks {
    onCallStateChange?: (state: CallState) => void;
    onRemoteStream?: (stream: MediaStream) => void;
    onLocalStream?: (stream: MediaStream) => void;
    onError?: (error: Error) => void;
}

export interface UseWebRTCReturn {
    // State
    callState: CallState;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isMuted: boolean;
    isVideoOff: boolean;

    // Actions
    startCall: (receiverId: string, conversationId: string) => Promise<void>;
    acceptCall: (callerId: string, conversationId: string) => Promise<void>;
    declineCall: (callerId: string, reason?: string) => Promise<void>;
    endCall: (otherUserId: string, reason?: string) => Promise<void>;
    toggleMute: () => void;
    toggleVideo: () => void;

    // Cleanup
    cleanup: () => void;
}

/**
 * Custom hook để quản lý WebRTC peer connection và signaling
 */
export const useWebRTC = (
    userId: string,
    callbacks?: WebRTCCallbacks,
    userInfo?: { name?: string; avatar?: string }
): UseWebRTCReturn => {
    // State
    const [callState, setCallState] = useState<CallState>('idle');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // Refs
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteUserIdRef = useRef<string>('');
    const conversationIdRef = useRef<string>('');
    const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);

    // SignalR hub (callbacks will be registered later via useEffect)
    const chatHub = useSharedChatHub({});

    // Keep ref in sync with state to avoid dependencies
    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    /**
     * Update call state and trigger callback
     */
    const updateCallState = useCallback(
        (newState: CallState) => {
            console.log(`[WebRTC] Call state: ${callState} -> ${newState}`);
            setCallState(newState);
            callbacks?.onCallStateChange?.(newState);
        },
        [callState, callbacks]
    );

    /**
     * Get user media (camera + microphone)
     * Fallback to audio-only if camera is not available
     */
    const getUserMedia = useCallback(async (): Promise<MediaStream> => {
        try {
            // Try to get video + audio first
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            console.log('[WebRTC] Got user media stream with video + audio:', stream.id);
            setLocalStream(stream);
            callbacks?.onLocalStream?.(stream);

            return stream;
        } catch (videoError) {
            console.warn('[WebRTC] Failed to get video, trying audio-only:', videoError);

            try {
                // Fallback to audio-only
                const audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                });

                console.log('[WebRTC] Got audio-only stream:', audioStream.id);
                console.warn('[WebRTC] ⚠️ Camera không khả dụng. Cuộc gọi chỉ có âm thanh.');
                setLocalStream(audioStream);
                setIsVideoOff(true); // Mark video as off since we don't have camera
                callbacks?.onLocalStream?.(audioStream);

                return audioStream;
            } catch (audioError) {
                console.error('[WebRTC] Failed to get any media:', audioError);
                const err = audioError as Error;
                callbacks?.onError?.(
                    new Error(`Không thể truy cập camera/microphone: ${err.message}`)
                );
                throw audioError;
            }
        }
    }, [callbacks]);

    /**
     * Create RTCPeerConnection
     */
    const createPeerConnection = useCallback((): RTCPeerConnection => {
        if (peerConnectionRef.current) {
            console.log('[WebRTC] Closing existing peer connection');
            peerConnectionRef.current.close();
        }

        console.log('[WebRTC] Creating new peer connection');
        const pc = new RTCPeerConnection(RTC_CONFIG);

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && remoteUserIdRef.current) {
                console.log('[WebRTC] Sending ICE candidate to:', remoteUserIdRef.current);
                // Use chatHub directly without dependency to avoid re-creation
                chatHub.connection
                    ?.invoke('SendIceCandidate', {
                        ReceiverId: remoteUserIdRef.current,
                        Candidate: event.candidate.toJSON(),
                    })
                    .catch((err) => {
                        console.error('[WebRTC] Error sending ICE candidate:', err);
                    });
            }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
            console.log('[WebRTC] Received remote track:', event.track.kind);
            if (event.streams && event.streams[0]) {
                console.log('[WebRTC] Setting remote stream');
                setRemoteStream(event.streams[0]);
                callbacks?.onRemoteStream?.(event.streams[0]);
            }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
            console.log('[WebRTC] Connection state:', pc.connectionState);
            switch (pc.connectionState) {
                case 'connected':
                    updateCallState('connected');
                    break;
                case 'disconnected':
                case 'failed':
                    updateCallState('failed');
                    break;
                case 'closed':
                    updateCallState('ended');
                    break;
            }
        };

        // Handle ICE connection state changes
        pc.oniceconnectionstatechange = () => {
            console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
        };

        peerConnectionRef.current = pc;
        return pc;
    }, [callbacks, updateCallState]); // Removed chatHub.connection from dependencies

    /**
     * Add local stream to peer connection
     */
    const addLocalStreamToPeer = useCallback((stream: MediaStream, pc: RTCPeerConnection) => {
        console.log('[WebRTC] Adding local stream to peer connection');
        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
            console.log('[WebRTC] Added track:', track.kind);
        });
    }, []);

    /**
     * Process queued ICE candidates
     */
    const processQueuedIceCandidates = useCallback(async (pc: RTCPeerConnection) => {
        if (iceCandidateQueueRef.current.length > 0) {
            console.log(
                `[WebRTC] Processing ${iceCandidateQueueRef.current.length} queued ICE candidates`
            );
            for (const candidate of iceCandidateQueueRef.current) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (error) {
                    console.error('[WebRTC] Error adding queued ICE candidate:', error);
                }
            }
            iceCandidateQueueRef.current = [];
        }
    }, []);

    // ============================================================================
    // CLEANUP
    // ============================================================================

    const cleanup = useCallback(() => {
        console.log('[WebRTC] Cleanup called');

        // Stop local stream using ref to avoid dependency
        const currentLocalStream = localStreamRef.current;
        if (currentLocalStream) {
            currentLocalStream.getTracks().forEach((track) => {
                track.stop();
                console.log('[WebRTC] Stopped local track:', track.kind);
            });
            setLocalStream(null);
        }

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Reset state
        setRemoteStream(null);
        setCallState('idle');
        remoteUserIdRef.current = '';
        conversationIdRef.current = '';
        iceCandidateQueueRef.current = [];
    }, []); // No dependencies!

    // ============================================================================
    // CALL ACTIONS
    // ============================================================================

    /**
     * Start a call (Caller side)
     */
    const startCall = useCallback(
        async (receiverId: string, conversationId: string) => {
            try {
                console.log('[WebRTC] Starting call to:', receiverId);
                updateCallState('calling');

                remoteUserIdRef.current = receiverId;
                conversationIdRef.current = conversationId;

                // Get local media
                const stream = await getUserMedia();

                // Create peer connection
                const pc = createPeerConnection();
                addLocalStreamToPeer(stream, pc);

                // Create and send offer
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                console.log('[WebRTC] Sending offer to:', receiverId);

                // Send offer via SignalR
                await chatHub.connection?.invoke('SendOffer', {
                    ReceiverId: receiverId,
                    Signal: offer,
                });

                // Notify callee about incoming call
                await chatHub.connection?.invoke('StartCall', {
                    CalleeId: receiverId,
                    ConversationId: conversationId,
                    CallType: 'video',
                    CallerName: userInfo?.name,
                    CallerAvatar: userInfo?.avatar,
                });

                updateCallState('calling');
            } catch (error) {
                console.error('[WebRTC] Error starting call:', error);
                updateCallState('failed');
                cleanup();
                callbacks?.onError?.(error as Error);
            }
        },
        [getUserMedia, createPeerConnection, addLocalStreamToPeer, updateCallState, cleanup]
    );

    /**
     * Accept a call (Callee side)
     */
    const acceptCall = useCallback(
        async (callerId: string, conversationId: string) => {
            try {
                console.log('[WebRTC] Accepting call from:', callerId);
                updateCallState('connecting');

                remoteUserIdRef.current = callerId;
                conversationIdRef.current = conversationId;

                // Get local media
                const stream = await getUserMedia();

                // Create peer connection
                const pc = createPeerConnection();
                addLocalStreamToPeer(stream, pc);

                // Notify caller that call was accepted
                await chatHub.connection?.invoke('AcceptCall', {
                    CallerId: callerId,
                    ConversationId: conversationId,
                });

                updateCallState('connecting');
            } catch (error) {
                console.error('[WebRTC] Error accepting call:', error);
                updateCallState('failed');
                cleanup();
                callbacks?.onError?.(error as Error);
            }
        },
        [getUserMedia, createPeerConnection, addLocalStreamToPeer, updateCallState, cleanup]
    );

    /**
     * Decline a call
     */
    const declineCall = useCallback(
        async (callerId: string, reason?: string) => {
            try {
                console.log('[WebRTC] Declining call from:', callerId);

                await chatHub.connection?.invoke('DeclineCall', {
                    CallerId: callerId,
                    Reason: reason || 'declined',
                });

                updateCallState('declined');
                cleanup();
            } catch (error) {
                console.error('[WebRTC] Error declining call:', error);
                callbacks?.onError?.(error as Error);
            }
        },
        [updateCallState, cleanup]
    );

    /**
     * End an active call
     */
    const endCall = useCallback(
        async (otherUserId: string, reason?: string) => {
            try {
                console.log('[WebRTC] Ending call with:', otherUserId);

                await chatHub.connection?.invoke('EndCall', {
                    OtherUserId: otherUserId,
                    Reason: reason || 'ended',
                });

                updateCallState('ended');
                cleanup();
            } catch (error) {
                console.error('[WebRTC] Error ending call:', error);
                updateCallState('ended');
                cleanup();
            }
        },
        [updateCallState, cleanup]
    );

    /**
     * Toggle microphone mute
     */
    const toggleMute = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
                console.log('[WebRTC] Microphone muted:', !audioTrack.enabled);
            }
        }
    }, [localStream]);

    /**
     * Toggle video on/off
     */
    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
                console.log('[WebRTC] Video off:', !videoTrack.enabled);
            }
        }
    }, [localStream]);

    // ============================================================================
    // SIGNALR EVENT HANDLERS
    // ============================================================================

    /**
     * Handle incoming WebRTC offer
     */
    const handleReceiveOffer = useCallback(
        async (data: WebRTCOfferData) => {
            try {
                console.log('[WebRTC] Received offer from:', data.senderId);

                // Ignore if we're already in a call
                if (callState !== 'idle' && callState !== 'ringing') {
                    console.log('[WebRTC] Ignoring offer, already in call state:', callState);
                    return;
                }

                const pc = peerConnectionRef.current;
                if (!pc) {
                    console.error('[WebRTC] No peer connection to handle offer');
                    return;
                }

                // Set remote description (offer)
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                console.log('[WebRTC] Set remote description (offer)');

                // Create and send answer
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                console.log('[WebRTC] Created answer');

                // Send answer via SignalR
                await chatHub.connection?.invoke('SendAnswer', {
                    ReceiverId: data.senderId,
                    Answer: answer,
                });

                console.log('[WebRTC] Sent answer to:', data.senderId);

                // Process queued ICE candidates
                await processQueuedIceCandidates(pc);
            } catch (error) {
                console.error('[WebRTC] Error handling offer:', error);
                callbacks?.onError?.(error as Error);
            }
        },
        [callState, chatHub.connection, processQueuedIceCandidates, callbacks]
    );

    /**
     * Handle incoming WebRTC answer
     */
    const handleReceiveAnswer = useCallback(
        async (data: WebRTCAnswerData) => {
            try {
                console.log('[WebRTC] Received answer from:', data.senderId);

                const pc = peerConnectionRef.current;
                if (!pc) {
                    console.error('[WebRTC] No peer connection to handle answer');
                    return;
                }

                // Set remote description (answer)
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                console.log('[WebRTC] Set remote description (answer)');

                // Process queued ICE candidates
                await processQueuedIceCandidates(pc);

                updateCallState('connected');
            } catch (error) {
                console.error('[WebRTC] Error handling answer:', error);
                callbacks?.onError?.(error as Error);
            }
        },
        [processQueuedIceCandidates, updateCallState, callbacks]
    );

    /**
     * Handle incoming ICE candidate
     */
    const handleReceiveIceCandidate = useCallback(async (data: ICECandidateData) => {
        try {
            console.log('[WebRTC] Received ICE candidate from:', data.senderId);

            const pc = peerConnectionRef.current;
            if (!pc) {
                console.error('[WebRTC] No peer connection for ICE candidate');
                return;
            }

            // If remote description is not set yet, queue the candidate
            if (!pc.remoteDescription) {
                console.log('[WebRTC] Queueing ICE candidate (no remote description yet)');
                iceCandidateQueueRef.current.push(data.candidate);
                return;
            }

            // Add ICE candidate
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            console.log('[WebRTC] Added ICE candidate');
        } catch (error) {
            console.error('[WebRTC] Error adding ICE candidate:', error);
        }
    }, []);

    /**
     * Handle call accepted
     */
    const handleCallAccepted = useCallback(
        (data: CallAcceptedData) => {
            console.log('[WebRTC] Call accepted by:', data.calleeId);
            updateCallState('connecting');
        },
        [updateCallState]
    );

    /**
     * Handle call declined
     */
    const handleCallDeclined = useCallback(
        (data: CallDeclinedData) => {
            console.log('[WebRTC] Call declined by:', data.calleeId, 'reason:', data.reason);
            updateCallState('declined');
            cleanup();
        },
        [updateCallState, cleanup]
    );

    /**
     * Handle call ended
     */
    const handleCallEnded = useCallback(
        (data: CallEndedData) => {
            console.log('[WebRTC] Call ended by:', data.userId, 'reason:', data.reason);
            updateCallState('ended');
            cleanup();
        },
        [updateCallState, cleanup]
    );

    /**
     * Handle user busy
     */
    const handleUserBusy = useCallback(
        (data: UserBusyData) => {
            console.log('[WebRTC] User is busy:', data.userId);
            updateCallState('busy');
            cleanup();
        },
        [updateCallState, cleanup]
    );

    // Register WebRTC callbacks with SignalR connection
    useEffect(() => {
        const connection = chatHub.connection;
        if (!connection) {
            console.log('[WebRTC] No SignalR connection available yet');
            return;
        }

        console.log('[WebRTC] Registering WebRTC event handlers');

        // Register event handlers
        connection.on('ReceiveOffer', handleReceiveOffer);
        connection.on('ReceiveAnswer', handleReceiveAnswer);
        connection.on('ReceiveIceCandidate', handleReceiveIceCandidate);
        connection.on('CallAccepted', handleCallAccepted);
        connection.on('CallDeclined', handleCallDeclined);
        connection.on('CallEnded', handleCallEnded);
        connection.on('UserBusy', handleUserBusy);

        // Cleanup: Unregister event handlers
        return () => {
            console.log('[WebRTC] Unregistering WebRTC event handlers');
            connection.off('ReceiveOffer', handleReceiveOffer);
            connection.off('ReceiveAnswer', handleReceiveAnswer);
            connection.off('ReceiveIceCandidate', handleReceiveIceCandidate);
            connection.off('CallAccepted', handleCallAccepted);
            connection.off('CallDeclined', handleCallDeclined);
            connection.off('CallEnded', handleCallEnded);
            connection.off('UserBusy', handleUserBusy);
        };
    }, [
        chatHub.connection,
        handleReceiveOffer,
        handleReceiveAnswer,
        handleReceiveIceCandidate,
        handleCallAccepted,
        handleCallDeclined,
        handleCallEnded,
        handleUserBusy,
    ]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        // State
        callState,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,

        // Actions
        startCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        toggleVideo,

        // Cleanup
        cleanup,
    };
};
