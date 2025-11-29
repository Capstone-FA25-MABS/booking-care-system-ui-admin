import React, { useState, useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import styles from './VideoCall.module.scss';
import videojpg from '@/assets/img/media/video.jpg';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useCallRecording } from '@/hooks/useCallRecording';
import type { RootState } from '@/store';
import { useGlobalChat } from '@/providers/GlobalChatProvider';
import { MessageType, type MessageResponse } from '@/types/communication.types';
import VoiceTranscriptionService from '@/services/voiceTranscription.service';

interface VideoCallProps {
    isVisible: boolean;
    onClose: () => void;
    participantId: string;
    conversationId: string;
    participantName?: string;
    participantAvatar?: string;
    callType?: 'video' | 'audio';
    isIncoming?: boolean; // true if receiving call, false if initiating
    appointmentId?: string; // For AI medical summary
    messages?: MessageResponse[]; // For generating transcript
    onShowMedicalSummary?: (transcript: string, appointmentId?: string) => void; // Callback to show modal
}

const VideoCall: React.FC<VideoCallProps> = ({
    isVisible,
    onClose,
    participantId,
    conversationId,
    participantName: _participantName = 'Nguyễn Văn An', // Not used - showing current user info
    participantAvatar: _participantAvatar = '/src/assets/img/users/user-01.jpg', // Not used - showing current user info
    callType: _callType = 'video', // Reserved for future use (audio/video mode)
    isIncoming = false,
    appointmentId,
    messages = [],
    onShowMedicalSummary,
}) => {
    // Get current user ID from Redux
    const { adminProfile, doctorProfile, hospitalProfile } = useSelector(
        (state: RootState) => state.user
    );
    const userProfile = adminProfile || doctorProfile || hospitalProfile;
    const userId = userProfile?.accountId || '';

    // Get global chat context for clearing processed calls
    const { clearProcessedCall } = useGlobalChat();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    // Draggable state for local video
    const [isDragging, setIsDragging] = useState(false);
    const [localVideoPosition, setLocalVideoPosition] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Refs for video elements
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const localVideoContainerRef = useRef<HTMLButtonElement>(null);

    // Track if call has been initialized
    const callInitializedRef = useRef(false);

    // Track if remote video is playing (to prevent duplicate play() calls)
    const remoteVideoPlayingRef = useRef(false);

    // Track if local user initiated end call (to show medical summary modal)
    const isLocalEndCallRef = useRef(false);

    // Helper: Handle call end cleanup
    const handleCallEndCleanup = useCallback(() => {
        console.log('[VideoCall] Clearing processed call for:', participantId);
        clearProcessedCall(participantId, conversationId);
        remoteVideoPlayingRef.current = false;

        if (localVideoRef.current) {
            console.log('[VideoCall] Clearing local video srcObject (call ended)');
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            console.log('[VideoCall] Clearing remote video srcObject (call ended)');
            remoteVideoRef.current.srcObject = null;
        }
    }, [participantId, conversationId, clearProcessedCall]);

    // Helper: Get user display name
    const getUserDisplayName = useCallback(() => {
        if (!userProfile) return undefined;

        // Check for hospital profile (has 'name' property)
        if ('name' in userProfile) return userProfile.name as string | undefined;

        // Check for doctor/admin profile (has 'firstName' and 'lastName')
        if ('firstName' in userProfile && 'lastName' in userProfile) {
            const firstName = userProfile.firstName;
            const lastName = userProfile.lastName;
            return `${firstName} ${lastName}`;
        }

        // Fallback for fullName property (if exists)
        if ('fullName' in userProfile) {
            return (userProfile as any).fullName as string | undefined;
        }

        return undefined;
    }, [userProfile]);

    /**
     * Build transcript from conversation messages
     * Filters only text messages and formats them as conversation
     */
    const buildTranscript = useCallback((): string => {
        console.log('[VideoCall] Building transcript from messages:', {
            totalMessages: messages.length,
            messageTypes: messages.map((m) => m.type),
        });

        if (!messages || messages.length === 0) {
            console.log('[VideoCall] No messages to build transcript');
            return '';
        }

        const textMessages = messages.filter((msg) => msg.type === MessageType.TEXT);
        console.log('[VideoCall] Filtered text messages:', textMessages.length);

        const transcript = textMessages
            .map((msg) => {
                const senderName = msg.senderId === userId ? 'Bác sĩ' : 'Bệnh nhân';
                const timestamp = new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                return `[${timestamp}] ${senderName}: ${msg.content}`;
            })
            .join('\n');

        console.log('[VideoCall] Built transcript length:', transcript.length);
        return transcript;
    }, [messages, userId]);

    // Helper: Attempt to play remote video
    const attemptRemoteVideoPlay = useCallback(() => {
        console.log(
            '[VideoCall] Attempting play (readyState:',
            remoteVideoRef.current?.readyState,
            ')'
        );

        if (!remoteVideoRef.current) {
            remoteVideoPlayingRef.current = false;
            return;
        }

        remoteVideoRef.current
            .play()
            .then(() => {
                console.log('[VideoCall] ✅ Remote video playing successfully');
            })
            .catch((error) => {
                console.error('[VideoCall] ❌ Error playing:', error);
                remoteVideoPlayingRef.current = false;
            });
    }, []);

    // Helper: Handle remote video ready state and play
    const handleRemoteVideoReady = useCallback(() => {
        if (!remoteVideoRef.current) return;

        remoteVideoPlayingRef.current = true;

        if (remoteVideoRef.current.readyState >= 2) {
            console.log('[VideoCall] Video ready, playing immediately');
            attemptRemoteVideoPlay();
            return;
        }

        console.log('[VideoCall] Waiting for loadeddata event...');
        const onLoadedData = () => {
            console.log('[VideoCall] loadeddata fired, playing now');
            attemptRemoteVideoPlay();
            remoteVideoRef.current?.removeEventListener('loadeddata', onLoadedData);
        };
        remoteVideoRef.current.addEventListener('loadeddata', onLoadedData);

        setTimeout(() => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.removeEventListener('loadeddata', onLoadedData);
                console.log('[VideoCall] Timeout, force trying play');
                attemptRemoteVideoPlay();
            }
        }, 2000);
    }, [attemptRemoteVideoPlay]);

    // WebRTC Hook Integration
    const {
        callState,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        isScreenSharing,
        startCall,
        acceptCall,
        endCall,
        toggleMute,
        toggleVideo,
        toggleScreenShare,
        cleanup,
    } = useWebRTC(
        userId,
        {
            onCallStateChange: (state) => {
                console.log('[VideoCall] Call state changed:', state);

                // ✅ Update ref synchronously (before React re-renders)
                callStateRef.current = state;

                if (
                    state === 'ended' ||
                    state === 'declined' ||
                    state === 'failed' ||
                    state === 'busy'
                ) {
                    handleCallEndCleanup();

                    // ✅ If remote user ended call (not local), trigger medical summary modal
                    if (state === 'ended' && !isLocalEndCallRef.current) {
                        console.log(
                            '[VideoCall] Remote user ended call, triggering modal processing...'
                        );
                        // Use setTimeout to ensure cleanup completes first
                        setTimeout(() => {
                            handleEndCall().catch((err) => {
                                console.error('[VideoCall] Error processing remote end call:', err);
                            });
                        }, 100);
                    }
                }
            },
            onRemoteStream: (stream) => {
                console.log('[VideoCall] Remote stream received:', stream);
                console.log('[VideoCall] Remote stream tracks:', stream.getTracks());
                console.log('[VideoCall] Remote stream active:', stream.active);

                const videoTracks = stream.getVideoTracks();
                const audioTracks = stream.getAudioTracks();
                console.log('[VideoCall] Video tracks:', videoTracks.length);
                console.log('[VideoCall] Audio tracks:', audioTracks.length);

                if (remoteVideoRef.current) {
                    const currentSrcObject = remoteVideoRef.current.srcObject as MediaStream | null;
                    if (currentSrcObject === stream) {
                        console.log('[VideoCall] srcObject already set, skipping');
                    } else {
                        console.log('[VideoCall] Setting remote video srcObject');
                        remoteVideoRef.current.srcObject = stream;
                    }

                    const hasBothTracks = videoTracks.length > 0 && audioTracks.length > 0;
                    const shouldPlay = hasBothTracks && !remoteVideoPlayingRef.current;

                    if (shouldPlay) {
                        console.log('[VideoCall] Both tracks ready, preparing to play...');
                        console.log(
                            '[VideoCall] Video element readyState:',
                            remoteVideoRef.current.readyState
                        );
                        handleRemoteVideoReady();
                    } else if (remoteVideoPlayingRef.current) {
                        console.log('[VideoCall] ⏭️ Already playing, skipping duplicate play()');
                    } else {
                        console.log('[VideoCall] ⏳ Waiting for all tracks...');
                    }
                }
            },
            onLocalStream: (stream) => {
                console.log('[VideoCall] Local stream received');
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            },
            onError: (error) => {
                console.error('[VideoCall] ❌ WebRTC error:', error);
                // Don't show alert popup as it's annoying, just log to console
                // User will see the call failed through UI state changes
            },
        },
        {
            name: getUserDisplayName(),
            avatar: userProfile?.avatarUrl,
        }
    );

    // Ref to track current callState for cleanup
    const callStateRef = useRef(callState);

    // Call Recording Integration
    const {
        recordingState,
        startRecording: startCallRecording,
        stopRecording: stopCallRecording,
    } = useCallRecording();

    // Helper: Calculate target corner position
    const calculateTargetCorner = useCallback(
        (centerX: number, centerY: number, containerWidth: number, containerHeight: number) => {
            const localVideoWidth = 200;
            const localVideoHeight = 150;
            const midX = containerWidth / 2;
            const midY = containerHeight / 2;

            if (centerX < midX && centerY < midY) {
                return { x: 16, y: 16 };
            }
            if (centerX >= midX && centerY < midY) {
                return { x: containerWidth - localVideoWidth - 16, y: 16 };
            }
            if (centerX < midX && centerY >= midY) {
                return { x: 16, y: containerHeight - localVideoHeight - 16 };
            }
            return {
                x: containerWidth - localVideoWidth - 16,
                y: containerHeight - localVideoHeight - 16,
            };
        },
        []
    );

    // Keep callStateRef in sync
    useEffect(() => {
        callStateRef.current = callState;
    }, [callState]);

    // Auto-start recording when call connects and streams are ready
    useEffect(() => {
        const shouldStartRecording =
            callState === 'connected' &&
            localStream &&
            remoteStream &&
            !recordingState.isRecording &&
            appointmentId; // Only record if there's an appointment

        if (shouldStartRecording) {
            console.log('[VideoCall] 🎙️ Auto-starting call recording');
            startCallRecording(localStream, remoteStream)
                .then(() => {
                    console.log('[VideoCall] ✅ Call recording started successfully');
                    toast.info('Đang ghi âm cuộc gọi tư vấn...');
                })
                .catch((err) => {
                    console.error('[VideoCall] ❌ Failed to start recording:', err);
                    toast.error('Không thể ghi âm cuộc gọi');
                });
        }
    }, [
        callState,
        localStream,
        remoteStream,
        recordingState.isRecording,
        appointmentId,
        startCallRecording,
    ]);

    // Call duration timer - use callState instead of isCallActive
    useEffect(() => {
        let interval: NodeJS.Timeout;
        const isActive = callState === 'connected' || callState === 'connecting';
        if (isActive) {
            interval = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        } else {
            setCallDuration(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [callState]);

    // Format call duration
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            }
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        setIsFullscreen(!isFullscreen);

        // Reset position when toggling fullscreen
        setTimeout(() => {
            setLocalVideoPosition({ x: 0, y: 0 });
        }, 100);
    };

    // Handle speaker mute/unmute via ref
    useEffect(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.muted = isSpeakerMuted;
        }
    }, [isSpeakerMuted]);

    // Handle speaker toggle
    const toggleSpeaker = () => {
        setIsSpeakerMuted(!isSpeakerMuted);
    };

    // Handle end call
    const handleEndCall = async () => {
        console.log('[VideoCall] Ending call with:', participantId);

        // ✅ Mark that local user initiated end call
        isLocalEndCallRef.current = true;

        // ✅ Close VideoCall component immediately for better UX
        // Transcription will continue in background
        console.log('[VideoCall] Closing VideoCall component immediately');

        // Clear video srcObject to release camera/mic
        if (localVideoRef.current) {
            console.log('[VideoCall] Clearing local video srcObject');
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            console.log('[VideoCall] Clearing remote video srcObject');
            remoteVideoRef.current.srcObject = null;
        }

        endCall(participantId, 'User ended call');
        onClose(); // Close immediately

        // ✅ Check if user is doctor before processing transcription
        const isDoctor = !!doctorProfile;
        const hasAppointment = !!appointmentId;

        // ✅ Process transcription in background (non-blocking) - ONLY FOR DOCTORS
        // Staff role should not trigger transcription
        if (recordingState.isRecording && isDoctor && hasAppointment) {
            console.log(
                '[VideoCall] 🛑 Stopping call recording and starting background transcription...'
            );

            // Show loading toast to inform doctor
            const toastId = toast.loading('Đang chuyển đổi ghi âm cuộc gọi thành văn bản...', {
                autoClose: false,
            });

            stopCallRecording()
                .then(async (blob) => {
                    if (!blob) {
                        console.log('[VideoCall] No recording blob, skipping transcription');
                        toast.dismiss(toastId);
                        return;
                    }

                    console.log(
                        '[VideoCall] ✅ Recording stopped, blob saved:',
                        blob.size,
                        'bytes'
                    );

                    try {
                        const fileName = `call-${appointmentId}-${Date.now()}.webm`;
                        console.log('[VideoCall] 📤 Transcribing in background...', {
                            size: blob.size,
                            type: blob.type,
                        });

                        const response = await VoiceTranscriptionService.uploadAndTranscribe(
                            blob,
                            fileName,
                            (progress) => {
                                console.log(
                                    '[VideoCall] Upload progress:',
                                    progress.percentage,
                                    '%'
                                );
                                // Update toast with progress
                                if (progress.percentage < 100) {
                                    toast.update(toastId, {
                                        render: `Đang tải lên ghi âm... ${progress.percentage}%`,
                                        type: 'info',
                                        isLoading: true,
                                    });
                                }
                            }
                        );

                        const transcript = response.data.transcript;
                        console.log('[VideoCall] ✅ Background transcription complete:', {
                            length: transcript.length,
                            fullTranscript: transcript,
                        });

                        // Update toast to success
                        toast.update(toastId, {
                            render: `✅ Đã chuyển đổi ${recordingState.duration}s ghi âm thành ${transcript.length} ký tự`,
                            type: 'success',
                            isLoading: false,
                            autoClose: 3000,
                        });

                        // Check if should show AI summary modal
                        const isDoctor = !!doctorProfile;
                        const hasAppointment = !!appointmentId;

                        if (isDoctor && hasAppointment && onShowMedicalSummary) {
                            console.log(
                                '[VideoCall] ✅ Showing medical summary modal after transcription'
                            );
                            console.log('[VideoCall] Transcript source: 🎙️ Audio');
                            console.log('[VideoCall] Final transcript to modal:', transcript);

                            // Show modal with transcribed audio
                            onShowMedicalSummary(transcript, appointmentId);
                        } else {
                            // If no appointment or not doctor, use text messages as fallback
                            const textTranscript = buildTranscript();
                            const finalTranscript = transcript || textTranscript;

                            if (isDoctor && hasAppointment && onShowMedicalSummary) {
                                console.log(
                                    '[VideoCall] ✅ Showing medical summary modal with fallback'
                                );
                                onShowMedicalSummary(finalTranscript, appointmentId);
                            }
                        }
                    } catch (err) {
                        console.error('[VideoCall] ❌ Background transcription failed:', err);

                        // Update toast to error
                        toast.update(toastId, {
                            render: '❌ Không thể chuyển đổi ghi âm thành văn bản',
                            type: 'error',
                            isLoading: false,
                            autoClose: 5000,
                        });

                        // Show modal anyway with text messages if it's a doctor with appointment
                        const isDoctor = !!doctorProfile;
                        const hasAppointment = !!appointmentId;

                        if (isDoctor && hasAppointment && onShowMedicalSummary) {
                            const textTranscript = buildTranscript();
                            console.log(
                                '[VideoCall] ⚠️ Showing modal with text transcript due to transcription error'
                            );
                            onShowMedicalSummary(textTranscript, appointmentId);
                        }
                    }
                })
                .catch((err) => {
                    console.error('[VideoCall] ❌ Failed to stop recording:', err);
                    toast.update(toastId, {
                        render: '❌ Không thể xử lý ghi âm cuộc gọi',
                        type: 'error',
                        isLoading: false,
                        autoClose: 5000,
                    });
                });
        } else if (isDoctor && hasAppointment && onShowMedicalSummary) {
            // No recording OR not doctor - show modal with text messages if doctor with appointment
            const textTranscript = buildTranscript();
            console.log('[VideoCall] ✅ Showing modal with text messages (no recording)');
            onShowMedicalSummary(textTranscript, appointmentId);
        } else {
            console.log('[VideoCall] ⏭️ Skipping modal - Staff role or no appointment');
        }
    };

    // Initialize call when component becomes visible
    useEffect(() => {
        console.log('[VideoCall] 🔍 Init effect triggered:', {
            isVisible,
            participantId,
            conversationId,
            callState,
            isIncoming,
            callInitialized: callInitializedRef.current,
        });

        // ✅ Prevent re-initialization if already initialized OR already in call
        if (callInitializedRef.current) {
            console.log('[VideoCall] ⏸️ Call already initialized, skipping');
            return;
        }

        // ✅ Also check callState to prevent re-init during Strict Mode remount
        if (callState !== 'idle') {
            console.log('[VideoCall] ⏸️ Call already in progress, state:', callState);
            return;
        }

        if (!isVisible) {
            console.log('[VideoCall] ⏸️ Not visible, skipping');
            return;
        }
        if (!participantId) {
            console.log('[VideoCall] ⏸️ No participantId, skipping');
            return;
        }
        if (!conversationId) {
            console.log('[VideoCall] ⏸️ No conversationId, skipping');
            return;
        }

        console.log('[VideoCall] ✅ All conditions met, initializing call');
        console.log('[VideoCall] Initializing call, isIncoming:', isIncoming);

        // Mark as initialized to prevent re-initialization
        callInitializedRef.current = true;

        if (isIncoming) {
            // Accept incoming call
            console.log('[VideoCall] 📞 Accepting incoming call from:', participantId);
            acceptCall(participantId, conversationId);
        } else {
            // Start outgoing call
            console.log('[VideoCall] 📞 Starting outgoing call to:', participantId);
            startCall(participantId, conversationId);
        }
        // ✅ IMPORTANT: Remove acceptCall/startCall from dependencies to prevent re-initialization
        // callState is included to check if call already in progress (Strict Mode safety)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, participantId, conversationId, isIncoming, callState]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const currentState = callStateRef.current;
            console.log('[VideoCall] Component unmounting, callState:', currentState);

            // ✅ Clear video elements' srcObject to release media
            if (localVideoRef.current) {
                console.log('[VideoCall] Clearing local video srcObject');
                localVideoRef.current.srcObject = null;
            }
            if (remoteVideoRef.current) {
                console.log('[VideoCall] Clearing remote video srcObject');
                remoteVideoRef.current.srcObject = null;
            }

            // ✅ ONLY cleanup if call is truly ending (not Strict Mode remount)
            // If call is active (calling/connecting/connected), DON'T cleanup - Strict Mode remount
            if (
                currentState === 'idle' ||
                currentState === 'ended' ||
                currentState === 'declined' ||
                currentState === 'failed'
            ) {
                console.log('[VideoCall] Call inactive, running cleanup');
                cleanup();
                console.log('[VideoCall] Resetting initialization flag');
                callInitializedRef.current = false;
            } else {
                console.log('[VideoCall] Call active, skipping cleanup (Strict Mode remount)');
                console.log('[VideoCall] Call active, keeping initialization flag');
            }
        };
        // ✅ Empty deps - only run on mount/unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Drag & Drop handlers for local video
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!localVideoContainerRef.current || !containerRef.current) return;

        console.log('Mouse down triggered'); // Debug log
        setIsDragging(true);
        const rect = localVideoContainerRef.current.getBoundingClientRect();

        const offset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        console.log('Drag offset:', offset); // Debug log
        setDragOffset(offset);

        e.preventDefault();
        e.stopPropagation();
    };

    // Double-click to snap to nearest corner
    const handleDoubleClick = () => {
        snapToCorner();
    };

    // Keyboard support for accessibility
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            snapToCorner(); // Snap to corner when Enter or Space is pressed
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !containerRef.current || !localVideoContainerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const localVideoWidth = 200;
        const localVideoHeight = 150;
        const padding = 16;

        // Calculate new position relative to mouse
        let newX = e.clientX - containerRect.left - dragOffset.x;
        let newY = e.clientY - containerRect.top - dragOffset.y;

        // Constrain to container bounds
        newX = Math.max(padding, Math.min(newX, containerRect.width - localVideoWidth - padding));
        newY = Math.max(padding, Math.min(newY, containerRect.height - localVideoHeight - padding));

        // Convert to transform offset (relative to initial position at top-right)
        const initialX = containerRect.width - localVideoWidth - padding;
        const initialY = padding;

        const transformX = newX - initialX;
        const transformY = newY - initialY;

        console.log('Moving to:', { transformX, transformY }); // Debug log
        setLocalVideoPosition({ x: transformX, y: transformY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        // Don't automatically snap - let user control where they want the video
        // snapToCorner();
    };

    const handleTouchEndWithSnap = () => {
        setIsDragging(false);
        // Keep snap for touch since it's more common on mobile to want corner placement
        snapToCorner();
    };

    // Snap to nearest corner for better UX
    const snapToCorner = () => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const { x, y } = localVideoPosition;
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        const localVideoWidth = 200;
        const localVideoHeight = 150;

        const initialX = containerWidth - 216;
        const initialY = 16;
        const currentX = initialX + x;
        const currentY = initialY + y;

        const centerX = currentX + localVideoWidth / 2;
        const centerY = currentY + localVideoHeight / 2;

        const target = calculateTargetCorner(centerX, centerY, containerWidth, containerHeight);

        const transformX = target.x - initialX;
        const transformY = target.y - initialY;

        setLocalVideoPosition({ x: transformX, y: transformY });
    };

    // Touch handlers for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        if (!localVideoContainerRef.current || !containerRef.current) return;

        const touch = e.touches[0];
        setIsDragging(true);

        const rect = localVideoContainerRef.current.getBoundingClientRect();

        setDragOffset({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        });

        e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging || !containerRef.current) return;

        const touch = e.touches[0];
        const containerRect = containerRef.current.getBoundingClientRect();
        const localVideoWidth = 200;
        const localVideoHeight = 150;

        let newX = touch.clientX - containerRect.left - dragOffset.x;
        let newY = touch.clientY - containerRect.top - dragOffset.y;

        // Constrain to container bounds
        newX = Math.max(16, Math.min(newX, containerRect.width - localVideoWidth - 16));
        newY = Math.max(16, Math.min(newY, containerRect.height - localVideoHeight - 16));

        setLocalVideoPosition({ x: newX, y: newY });

        e.preventDefault();
    };

    // Add event listeners for mouse and touch events
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEndWithSnap);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEndWithSnap);
        };
    }, [isDragging, dragOffset]);

    // Helper: Get UI state values
    const getUIState = useCallback(() => {
        const isRemoteVideoVisible = callState === 'connected' || remoteStream !== null;
        return {
            isRemoteVideoVisible,
            micIconClass: isMuted ? 'ti-microphone-off' : 'ti-microphone',
            videoIconClass: isVideoOff ? 'ti-video-off' : 'ti-video',
            speakerIconClass: isSpeakerMuted ? 'ti-volume-off' : 'ti-volume',
            screenShareIconClass: isScreenSharing ? 'ti-screen-share-off' : 'ti-screen-share',
            fullscreenIconClass: isFullscreen ? 'ti-minimize' : 'ti-maximize',
            micButtonClass: isMuted ? 'bg-danger text-white' : 'bg-light',
            videoButtonClass: isVideoOff ? 'bg-danger text-white' : 'bg-light',
            speakerButtonClass: isSpeakerMuted ? 'bg-danger text-white' : 'bg-light',
            screenShareButtonClass: isScreenSharing
                ? 'bg-primary text-white'
                : 'bg-light text-dark',
            screenShareTitle: isScreenSharing ? 'Dừng chia sẻ màn hình' : 'Chia sẻ màn hình',
            screenShareAriaLabel: isScreenSharing ? 'Dừng chia sẻ' : 'Chia sẻ màn hình',
            micAriaLabel: isMuted ? 'Bật mic' : 'Tắt mic',
            userAvatarUrl: userProfile?.avatarUrl || '/src/assets/img/users/user-01.jpg',
            localVideoCursor: isDragging ? 'grabbing' : 'grab',
            localVideoZIndex: isDragging ? 1001 : 1000,
            localVideoDisplay: isVideoOff ? 'none' : 'block',
            videoAvatarHidden: !isVideoOff,
            placeholderHidden: isRemoteVideoVisible,
        };
    }, [
        callState,
        remoteStream,
        isMuted,
        isVideoOff,
        isSpeakerMuted,
        isScreenSharing,
        isFullscreen,
        userProfile?.avatarUrl,
        isDragging,
    ]);

    const uiState = getUIState();

    // Helper render functions to reduce JSX complexity
    const renderLocalVideoContent = () => (
        <>
            <video
                ref={localVideoRef}
                className={clsx(styles.localVideo, 'img-fluid rounded border border-primary')}
                autoPlay
                playsInline
                muted
                style={{ display: uiState.localVideoDisplay }}
            />
            <img
                src={uiState.userAvatarUrl}
                className={clsx('img-fluid rounded border border-primary', {
                    'd-none': uiState.videoAvatarHidden,
                })}
                alt="My avatar"
            />
            <div className={clsx(styles.dragIndicator)}>
                <i className="ti ti-grip-horizontal"></i>
            </div>
        </>
    );

    const renderCallDurationBadge = () => (
        <span className="bg-light-subtle rounded badge text-dark p-2 d-inline-flex align-items-center">
            <i className="ti ti-circle-filled me-1 text-success"></i>
            {formatDuration(callDuration)}
        </span>
    );

    const renderControlButton = (
        onClick: () => void,
        iconClass: string,
        buttonClass: string,
        ariaLabel?: string,
        title?: string
    ) => (
        <button
            onClick={onClick}
            className={clsx(
                'btn-icon btn-sm d-flex justify-content-center align-items-center rounded',
                buttonClass
            )}
            type="button"
            aria-label={ariaLabel}
            title={title}
        >
            <i className={`ti ${iconClass}`}></i>
        </button>
    );

    if (!isVisible) return null;

    return (
        <div className={clsx(styles.videoCallOverlay, { [styles.fullscreen]: isFullscreen })}>
            <div className={clsx(styles.videoCallContainer)} ref={containerRef}>
                {/* Video Call Area */}
                <div className={styles.videoCallArea}>
                    <div className={clsx(styles.singleVideo, 'd-flex')}>
                        <div className={clsx(styles.joinVideo, 'flex-fill position-relative')}>
                            {/* Remote Video */}
                            <video
                                ref={remoteVideoRef}
                                className={clsx(styles.remoteVideo, 'w-100 h-100')}
                                autoPlay
                                playsInline
                                muted={false}
                                poster={videojpg}
                            >
                                <track kind="captions" />
                            </video>

                            {/* Fallback image when no remote video */}
                            <div
                                className={clsx(styles.videoPlaceholder, {
                                    [styles.hidden]: uiState.placeholderHidden,
                                })}
                            >
                                <img
                                    src={videojpg}
                                    className="img-fluid w-100"
                                    alt="Video background"
                                />
                            </div>

                            {/* Local Video (Picture in Picture) - Draggable */}
                            <button
                                ref={localVideoContainerRef}
                                className={clsx(
                                    styles.localVideoContainer,
                                    styles.draggable,
                                    { [styles.dragging]: isDragging },
                                    'video-avatar'
                                )}
                                style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '16px',
                                    padding: '8px',
                                    cursor: uiState.localVideoCursor,
                                    zIndex: uiState.localVideoZIndex,
                                    transform: `translate(${localVideoPosition.x}px, ${localVideoPosition.y}px)`,
                                    border: 'none',
                                    background: 'transparent',
                                }}
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleTouchStart}
                                onDoubleClick={handleDoubleClick}
                                onClick={snapToCorner}
                                onKeyDown={handleKeyDown}
                                type="button"
                                aria-label="Local video - kéo để di chuyển, click để snap về góc"
                                title="Kéo để di chuyển, click để snap về góc"
                            >
                                {renderLocalVideoContent()}
                            </button>

                            {/* Call Duration and Fullscreen Button */}
                            <div className="position-absolute start-0 top-0 p-2 z-1 d-flex align-items-center">
                                <div className="me-2">{renderCallDurationBadge()}</div>
                                <button
                                    onClick={toggleFullscreen}
                                    className="btn p-0 avatar-sm btn-light"
                                    type="button"
                                >
                                    <i className={`ti ${uiState.fullscreenIconClass}`}></i>
                                </button>
                            </div>

                            {/* Call Controls */}
                            <div className="d-flex justify-content-center align-items-center flex-wrap w-100 position-absolute bottom-0 z-2 p-2">
                                <div
                                    className={clsx(
                                        styles.buttonItems,
                                        'bg-light bg-opacity-50 px-3 py-2 rounded-pill d-flex justify-content-center align-items-center'
                                    )}
                                >
                                    {/* Microphone Toggle */}
                                    <div className="me-2">
                                        {renderControlButton(
                                            toggleMute,
                                            uiState.micIconClass,
                                            uiState.micButtonClass,
                                            uiState.micAriaLabel
                                        )}
                                    </div>

                                    {/* Video Toggle */}
                                    <div className="me-2">
                                        {renderControlButton(
                                            toggleVideo,
                                            uiState.videoIconClass,
                                            uiState.videoButtonClass
                                        )}
                                    </div>

                                    {/* End Call */}
                                    <button
                                        onClick={handleEndCall}
                                        className="btn btn-icon btn-lg text-white bg-danger d-flex justify-content-center align-items-center rounded"
                                        type="button"
                                    >
                                        <i className="ti ti-phone-off"></i>
                                    </button>

                                    {/* Speaker Toggle */}
                                    <div className="mx-2">
                                        {renderControlButton(
                                            toggleSpeaker,
                                            uiState.speakerIconClass,
                                            uiState.speakerButtonClass
                                        )}
                                    </div>

                                    {/* Screen Share */}
                                    {renderControlButton(
                                        toggleScreenShare,
                                        uiState.screenShareIconClass,
                                        uiState.screenShareButtonClass,
                                        uiState.screenShareAriaLabel,
                                        uiState.screenShareTitle
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCall;
