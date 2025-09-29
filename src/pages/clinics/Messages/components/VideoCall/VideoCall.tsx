import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

import styles from './VideoCall.module.scss';
import videojpg from '@/assets/img/media/video.jpg';
interface VideoCallProps {
    isVisible: boolean;
    onClose: () => void;
    participantName?: string;
    participantAvatar?: string;
}

const VideoCall: React.FC<VideoCallProps> = ({
    isVisible,
    onClose,
    participantName = 'Joe Lewis',
    participantAvatar = '/src/assets/img/users/user-01.jpg',
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [isCallActive, setIsCallActive] = useState(false);

    // Draggable state for local video
    const [isDragging, setIsDragging] = useState(false);
    const [localVideoPosition, setLocalVideoPosition] = useState({ x: 0, y: 0 }); // Transform offset from initial position
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Refs for video elements - will be used for WebRTC integration
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const localVideoContainerRef = useRef<HTMLDivElement>(null);

    // WebRTC related refs for future integration
    // const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    // const localStreamRef = useRef<MediaStream | null>(null);

    // Call duration timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isCallActive) {
            interval = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isCallActive]);

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

    // Handle mic toggle
    const toggleMic = () => {
        setIsMicMuted(!isMicMuted);
        // Future WebRTC integration:
        // if (localStreamRef.current) {
        //     localStreamRef.current.getAudioTracks().forEach(track => {
        //         track.enabled = isMicMuted;
        //     });
        // }
    };

    // Handle video toggle
    const toggleVideo = () => {
        setIsVideoOff(!isVideoOff);
        // Future WebRTC integration:
        // if (localStreamRef.current) {
        //     localStreamRef.current.getVideoTracks().forEach(track => {
        //         track.enabled = isVideoOff;
        //     });
        // }
    };

    // Handle speaker toggle
    const toggleSpeaker = () => {
        setIsSpeakerMuted(!isSpeakerMuted);
        // Future WebRTC integration:
        // if (remoteVideoRef.current) {
        //     remoteVideoRef.current.muted = !isSpeakerMuted;
        // }
    };

    // Handle end call
    const handleEndCall = () => {
        setIsCallActive(false);
        setCallDuration(0);
        // Future WebRTC cleanup:
        // if (peerConnectionRef.current) {
        //     peerConnectionRef.current.close();
        // }
        // if (localStreamRef.current) {
        //     localStreamRef.current.getTracks().forEach(track => track.stop());
        // }
        onClose();
    };

    // Start call (placeholder for WebRTC initialization)
    const startCall = () => {
        setIsCallActive(true);
        // Future WebRTC initialization will go here
    };

    useEffect(() => {
        if (isVisible && !isCallActive) {
            startCall();
        }
    }, [isVisible]);

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

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !containerRef.current || !localVideoContainerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();

        // Calculate new position relative to mouse
        const newX = e.clientX - containerRect.left - dragOffset.x;
        const newY = e.clientY - containerRect.top - dragOffset.y;

        // Convert to transform offset (relative to initial position at top-right)
        const initialX = containerRect.width - 216; // 200px width + 16px padding
        const initialY = 16;

        const transformX = newX - initialX;
        const transformY = newY - initialY;

        console.log('Moving to:', { transformX, transformY }); // Debug log
        setLocalVideoPosition({ x: transformX, y: transformY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        snapToCorner();
    };

    const handleTouchEndWithSnap = () => {
        setIsDragging(false);
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
                                    [styles.hidden]: isCallActive,
                                })}
                            >
                                <img
                                    src={videojpg}
                                    className="img-fluid w-100"
                                    alt="Video background"
                                />
                            </div>

                            {/* Local Video (Picture in Picture) - Draggable */}
                            <div
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
                                }}
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleTouchStart}
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
                            </div>

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
                                        onClick={toggleMic}
                                        className={clsx(
                                            'btn-icon btn-sm d-flex justify-content-center align-items-center rounded me-2',
                                            isMicMuted ? 'bg-danger text-white' : 'bg-light'
                                        )}
                                        type="button"
                                    >
                                        <i
                                            className={`ti ${isMicMuted ? 'ti-microphone-off' : 'ti-microphone'}`}
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
