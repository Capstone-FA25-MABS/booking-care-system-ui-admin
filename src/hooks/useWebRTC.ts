import { useRef, useState, useCallback, useEffect } from 'react';
import { useSharedChatHub } from './useSharedChatHub';
import { ChatService } from '@/services/chat.service';
import { CallStatus, CallType } from '@/types/communication.types';
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
// IMPORTANT: TURN server is required for production to handle NAT/firewall traversal
// Without TURN, ~30% of connections will fail (users behind symmetric NAT)

// Get TURN server from env or use Metered.ca default
const TURN_SERVER = import.meta.env.VITE_TURN_SERVER || 'global.relay.metered.ca';
const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME || '';
const TURN_CREDENTIAL = import.meta.env.VITE_TURN_CREDENTIAL || '';

// ExpressTURN backup credentials
const EXPRESS_TURN_SERVER = 'relay1.expressturn.com';
const EXPRESS_TURN_PORT = 3480;
const EXPRESS_TURN_USERNAME = '00000002081594158';
const EXPRESS_TURN_CREDENTIAL = 'gKqRgvgmEMMDyAoYvRCgHmY/BjQ=';

// Log TURN credentials for debugging (remove in production)
console.log('[WebRTC] 🔧 TURN Config:', {
    primary: TURN_SERVER,
    backup: EXPRESS_TURN_SERVER,
    username: TURN_USERNAME ? '✅ Set' : '❌ Missing',
    credential: TURN_CREDENTIAL ? '✅ Set' : '❌ Missing',
});

// ✅ FIX #3: Remove iceCandidatePoolSize (conflicts with 2-phase signaling)
// ✅ FIX #4: Add explicit transport=udp for TURN URLs
const RTC_CONFIG: RTCConfiguration = {
    iceServers: [
        // STUN servers
        { urls: 'stun:stun.relay.metered.ca:80' },
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },

        // PRIMARY: Metered.ca TURN servers (only if credentials are set)
        ...(TURN_USERNAME && TURN_CREDENTIAL
            ? [
                  {
                      urls: `turn:${TURN_SERVER}:80?transport=udp`,
                      username: TURN_USERNAME,
                      credential: TURN_CREDENTIAL,
                  },
                  {
                      urls: `turn:${TURN_SERVER}:80?transport=tcp`,
                      username: TURN_USERNAME,
                      credential: TURN_CREDENTIAL,
                  },
                  {
                      urls: `turn:${TURN_SERVER}:443?transport=udp`,
                      username: TURN_USERNAME,
                      credential: TURN_CREDENTIAL,
                  },
                  {
                      urls: `turns:${TURN_SERVER}:443?transport=tcp`,
                      username: TURN_USERNAME,
                      credential: TURN_CREDENTIAL,
                  },
              ]
            : []),

        // BACKUP: ExpressTURN servers
        {
            urls: `turn:${EXPRESS_TURN_SERVER}:${EXPRESS_TURN_PORT}?transport=udp`,
            username: EXPRESS_TURN_USERNAME,
            credential: EXPRESS_TURN_CREDENTIAL,
        },
        {
            urls: `turn:${EXPRESS_TURN_SERVER}:${EXPRESS_TURN_PORT}?transport=tcp`,
            username: EXPRESS_TURN_USERNAME,
            credential: EXPRESS_TURN_CREDENTIAL,
        },
    ],
    // ✅ FIX #3: Removed iceCandidatePoolSize - conflicts with 2-phase signaling
};

