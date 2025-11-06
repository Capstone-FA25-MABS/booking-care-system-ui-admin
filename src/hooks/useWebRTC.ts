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
    const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null); // ✅ Store offer to send after accept
    const isInitializingCallRef = useRef<boolean>(false); // ✅ Track if call initialization is in progress

    // ✅ Refs for handlers to stabilize callbacks
    const handlersRef = useRef<any>({});

    // ✅ SignalR hub with stable callback wrappers
    const chatHub = useSharedChatHub({
        onReceiveOffer: useCallback(
            (data: any) => handlersRef.current.handleReceiveOffer?.(data),
            []
        ),
        onReceiveAnswer: useCallback(
            (data: any) => handlersRef.current.handleReceiveAnswer?.(data),
            []
        ),
        onReceiveIceCandidate: useCallback(
            (data: any) => handlersRef.current.handleReceiveIceCandidate?.(data),
            []
        ),
        onCallAccepted: useCallback(
            (data: any) => handlersRef.current.handleCallAccepted?.(data),
            []
        ),
        onCallDeclined: useCallback(
            (data: any) => handlersRef.current.handleCallDeclined?.(data),
            []
        ),
        onCallEnded: useCallback((data: any) => handlersRef.current.handleCallEnded?.(data), []),
        onUserBusy: useCallback((data: any) => handlersRef.current.handleUserBusy?.(data), []),
    });

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
     * @param remoteUserId - The remote user ID to send ICE candidates to (captured in closure)
     */
    const createPeerConnection = useCallback(
        (remoteUserId: string): RTCPeerConnection => {
            if (peerConnectionRef.current) {
                console.log('[WebRTC] Closing existing peer connection');
                peerConnectionRef.current.close();
            }

            console.log('[WebRTC] Creating new peer connection for:', remoteUserId);
            const pc = new RTCPeerConnection(RTC_CONFIG);

            // Handle ICE candidates - use closure variable instead of ref to avoid Strict Mode issues
            pc.onicecandidate = (event) => {
                console.log('[WebRTC] 🧊 onicecandidate event fired:', {
                    hasCandidate: !!event.candidate,
                    remoteUserId: remoteUserId, // ✅ Use closure variable
                    candidateType: event.candidate?.type,
                    candidateProtocol: event.candidate?.protocol,
                });

                if (event.candidate && remoteUserId) {
                    // ✅ Use closure variable
                    console.log('[WebRTC] Sending ICE candidate to:', remoteUserId);
                    console.log('[WebRTC] Candidate details:', {
                        type: event.candidate.type,
                        protocol: event.candidate.protocol,
                        address: event.candidate.address,
                    });

                    // Use chatHub directly without dependency to avoid re-creation
                    chatHub.connection
                        ?.invoke('SendIceCandidate', {
                            ReceiverId: remoteUserId, // ✅ Use closure variable
                            Candidate: event.candidate.toJSON(),
                        })
                        .then(() => {
                            console.log('[WebRTC] ✅ ICE candidate sent successfully');
                        })
                        .catch((err) => {
                            console.error('[WebRTC] ❌ Error sending ICE candidate:', err);
                        });
                } else if (!event.candidate) {
                    console.log('[WebRTC] ✅ ICE gathering completed (null candidate)');
                } else if (!remoteUserId) {
                    // ✅ Use closure variable
                    console.warn(
                        '[WebRTC] ⚠️ No remoteUserId in closure, cannot send ICE candidate'
                    );
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
                console.log('[WebRTC] 🧊 ICE connection state:', pc.iceConnectionState);
            };

            // Handle ICE gathering state changes
            pc.onicegatheringstatechange = () => {
                console.log('[WebRTC] 🧊 ICE gathering state:', pc.iceGatheringState);
            };

            peerConnectionRef.current = pc;
            return pc;
        },
        [callbacks, updateCallState]
    ); // Removed chatHub.connection from dependencies

    /**
     * Add local stream to peer connection
     */
    const addLocalStreamToPeer = useCallback((stream: MediaStream, pc: RTCPeerConnection) => {
        console.log('[WebRTC] Adding local stream to peer connection');
        console.log('[WebRTC] Stream tracks:', stream.getTracks());
        console.log('[WebRTC] Peer connection senders before:', pc.getSenders().length);
        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
            console.log('[WebRTC] ✅ Added track:', track.kind, 'enabled:', track.enabled);
        });
        console.log('[WebRTC] Peer connection senders after:', pc.getSenders().length);
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

        // ✅ Stop ALL tracks from peer connection senders FIRST
        if (peerConnectionRef.current) {
            const senders = peerConnectionRef.current.getSenders();
            console.log('[WebRTC] Stopping tracks from', senders.length, 'senders');
            senders.forEach((sender) => {
                if (sender.track) {
                    console.log(
                        '[WebRTC] Stopping track from sender:',
                        sender.track.kind,
                        'state:',
                        sender.track.readyState
                    );
                    if (sender.track.readyState === 'live') {
                        sender.track.stop();
                    }
                }
            });
        }

        // ✅ Stop local stream tracks from ref (backup, in case missed above)
        const currentLocalStream = localStreamRef.current;
        if (currentLocalStream) {
            console.log('[WebRTC] Stopping local stream tracks');
            currentLocalStream.getTracks().forEach((track) => {
                console.log(
                    '[WebRTC] Stopping local track:',
                    track.kind,
                    'state:',
                    track.readyState
                );
                if (track.readyState === 'live') {
                    track.stop();
                }
            });
            localStreamRef.current = null;
            setLocalStream(null);
        }

        // ✅ Close peer connection
        if (peerConnectionRef.current) {
            console.log('[WebRTC] Closing peer connection');
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Reset state
        setRemoteStream(null);
        setCallState('idle');
        remoteUserIdRef.current = '';
        conversationIdRef.current = '';
        iceCandidateQueueRef.current = [];
        pendingOfferRef.current = null; // ✅ Clear pending offer
        // ✅ DON'T clear isInitializingCallRef here - async operations may still be running!
        // It will be cleared when startCall/acceptCall completes

        console.log('[WebRTC] ✅ Cleanup completed');
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
                console.log('[WebRTC] 📞 Starting call to:', receiverId);
                console.log('[WebRTC] Current call state:', callState);
                console.log('[WebRTC] Is initializing:', isInitializingCallRef.current);

                // ✅ Prevent calling if already initializing (async protection)
                if (isInitializingCallRef.current) {
                    console.log(
                        '[WebRTC] ⏭️ Call initialization already in progress, ignoring startCall'
                    );
                    return;
                }

                // ✅ Prevent calling if already in a call
                if (
                    callState !== 'idle' &&
                    callState !== 'ended' &&
                    callState !== 'declined' &&
                    callState !== 'failed'
                ) {
                    console.log('[WebRTC] ⏭️ Already in a call, ignoring startCall');
                    return;
                }

                // ✅ Mark as initializing
                isInitializingCallRef.current = true;
                console.log('[WebRTC] Setting call state to calling');
                updateCallState('calling');

                remoteUserIdRef.current = receiverId;
                conversationIdRef.current = conversationId;

                console.log('[WebRTC] Getting local media...');
                // Get local media
                const stream = await getUserMedia();
                console.log('[WebRTC] ✅ Got local media');

                console.log('[WebRTC] Creating peer connection...');
                // Create peer connection with remoteUserId captured in closure
                const pc = createPeerConnection(receiverId); // ✅ Pass receiverId
                addLocalStreamToPeer(stream, pc);
                console.log('[WebRTC] ✅ Peer connection created and tracks added');

                console.log('[WebRTC] Creating offer...');
                // Create offer and store it - will send after callee accepts
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                console.log('[WebRTC] ✅ Offer created and set as local description');

                // ✅ Store offer to send later (after CallAccepted)
                pendingOfferRef.current = offer;

                // Notify callee about incoming call (but DON'T send offer yet!)
                console.log('[WebRTC] 📤 Sending StartCall signal to:', receiverId);
                await chatHub.connection?.invoke('StartCall', {
                    CalleeId: receiverId,
                    ConversationId: conversationId,
                    CallType: 'video',
                    CallerName: userInfo?.name,
                    CallerAvatar: userInfo?.avatar,
                });
                console.log('[WebRTC] ✅ StartCall signal sent, waiting for acceptance...');
                console.log('[WebRTC] ⏳ Offer will be sent after callee accepts');

                updateCallState('calling');
                // ✅ Clear initializing flag after successful init
                isInitializingCallRef.current = false;
            } catch (error) {
                console.error('[WebRTC] Error starting call:', error);
                // ✅ Clear initializing flag on error
                isInitializingCallRef.current = false;
                updateCallState('failed');
                cleanup();
                callbacks?.onError?.(error as Error);
            }
        },
        [
            callState,
            getUserMedia,
            createPeerConnection,
            addLocalStreamToPeer,
            updateCallState,
            cleanup,
            chatHub,
            userInfo,
        ]
    );

    /**
     * Accept a call (Callee side)
     */
    const acceptCall = useCallback(
        async (callerId: string, conversationId: string) => {
            try {
                console.log('[WebRTC] 📞 Accepting call from:', callerId);
                console.log('[WebRTC] Current call state:', callState);
                console.log('[WebRTC] Is initializing:', isInitializingCallRef.current);

                // ✅ Prevent accepting if already initializing (async protection)
                if (isInitializingCallRef.current) {
                    console.log(
                        '[WebRTC] ⏭️ Call initialization already in progress, ignoring acceptCall'
                    );
                    return;
                }

                // ✅ Prevent accepting if already in a call
                if (
                    callState !== 'idle' &&
                    callState !== 'ended' &&
                    callState !== 'declined' &&
                    callState !== 'failed'
                ) {
                    console.log('[WebRTC] ⏭️ Already in a call, ignoring acceptCall');
                    return;
                }

                // ✅ Mark as initializing
                isInitializingCallRef.current = true;
                console.log('[WebRTC] Setting call state to connecting');
                updateCallState('connecting');

                remoteUserIdRef.current = callerId;
                conversationIdRef.current = conversationId;

                console.log('[WebRTC] Getting local media...');
                // Get local media
                const stream = await getUserMedia();
                console.log('[WebRTC] ✅ Got local media');

                console.log('[WebRTC] Creating peer connection...');
                // Create peer connection with remoteUserId captured in closure
                const pc = createPeerConnection(callerId); // ✅ Pass callerId
                addLocalStreamToPeer(stream, pc);
                console.log('[WebRTC] ✅ Peer connection created and tracks added');

                // Notify caller that call was accepted
                console.log('[WebRTC] Sending AcceptCall signal to:', callerId);
                await chatHub.connection?.invoke('AcceptCall', {
                    CallerId: callerId,
                    ConversationId: conversationId,
                });
                console.log('[WebRTC] ✅ AcceptCall signal sent');

                console.log(
                    '[WebRTC] 🔔 Waiting for Offer from caller to create and send Answer...'
                );
                updateCallState('connecting');
                // ✅ Clear initializing flag after successful init
                isInitializingCallRef.current = false;
            } catch (error) {
                console.error('[WebRTC] ❌ Error accepting call:', error);
                // ✅ Clear initializing flag on error
                isInitializingCallRef.current = false;
                updateCallState('failed');
                cleanup();
                callbacks?.onError?.(error as Error);
            }
        },
        [
            callState,
            getUserMedia,
            createPeerConnection,
            addLocalStreamToPeer,
            updateCallState,
            cleanup,
            chatHub,
        ]
    );

    /**
     * Decline a call
     */
    const declineCall = useCallback(
        async (callerId: string, reason?: string) => {
            try {
                console.log('[WebRTC] Declining call from:', callerId);

                // ✅ Clear initializing flag when declining call
                isInitializingCallRef.current = false;

                await chatHub.connection?.invoke('DeclineCall', {
                    CallerId: callerId,
                    Reason: reason || 'declined',
                });

                updateCallState('declined');
                cleanup();
            } catch (error) {
                console.error('[WebRTC] Error declining call:', error);
                // ✅ Clear initializing flag on error too
                isInitializingCallRef.current = false;
                callbacks?.onError?.(error as Error);
            }
        },
        [updateCallState, cleanup, chatHub, callbacks]
    );

    /**
     * End an active call
     */
    const endCall = useCallback(
        async (otherUserId: string, reason?: string) => {
            try {
                console.log('[WebRTC] Ending call with:', otherUserId);

                // ✅ Clear initializing flag when ending call
                isInitializingCallRef.current = false;

                await chatHub.connection?.invoke('EndCall', {
                    OtherUserId: otherUserId,
                    Reason: reason || 'ended',
                });

                updateCallState('ended');
                cleanup();
            } catch (error) {
                console.error('[WebRTC] Error ending call:', error);
                // ✅ Clear initializing flag on error too
                isInitializingCallRef.current = false;
                updateCallState('ended');
                cleanup();
            }
        },
        [updateCallState, cleanup, chatHub]
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
                console.log('[WebRTC] Current call state:', callState);

                const pc = peerConnectionRef.current;
                console.log('[WebRTC] Peer connection exists:', !!pc);
                if (!pc) {
                    console.error('[WebRTC] ❌ No peer connection to handle offer');
                    return;
                }

                console.log('[WebRTC] Peer connection signaling state:', pc.signalingState);
                console.log('[WebRTC] Peer connection connection state:', pc.connectionState);

                // ✅ Check signaling state - only process if in stable or have-remote-offer
                // Ignore duplicate offers when already processing one
                if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-remote-offer') {
                    console.log('[WebRTC] ⏭️ Ignoring offer, signaling state:', pc.signalingState);
                    return;
                }

                // ✅ If already connected, ignore new offers (prevent reconnection)
                if (callState === 'connected' && pc.connectionState === 'connected') {
                    console.log('[WebRTC] ⏭️ Ignoring offer, already connected');
                    return;
                }

                // Log offer data for debugging
                console.log('[WebRTC] Offer data:', data);
                console.log('[WebRTC] Offer type:', data.offer?.type);
                console.log('[WebRTC] Offer sdp length:', data.offer?.sdp?.length);

                // Set remote description (offer)
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                console.log('[WebRTC] ✅ Set remote description (offer)');

                // Create and send answer
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                console.log('[WebRTC] ✅ Created and set answer');

                // Send answer via SignalR
                console.log('[WebRTC] 📤 Sending answer to:', data.senderId);
                await chatHub.connection?.invoke('SendAnswer', {
                    ReceiverId: data.senderId,
                    Signal: answer,
                });
                console.log('[WebRTC] ✅ Answer sent');

                // Process queued ICE candidates
                await processQueuedIceCandidates(pc);
            } catch (error) {
                console.error('[WebRTC] ❌ Error handling offer:', error);
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
                // ✅ Queue candidate even if no peer connection yet
                console.log('[WebRTC] ⏳ No peer connection yet, queueing ICE candidate');
                iceCandidateQueueRef.current.push(data.candidate);
                return;
            }

            // If remote description is not set yet, queue the candidate
            if (!pc.remoteDescription) {
                console.log('[WebRTC] ⏳ Queueing ICE candidate (no remote description yet)');
                iceCandidateQueueRef.current.push(data.candidate);
                return;
            }

            // Add ICE candidate
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            console.log('[WebRTC] ✅ Added ICE candidate');
        } catch (error) {
            console.error('[WebRTC] ❌ Error adding ICE candidate:', error);
        }
    }, []);

    /**
     * Handle call accepted
     */
    const handleCallAccepted = useCallback(
        async (data: CallAcceptedData) => {
            console.log('[WebRTC] Call accepted by:', data.calleeId);
            updateCallState('connecting');

            // ✅ Now send the pending offer to callee
            if (pendingOfferRef.current && chatHub.connection) {
                console.log('[WebRTC] 📤 Sending pending offer to:', data.calleeId);
                try {
                    await chatHub.connection.invoke('SendOffer', {
                        ReceiverId: data.calleeId,
                        Signal: pendingOfferRef.current,
                    });
                    console.log('[WebRTC] ✅ Offer sent successfully');
                    pendingOfferRef.current = null; // Clear after sending
                } catch (error) {
                    console.error('[WebRTC] ❌ Error sending offer:', error);
                }
            } else {
                console.warn('[WebRTC] ⚠️ No pending offer to send or no connection');
            }
        },
        [updateCallState, chatHub]
    );

    /**
     * Handle call declined
     */
    const handleCallDeclined = useCallback(
        (data: CallDeclinedData) => {
            console.log('[WebRTC] Call declined by:', data.calleeId, 'reason:', data.reason);
            // ✅ Clear initializing flag
            isInitializingCallRef.current = false;
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
            // ✅ Clear initializing flag
            isInitializingCallRef.current = false;
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
            // ✅ Clear initializing flag
            isInitializingCallRef.current = false;
            updateCallState('busy');
            cleanup();
        },
        [updateCallState, cleanup]
    );

    // ✅ Update handlers ref when handlers change
    useEffect(() => {
        handlersRef.current = {
            handleReceiveOffer,
            handleReceiveAnswer,
            handleReceiveIceCandidate,
            handleCallAccepted,
            handleCallDeclined,
            handleCallEnded,
            handleUserBusy,
        };
    }, [
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
