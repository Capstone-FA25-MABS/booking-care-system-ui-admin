import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';

import styles from './VideoCall.module.scss';
import videojpg from '@/assets/img/media/video.jpg';
import { useWebRTC } from '@/hooks/useWebRTC';
import type { RootState } from '@/store';

interface VideoCallProps {
    isVisible: boolean;
    onClose: () => void;
    participantId: string;
    conversationId: string;
    participantName?: string;
    participantAvatar?: string;
    callType?: 'video' | 'audio';
    isIncoming?: boolean; // true if receiving call, false if initiating
}

const VideoCall: React.FC<VideoCallProps> = ({
    isVisible,
    onClose,
    participantId,
    conversationId,
    participantName = 'Nguyễn Văn An',
    participantAvatar = '/src/assets/img/users/user-01.jpg',
    callType: _callType = 'video', // Reserved for future use (audio/video mode)
    isIncoming = false,
}) => {
    // Get current user ID from Redux
    const { adminProfile, doctorProfile, hospitalProfile } = useSelector(
        (state: RootState) => state.user
    );
    const userProfile = adminProfile || doctorProfile || hospitalProfile;
    const userId = userProfile?.accountId || '';

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

    // WebRTC Hook Integration
    const {
        callState,
        remoteStream,
        isMuted,
        isVideoOff,
        startCall,
        acceptCall,
        endCall,
        toggleMute,
        toggleVideo,
        cleanup,
    } = useWebRTC(
        userId,
        {
            onCallStateChange: (state) => {
                console.log('[VideoCall] Call state changed:', state);

                if (
                    state === 'ended' ||
                    state === 'declined' ||
                    state === 'failed' ||
                    state === 'busy'
                ) {
                    onClose();
                }
            },
            onRemoteStream: (stream) => {
                console.log('[VideoCall] Remote stream received');
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = stream;
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
            name:
                userProfile && 'fullName' in userProfile
                    ? (userProfile.fullName as string | undefined)
                    : userProfile && 'name' in userProfile
                      ? (userProfile.name as string | undefined)
                      : undefined,
            avatar: userProfile?.avatarUrl,
        }
    );

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

    // Handle speaker toggle
    const toggleSpeaker = () => {
        setIsSpeakerMuted(!isSpeakerMuted);
        if (remoteVideoRef.current) {
            remoteVideoRef.current.muted = !isSpeakerMuted;
        }
    };

    // Handle end call
    const handleEndCall = () => {
        console.log('[VideoCall] Ending call with:', participantId);
        endCall(participantId, 'User ended call');
        cleanup();
        onClose();
    };

    // Initialize call when component becomes visible
    useEffect(() => {
        if (!isVisible || !participantId || !conversationId || callState !== 'idle') {
            return;
        }

        console.log('[VideoCall] Initializing call, isIncoming:', isIncoming);

        if (isIncoming) {
            // Accept incoming call
            console.log('[VideoCall] Accepting call from:', participantId);
            acceptCall(participantId, conversationId);
        } else {
            // Start outgoing call
            console.log('[VideoCall] Starting call to:', participantId);
            startCall(participantId, conversationId);
        }
    }, [isVisible, participantId, conversationId, isIncoming, callState, acceptCall, startCall]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (callState !== 'idle' && callState !== 'ended') {
                console.log('[VideoCall] Component unmounting, cleaning up');
                cleanup();
            }
        };
    }, [callState, cleanup]);

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

        // Current position (transform offset from initial top-right position)
        const initialX = containerWidth - 216; // 200px + 16px padding
        const initialY = 16;
        const currentX = initialX + x;
        const currentY = initialY + y;

        const centerX = currentX + localVideoWidth / 2;
        const centerY = currentY + localVideoHeight / 2;
        const midX = containerWidth / 2;
        const midY = containerHeight / 2;

        let targetX, targetY;

        // Determine which corner to snap to
        if (centerX < midX && centerY < midY) {
            // Top-left
            targetX = 16;
            targetY = 16;
        } else if (centerX >= midX && centerY < midY) {
            // Top-right
            targetX = containerWidth - localVideoWidth - 16;
            targetY = 16;
        } else if (centerX < midX && centerY >= midY) {
            // Bottom-left
            targetX = 16;
            targetY = containerHeight - localVideoHeight - 16;
        } else {
            // Bottom-right
            targetX = containerWidth - localVideoWidth - 16;
            targetY = containerHeight - localVideoHeight - 16;
        }

        // Convert to transform offset
        const transformX = targetX - initialX;
        const transformY = targetY - initialY;

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
                                muted={isSpeakerMuted}
                                poster={videojpg}
                            >
                                <track kind="captions" />
                            </video>

                            {/* Fallback image when no remote video */}
                            <div
                                className={clsx(styles.videoPlaceholder, {
                                    [styles.hidden]:
                                        callState === 'connected' || remoteStream !== null,
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
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    zIndex: isDragging ? 1001 : 1000,
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
                                <video
                                    ref={localVideoRef}
                                    className={clsx(
                                        styles.localVideo,
                                        'img-fluid rounded border border-primary'
                                    )}
                                    autoPlay
                                    playsInline
                                    muted
                                    style={{ display: isVideoOff ? 'none' : 'block' }}
                                />
                                {/* Avatar fallback when video is off */}
                                <img
                                    src={participantAvatar}
                                    className={clsx('img-fluid rounded border border-primary', {
                                        'd-none': !isVideoOff,
                                    })}
                                    alt="User avatar"
                                />
                                <div className="position-absolute start-0 bottom-0 w-100 text-center py-2">
                                    <span className="bg-white text-dark d-inline-block fw-medium rounded p-1 my-2">
                                        {participantName}
                                    </span>
                                </div>

                                {/* Drag indicator */}
                                <div className={clsx(styles.dragIndicator)}>
                                    <i className="ti ti-grip-horizontal"></i>
                                </div>
                            </button>

                            {/* Call Duration and Fullscreen Button */}
                            <div className="position-absolute start-0 top-0 p-2 z-1 d-flex align-items-center">
                                <div className="me-2">
                                    <span className="bg-light-subtle rounded badge text-dark p-2 d-inline-flex align-items-center">
                                        <i className="ti ti-circle-filled me-1 text-success"></i>
                                        {formatDuration(callDuration)}
                                    </span>
                                </div>
                                <button
                                    onClick={toggleFullscreen}
                                    className="btn p-0 avatar-sm btn-light"
                                    type="button"
                                >
                                    <i
                                        className={`ti ${isFullscreen ? 'ti-minimize' : 'ti-maximize'}`}
                                    ></i>
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
                                    <button
                                        onClick={toggleMute}
                                        className={clsx(
                                            'btn-icon btn-sm d-flex justify-content-center align-items-center rounded me-2',
                                            isMuted ? 'bg-danger text-white' : 'bg-light'
                                        )}
                                        type="button"
                                        aria-label={isMuted ? 'Bật mic' : 'Tắt mic'}
                                    >
                                        <i
                                            className={`ti ${isMuted ? 'ti-microphone-off' : 'ti-microphone'}`}
                                        ></i>
                                    </button>

                                    {/* Video Toggle */}
                                    <button
                                        onClick={toggleVideo}
                                        className={clsx(
                                            'btn-icon btn-sm d-flex justify-content-center align-items-center rounded me-2',
                                            isVideoOff ? 'bg-danger text-white' : 'bg-light'
                                        )}
                                        type="button"
                                    >
                                        <i
                                            className={`ti ${isVideoOff ? 'ti-video-off' : 'ti-video'}`}
                                        ></i>
                                    </button>

                                    {/* End Call */}
                                    <button
                                        onClick={handleEndCall}
                                        className="btn btn-icon btn-lg text-white bg-danger d-flex justify-content-center align-items-center rounded"
                                        type="button"
                                    >
                                        <i className="ti ti-phone-off"></i>
                                    </button>

                                    {/* Speaker Toggle */}
                                    <button
                                        onClick={toggleSpeaker}
                                        className={clsx(
                                            'btn-icon btn-sm d-flex justify-content-center align-items-center rounded mx-2',
                                            isSpeakerMuted ? 'bg-danger text-white' : 'bg-light'
                                        )}
                                        type="button"
                                    >
                                        <i
                                            className={`ti ${isSpeakerMuted ? 'ti-volume-off' : 'ti-volume'}`}
                                        ></i>
                                    </button>

                                    {/* Screen Share (for future implementation) */}
                                    <button
                                        className="bg-light text-dark btn-icon btn-sm d-flex align-items-center justify-content-center rounded"
                                        type="button"
                                    >
                                        <i className="ti ti-screen-share"></i>
                                    </button>
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