// ✅ FIX #5: Relay-only config for ICE failure recovery
const RTC_CONFIG_RELAY_ONLY: RTCConfiguration = {
    ...RTC_CONFIG,
    iceTransportPolicy: 'relay', // Force TURN relay only
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
    callState: CallState;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isMuted: boolean;
    isVideoOff: boolean;
    isScreenSharing: boolean;
    startCall: (receiverId: string, conversationId: string) => Promise<void>;
    acceptCall: (callerId: string, conversationId: string) => Promise<void>;
    declineCall: (callerId: string, reason?: string) => Promise<void>;
    endCall: (otherUserId: string, reason?: string) => Promise<void>;
    toggleMute: () => void;
    toggleVideo: () => void;
    toggleScreenShare: () => Promise<void>;
    cleanup: () => void;
}

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
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // Refs
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteUserIdRef = useRef<string>('');
    const conversationIdRef = useRef<string>('');
    const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
    const isInitializingCallRef = useRef<boolean>(false);
    const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);
    const useRelayOnlyRef = useRef<boolean>(false); // ✅ FIX #5: Track if we should use relay-only

    // Call logging refs
    const callLogIdRef = useRef<string | null>(null);
    const callStartTimeRef = useRef<Date | null>(null);
    const isCallerRef = useRef<boolean>(false);
    const isCreatingCallLogRef = useRef<boolean>(false);

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

    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    const updateCallState = useCallback(
        (newState: CallState) => {
            console.log(`[WebRTC] Call state: ${callState} -> ${newState}`);
            setCallState(newState);
            callbacks?.onCallStateChange?.(newState);
        },
        [callState, callbacks]
    );

    const getUserMedia = useCallback(async (): Promise<MediaStream> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            });
            console.log('[WebRTC] Got user media stream with video + audio:', stream.id);
            setLocalStream(stream);
            callbacks?.onLocalStream?.(stream);
            return stream;
        } catch (videoError) {
            console.warn('[WebRTC] Failed to get video, trying audio-only:', videoError);
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                });
                console.log('[WebRTC] Got audio-only stream:', audioStream.id);
                setLocalStream(audioStream);
                setIsVideoOff(true);
                callbacks?.onLocalStream?.(audioStream);
                return audioStream;
            } catch (audioError) {
                console.error('[WebRTC] Failed to get any media:', audioError);
                callbacks?.onError?.(
                    new Error(
                        `Không thể truy cập camera/microphone: ${(audioError as Error).message}`
                    )
                );
                throw audioError;
            }
        }
    }, [callbacks]);

    const createCallLog = useCallback(async () => {
        try {
            if (!isCallerRef.current || callLogIdRef.current || isCreatingCallLogRef.current)
                return;
            isCreatingCallLogRef.current = true;

            const callerId = userId;
            const receiverId = remoteUserIdRef.current;
            const conversationId = conversationIdRef.current;

            if (!callerId || !receiverId || !conversationId) {
                isCreatingCallLogRef.current = false;
                return;
            }

            const response = await ChatService.createCallLog({
                conversationId,
                callerId,
                receiverId,
                type: CallType.Video,
            });

            if (response.success && response.data) {
                callLogIdRef.current = response.data.id;
                callStartTimeRef.current = new Date();
                console.log('[WebRTC] ✅ Call log created:', response.data.id);
            }
        } catch (error) {
            console.error('[WebRTC] ❌ Error creating call log:', error);
        } finally {
            isCreatingCallLogRef.current = false;
        }
    }, [userId]);

    const updateCallLog = useCallback(async (status: CallStatus) => {
        try {
            const callLogId = callLogIdRef.current;
            if (!callLogId) return;

            const endTime = new Date();
            const duration = callStartTimeRef.current
                ? Math.floor((endTime.getTime() - callStartTimeRef.current.getTime()) / 1000)
                : 0;

            await ChatService.updateCallLog({
                id: callLogId,
                status,
                endedAt: endTime.toISOString(),
                duration,
            });

            callLogIdRef.current = null;
            callStartTimeRef.current = null;
        } catch (error) {
            console.error('[WebRTC] ❌ Error updating call log:', error);
        }
    }, []);

    // ✅ FIX #5: Recreate PC with relay-only on ICE failure
    const recreatePeerConnectionWithRelay = useCallback(
        async (remoteUserId: string, stream: MediaStream): Promise<RTCPeerConnection> => {
            console.log('[WebRTC] 🔄 Recreating PC with relay-only policy');
            useRelayOnlyRef.current = true;

            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }

            const config = RTC_CONFIG_RELAY_ONLY;
            console.log('[WebRTC] Using relay-only config:', config.iceTransportPolicy);

            const pc = new RTCPeerConnection(config);
            setupPeerConnectionHandlers(pc, remoteUserId);

            for (const track of stream.getTracks()) {
                pc.addTrack(track, stream);
            }

            peerConnectionRef.current = pc;
            return pc;
        },
        []
    );

    const setupPeerConnectionHandlers = useCallback(
        (pc: RTCPeerConnection, remoteUserId: string) => {
            pc.onicecandidate = (event) => {
                if (event.candidate && remoteUserId) {
                    console.log('[WebRTC] 🧊 Sending ICE candidate:', event.candidate.type);
                    chatHub.connection
                        ?.invoke('SendIceCandidate', {
                            ReceiverId: remoteUserId,
                            Candidate: event.candidate.toJSON(),
                        })
                        .catch((err) =>
                            console.error('[WebRTC] ❌ Error sending ICE candidate:', err)
                        );
                }
            };

            pc.ontrack = (event) => {
                console.log('[WebRTC] 📹 Received remote track:', event.track.kind);
                if (event.streams?.[0]) {
                    setRemoteStream(event.streams[0]);
                    callbacks?.onRemoteStream?.(event.streams[0]);

                    // ✅ FIX #2: Check actual media flow, not just connection state
                    event.track.onunmute = () => {
                        console.log(
                            '[WebRTC] ✅ Track unmuted - media is flowing:',
                            event.track.kind
                        );
                    };
                }
            };

            pc.onconnectionstatechange = () => {
                console.log('[WebRTC] 📡 Connection state:', pc.connectionState);

                switch (pc.connectionState) {
                    case 'connected':
                        // ✅ FIX #2: Don't immediately assume success, verify media flow
                        console.log('[WebRTC] 🎯 DTLS connected, verifying media flow...');
                        verifyMediaFlow(pc);
                        break;
                    case 'disconnected':
                        console.warn('[WebRTC] ⚠️ Connection disconnected');
                        break;
                    case 'failed':
                        // ✅ FIX #5: Don't restartIce, recreate with relay
                        console.error('[WebRTC] ❌ Connection failed');
                        handleConnectionFailure(remoteUserId);
                        break;
                    case 'closed':
                        updateCallState('ended');
                        break;
                }
            };

            pc.oniceconnectionstatechange = () => {
                console.log('[WebRTC] 🧊 ICE state:', pc.iceConnectionState);

                if (pc.iceConnectionState === 'failed' && !useRelayOnlyRef.current) {
                    // ✅ FIX #5: Recreate with relay-only instead of restartIce
                    console.error('[WebRTC] ❌ ICE failed, will recreate with relay-only');
                    handleConnectionFailure(remoteUserId);
                }
            };
        },
        [callbacks, updateCallState]
    );

    // ✅ FIX #2: Verify actual media flow using getStats
    const verifyMediaFlow = useCallback(
        async (pc: RTCPeerConnection) => {
            try {
                // Wait a bit for media to start flowing
                await new Promise((resolve) => setTimeout(resolve, 2000));

                const stats = await pc.getStats();
                let hasInboundRtp = false;
                let bytesReceived = 0;

                stats.forEach((report) => {
                    if (report.type === 'inbound-rtp' && report.kind === 'video') {
                        hasInboundRtp = true;
                        bytesReceived = report.bytesReceived || 0;
                    }
                });

                if (hasInboundRtp && bytesReceived > 0) {
                    console.log('[WebRTC] ✅ Media verified - bytes received:', bytesReceived);
                    updateCallState('connected');
                    if (peerConnectionRef.current === pc) {
                        createCallLog();
                    }
                } else {
                    console.warn(
                        '[WebRTC] ⚠️ Connected but no media flow yet, bytes:',
                        bytesReceived
                    );
                    // Still update state, media might start flowing soon
                    updateCallState('connected');
                    if (peerConnectionRef.current === pc) {
                        createCallLog();
                    }
                }
            } catch (error) {
                console.error('[WebRTC] Error verifying media flow:', error);
                updateCallState('connected');
            }
        },
        [updateCallState, createCallLog]
    );

    // ✅ FIX #5: Handle connection failure by recreating with relay
    const handleConnectionFailure = useCallback(
        async (remoteUserId: string) => {
            if (useRelayOnlyRef.current) {
                console.error('[WebRTC] ❌ Already using relay-only, giving up');
                updateCallState('failed');
                return;
            }

            const stream = localStreamRef.current;
            if (!stream) {
                console.error('[WebRTC] ❌ No local stream for reconnection');
                updateCallState('failed');
                return;
            }

            try {
                console.log('[WebRTC] 🔄 Attempting reconnection with relay-only...');
                const pc = await recreatePeerConnectionWithRelay(remoteUserId, stream);

                if (isCallerRef.current) {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    await chatHub.connection?.invoke('SendOffer', {
                        ReceiverId: remoteUserId,
                        Signal: offer,
                    });
                }
            } catch (error) {
                console.error('[WebRTC] ❌ Reconnection failed:', error);
                updateCallState('failed');
            }
        },
        [updateCallState, recreatePeerConnectionWithRelay]
    );

    const createPeerConnection = useCallback(
        (remoteUserId: string): RTCPeerConnection => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }

            console.log('[WebRTC] Creating new peer connection for:', remoteUserId);
            const config = useRelayOnlyRef.current ? RTC_CONFIG_RELAY_ONLY : RTC_CONFIG;
            const pc = new RTCPeerConnection(config);

            setupPeerConnectionHandlers(pc, remoteUserId);

            peerConnectionRef.current = pc;
            return pc;
        },
        [setupPeerConnectionHandlers]
    );

    const addLocalStreamToPeer = useCallback((stream: MediaStream, pc: RTCPeerConnection) => {
        console.log('[WebRTC] Adding local stream to peer connection');
        for (const track of stream.getTracks()) {
            pc.addTrack(track, stream);
            console.log('[WebRTC] ✅ Added track:', track.kind);
        }
    }, []);

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

        if (peerConnectionRef.current) {
            const senders = peerConnectionRef.current.getSenders();
            for (const sender of senders) {
                if (sender.track?.readyState === 'live') {
                    sender.track.stop();
                }
            }
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        const currentLocalStream = localStreamRef.current;
        if (currentLocalStream) {
            for (const track of currentLocalStream.getTracks()) {
                if (track.readyState === 'live') track.stop();
            }
            localStreamRef.current = null;
            setLocalStream(null);
        }

        setRemoteStream(null);
        setCallState('idle');
        iceCandidateQueueRef.current = [];
        useRelayOnlyRef.current = false; // Reset relay-only flag

        console.log('[WebRTC] ✅ Cleanup completed');
    }, []);

    // ============================================================================
    // CALL ACTIONS - ✅ FIX #1: Correct signaling flow
    // ============================================================================

    /**
     * ✅ FIX #1: Start call - ONLY send StartCall signal, DON'T create PC yet
     * PC will be created in handleCallAccepted after callee accepts
     */
    const startCall = useCallback(
        async (receiverId: string, conversationId: string) => {
            try {
                console.log('[WebRTC] 📞 Starting call to:', receiverId);

                if (isInitializingCallRef.current) {
                    console.log('[WebRTC] ⏭️ Already initializing, ignoring');
                    return;
                }

                if (
                    callState !== 'idle' &&
                    callState !== 'ended' &&
                    callState !== 'declined' &&
                    callState !== 'failed'
                ) {
                    console.log('[WebRTC] ⏭️ Already in a call, ignoring');
                    return;
                }

                isInitializingCallRef.current = true;
                updateCallState('calling');

                isCallerRef.current = true;
                remoteUserIdRef.current = receiverId;
                conversationIdRef.current = conversationId;
                useRelayOnlyRef.current = false; // Reset relay-only flag

                // ✅ FIX #1: Get media first, but DON'T create PC yet
                console.log('[WebRTC] Getting local media...');
                await getUserMedia();
                console.log('[WebRTC] ✅ Got local media, waiting for callee to accept');

                // ✅ FIX #1: Only send StartCall signal, NO PC creation, NO offer
                console.log('[WebRTC] 📤 Sending StartCall signal to:', receiverId);
                await chatHub.connection?.invoke('StartCall', {
                    CalleeId: receiverId,
                    ConversationId: conversationId,
                    CallType: 'video',
                    CallerName: userInfo?.name,
                    CallerAvatar: userInfo?.avatar,
                });

                console.log('[WebRTC] ✅ StartCall sent, waiting for AcceptCall...');
                console.log('[WebRTC] ⏳ PC + Offer will be created AFTER callee accepts');

                isInitializingCallRef.current = false;
            } catch (error) {
                console.error('[WebRTC] Error starting call:', error);
                isInitializingCallRef.current = false;
                updateCallState('failed');
                cleanup();
                callbacks?.onError?.(error as Error);
            }
        },
        [callState, getUserMedia, updateCallState, cleanup, chatHub, userInfo, callbacks]
    );

    /**
     * Accept a call (Callee side)
     * Callee creates PC and waits for offer from caller
     */
    const acceptCall = useCallback(
        async (callerId: string, conversationId: string) => {
            try {
                console.log('[WebRTC] 📞 Accepting call from:', callerId);

                if (isInitializingCallRef.current) {
                    console.log('[WebRTC] ⏭️ Already initializing, ignoring');
                    return;
                }

                isInitializingCallRef.current = true;
                updateCallState('connecting');

                isCallerRef.current = false;
                remoteUserIdRef.current = callerId;
                conversationIdRef.current = conversationId;
                useRelayOnlyRef.current = false;

                console.log('[WebRTC] Getting local media...');
                const stream = await getUserMedia();
                console.log('[WebRTC] ✅ Got local media');

                // Callee creates PC and adds tracks
                console.log('[WebRTC] Creating peer connection...');
                const pc = createPeerConnection(callerId);
                addLocalStreamToPeer(stream, pc);
                console.log('[WebRTC] ✅ PC created, waiting for offer from caller');

                // Notify caller that call was accepted
                console.log('[WebRTC] 📤 Sending AcceptCall signal to:', callerId);
                await chatHub.connection?.invoke('AcceptCall', {
                    CallerId: callerId,
                    ConversationId: conversationId,
                });

                console.log('[WebRTC] ✅ AcceptCall sent, waiting for Offer...');
                isInitializingCallRef.current = false;
            } catch (error) {
                console.error('[WebRTC] ❌ Error accepting call:', error);
                isInitializingCallRef.current = false;
                updateCallState('failed');
                cleanup();
                callbacks?.onError?.(error as Error);
            }
        },
        [
            getUserMedia,
            createPeerConnection,
            addLocalStreamToPeer,
            updateCallState,
            cleanup,
            chatHub,
            callbacks,
        ]
    );

    const declineCall = useCallback(
        async (callerId: string, reason?: string) => {
            try {
                console.log('[WebRTC] Declining call from:', callerId);
                await updateCallLog(CallStatus.Rejected);
                isInitializingCallRef.current = false;

                await chatHub.connection?.invoke('DeclineCall', {
                    CallerId: callerId,
                    Reason: reason || 'declined',
                });

                updateCallState('declined');
                cleanup();
            } catch (error) {
                console.error('[WebRTC] Error declining call:', error);
                isInitializingCallRef.current = false;
                callbacks?.onError?.(error as Error);
            }
        },
        [updateCallState, cleanup, chatHub, callbacks, updateCallLog]
    );

    const endCall = useCallback(
        async (otherUserId: string, reason?: string) => {
            try {
                console.log('[WebRTC] Ending call with:', otherUserId);
                await updateCallLog(CallStatus.Accepted);
                isInitializingCallRef.current = false;

                await chatHub.connection?.invoke('EndCall', {
                    OtherUserId: otherUserId,
                    Reason: reason || 'ended',
                });

                updateCallState('ended');
                cleanup();
            } catch (error) {
                console.error('[WebRTC] Error ending call:', error);
                isInitializingCallRef.current = false;
                updateCallState('ended');
                cleanup();
            }
        },
        [updateCallState, cleanup, chatHub, updateCallLog]
    );

    const toggleMute = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }, [localStream]);

    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    }, [localStream]);

    const toggleScreenShare = useCallback(async () => {
        try {
            const pc = peerConnectionRef.current;
            if (!pc || !localStream) return;

            if (isScreenSharing) {
                // Stop screen share, return to camera
                const originalTrack = originalVideoTrackRef.current;
                if (originalTrack) {
                    const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
                    if (sender) await sender.replaceTrack(originalTrack);

                    const currentScreenTrack = localStream.getVideoTracks()[0];
                    if (currentScreenTrack) {
                        localStream.removeTrack(currentScreenTrack);
                        currentScreenTrack.stop();
                    }
                    localStream.addTrack(originalTrack);
                    callbacks?.onLocalStream?.(localStream);
                }
                setIsScreenSharing(false);
                originalVideoTrackRef.current = null;
            } else {
                // Start screen share
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: 'always' } as MediaTrackConstraints,
                    audio: false,
                });

                const screenTrack = screenStream.getVideoTracks()[0];
                if (!screenTrack) return;

                const currentVideoTrack = localStream.getVideoTracks()[0];
                if (currentVideoTrack) {
                    originalVideoTrackRef.current = currentVideoTrack;
                }

                const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
                if (sender) await sender.replaceTrack(screenTrack);

                if (currentVideoTrack) localStream.removeTrack(currentVideoTrack);
                localStream.addTrack(screenTrack);
                callbacks?.onLocalStream?.(localStream);

                screenTrack.onended = () => toggleScreenShare();
                setIsScreenSharing(true);
            }
        } catch (error) {
            console.error('[WebRTC] Error toggling screen share:', error);
            if ((error as Error).name !== 'NotAllowedError') {
                callbacks?.onError?.(error as Error);
            }
        }
    }, [localStream, isScreenSharing, callbacks]);

    // ============================================================================
    // SIGNALR EVENT HANDLERS
    // ============================================================================

    /**
     * Handle incoming WebRTC offer (Callee receives this)
     */
    const handleReceiveOffer = useCallback(
        async (data: WebRTCOfferData) => {
            try {
                console.log('[WebRTC] 📥 Received offer from:', data.senderId);

                const pc = peerConnectionRef.current;
                if (!pc) {
                    console.error('[WebRTC] ❌ No peer connection to handle offer');
                    return;
                }

                if (pc.signalingState !== 'stable') {
                    console.log('[WebRTC] ⏭️ Ignoring offer, signaling state:', pc.signalingState);
                    return;
                }

                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                console.log('[WebRTC] ✅ Set remote description (offer)');

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                console.log('[WebRTC] ✅ Created and set answer');

                await chatHub.connection?.invoke('SendAnswer', {
                    ReceiverId: data.senderId,
                    Signal: answer,
                });
                console.log('[WebRTC] ✅ Answer sent');

                await processQueuedIceCandidates(pc);
            } catch (error) {
                console.error('[WebRTC] ❌ Error handling offer:', error);
                callbacks?.onError?.(error as Error);
            }
        },
        [chatHub.connection, processQueuedIceCandidates, callbacks]
    );

    /**
     * Handle incoming WebRTC answer (Caller receives this)
     */
    const handleReceiveAnswer = useCallback(
        async (data: WebRTCAnswerData) => {
            try {
                console.log('[WebRTC] 📥 Received answer from:', data.senderId);

                const pc = peerConnectionRef.current;
                if (!pc) {
                    console.error('[WebRTC] No peer connection to handle answer');
                    return;
                }

                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                console.log('[WebRTC] ✅ Set remote description (answer)');

                await processQueuedIceCandidates(pc);
            } catch (error) {
                console.error('[WebRTC] Error handling answer:', error);
                callbacks?.onError?.(error as Error);
            }
        },
        [processQueuedIceCandidates, callbacks]
    );

    /**
     * Handle incoming ICE candidate
     */
    const handleReceiveIceCandidate = useCallback(async (data: ICECandidateData) => {
        try {
            console.log('[WebRTC] 🧊 Received ICE candidate from:', data.senderId);

            const pc = peerConnectionRef.current;
            if (!pc || !pc.remoteDescription) {
                console.log('[WebRTC] ⏳ Queueing ICE candidate');
                iceCandidateQueueRef.current.push(data.candidate);
                return;
            }

            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            console.log('[WebRTC] ✅ Added ICE candidate');
        } catch (error) {
            console.error('[WebRTC] ❌ Error adding ICE candidate:', error);
        }
    }, []);

    /**
     * ✅ FIX #1: Handle call accepted - NOW create PC and send offer
     * This is the correct time to create PC (after callee is ready)
     */
    const handleCallAccepted = useCallback(
        async (data: CallAcceptedData) => {
            console.log('[WebRTC] ✅ Call accepted by:', data.calleeId);
            updateCallState('connecting');

            // ✅ FIX #1: NOW create PC and send offer (callee is ready)
            try {
                const stream = localStreamRef.current;
                if (!stream) {
                    console.error('[WebRTC] ❌ No local stream available');
                    updateCallState('failed');
                    return;
                }

                console.log('[WebRTC] 🔧 Creating PC now (after callee accepted)');
                const pc = createPeerConnection(data.calleeId);
                addLocalStreamToPeer(stream, pc);

                console.log('[WebRTC] 📝 Creating offer...');
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                console.log('[WebRTC] 📤 Sending offer to:', data.calleeId);
                await chatHub.connection?.invoke('SendOffer', {
                    ReceiverId: data.calleeId,
                    Signal: offer,
                });

                console.log('[WebRTC] ✅ Offer sent successfully');
            } catch (error) {
                console.error('[WebRTC] ❌ Error in handleCallAccepted:', error);
                updateCallState('failed');
                callbacks?.onError?.(error as Error);
            }
        },
        [updateCallState, createPeerConnection, addLocalStreamToPeer, chatHub, callbacks]
    );

    const handleCallDeclined = useCallback(
        async (data: CallDeclinedData) => {
            console.log('[WebRTC] Call declined by:', data.calleeId);
            await updateCallLog(CallStatus.Rejected);
            isInitializingCallRef.current = false;
            updateCallState('declined');
            cleanup();
        },
        [updateCallState, cleanup, updateCallLog]
    );

    const handleCallEnded = useCallback(
        async (data: CallEndedData) => {
            console.log('[WebRTC] Call ended by:', data.userId);
            await updateCallLog(CallStatus.Accepted);
            isInitializingCallRef.current = false;
            updateCallState('ended');
            cleanup();
        },
        [updateCallState, cleanup, updateCallLog]
    );

    const handleUserBusy = useCallback(
        async (data: UserBusyData) => {
            console.log('[WebRTC] User is busy:', data.userId);
            await updateCallLog(CallStatus.Rejected);
            isInitializingCallRef.current = false;
            updateCallState('busy');
            cleanup();
        },
        [updateCallState, cleanup, updateCallLog]
    );

    // Update handlers ref
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
        return () => cleanup();
    }, [cleanup]);

    return {
        callState,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        isScreenSharing,
        startCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        toggleVideo,
        toggleScreenShare,
        cleanup,
    };
};
