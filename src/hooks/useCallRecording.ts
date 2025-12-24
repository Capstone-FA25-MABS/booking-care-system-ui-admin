import { useRef, useCallback, useState } from 'react';

interface RecordingState {
    isRecording: boolean;
    duration: number; // in seconds
    error: string | null;
}

interface UseCallRecordingReturn {
    recordingState: RecordingState;
    startRecording: (localStream: MediaStream, remoteStream: MediaStream) => Promise<void>;
    stopRecording: () => Promise<Blob | null>;
    pauseRecording: () => void;
    resumeRecording: () => void;
}

/**
 * Hook for recording audio from WebRTC calls
 * Merges local and remote audio streams and records them as a single audio file
 */
export const useCallRecording = (): UseCallRecordingReturn => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mergedStreamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [recordingState, setRecordingState] = useState<RecordingState>({
        isRecording: false,
        duration: 0,
        error: null,
    });

    /**
     * Merge local and remote audio streams using Web Audio API
     */
    const mergeAudioStreams = useCallback(
        (localStream: MediaStream, remoteStream: MediaStream): MediaStream | null => {
            try {
                // Create audio context
                const audioContext = new AudioContext();
                audioContextRef.current = audioContext;

                // Create destination for merged audio
                const destination = audioContext.createMediaStreamDestination();

                // Get audio tracks
                const localAudioTracks = localStream.getAudioTracks();
                const remoteAudioTracks = remoteStream.getAudioTracks();

                console.log('[useCallRecording] Merging audio streams:', {
                    localTracks: localAudioTracks.length,
                    remoteTracks: remoteAudioTracks.length,
                });

                // Connect local audio if available
                if (localAudioTracks.length > 0) {
                    const localAudioStream = new MediaStream(localAudioTracks);
                    const localSource = audioContext.createMediaStreamSource(localAudioStream);
                    localSource.connect(destination);
                    console.log('[useCallRecording] ✅ Connected local audio');
                }

                // Connect remote audio if available
                if (remoteAudioTracks.length > 0) {
                    const remoteAudioStream = new MediaStream(remoteAudioTracks);
                    const remoteSource = audioContext.createMediaStreamSource(remoteAudioStream);
                    remoteSource.connect(destination);
                    console.log('[useCallRecording] ✅ Connected remote audio');
                }

                // Check if we have any audio
                if (localAudioTracks.length === 0 && remoteAudioTracks.length === 0) {
                    console.warn('[useCallRecording] ⚠️ No audio tracks found in streams');
                    return null;
                }

                return destination.stream;
            } catch (error) {
                console.error('[useCallRecording] ❌ Error merging audio streams:', error);
                return null;
            }
        },
        []
    );

    /**
     * Start recording the merged audio stream
     */
    const startRecording = useCallback(
        async (localStream: MediaStream, remoteStream: MediaStream): Promise<void> => {
            try {
                console.log('[useCallRecording] 🎙️ Starting recording...');

                // Reset state
                recordedChunksRef.current = [];
                setRecordingState({
                    isRecording: false,
                    duration: 0,
                    error: null,
                });

                // Merge audio streams
                const mergedStream = mergeAudioStreams(localStream, remoteStream);
                if (!mergedStream) {
                    throw new Error('Failed to merge audio streams');
                }

                mergedStreamRef.current = mergedStream;

                // Create MediaRecorder with appropriate MIME type
                const mimeTypes = [
                    'audio/webm;codecs=opus',
                    'audio/webm',
                    'audio/ogg;codecs=opus',
                    'audio/mp4',
                ];

                let selectedMimeType = '';
                for (const mimeType of mimeTypes) {
                    if (MediaRecorder.isTypeSupported(mimeType)) {
                        selectedMimeType = mimeType;
                        break;
                    }
                }

                if (!selectedMimeType) {
                    throw new Error('No supported audio MIME type found');
                }

                console.log('[useCallRecording] Selected MIME type:', selectedMimeType);

                const mediaRecorder = new MediaRecorder(mergedStream, {
                    mimeType: selectedMimeType,
                    audioBitsPerSecond: 128000, // 128 kbps
                });

                mediaRecorderRef.current = mediaRecorder;

                // Handle data available event
                mediaRecorder.ondataavailable = (event: BlobEvent) => {
                    if (event.data && event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                        console.log('[useCallRecording] Recorded chunk:', event.data.size, 'bytes');
                    }
                };

                // Handle recording errors
                mediaRecorder.onerror = (event: Event) => {
                    console.error('[useCallRecording] ❌ MediaRecorder error:', event);
                    setRecordingState((prev) => ({
                        ...prev,
                        error: 'Recording error occurred',
                    }));
                };

                // Start recording
                mediaRecorder.start(1000); // Collect data every 1 second

                // Start duration counter
                durationIntervalRef.current = setInterval(() => {
                    setRecordingState((prev) => ({
                        ...prev,
                        duration: prev.duration + 1,
                    }));
                }, 1000);

                setRecordingState({
                    isRecording: true,
                    duration: 0,
                    error: null,
                });

                console.log('[useCallRecording] ✅ Recording started');
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Failed to start recording';
                console.error('[useCallRecording] ❌ Start recording error:', error);
                setRecordingState({
                    isRecording: false,
                    duration: 0,
                    error: errorMessage,
                });
                throw error;
            }
        },
        [mergeAudioStreams]
    );

    /**
     * Cleanup recording resources
     */
    const cleanupRecording = useCallback(() => {
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (mergedStreamRef.current) {
            mergedStreamRef.current.getTracks().forEach((track) => track.stop());
            mergedStreamRef.current = null;
        }

        setRecordingState((prev) => ({
            ...prev,
            isRecording: false,
        }));

        mediaRecorderRef.current = null;
    }, []);

    /**
     * Stop recording and return the recorded audio blob
     */
    const stopRecording = useCallback(async (): Promise<Blob | null> => {
        return new Promise((resolve) => {
            console.log('[useCallRecording] 🛑 Stopping recording...');

            if (!mediaRecorderRef.current) {
                console.warn('[useCallRecording] No active recording');
                resolve(null);
                return;
            }

            const mediaRecorder = mediaRecorderRef.current;

            // Handle stop event
            mediaRecorder.onstop = () => {
                console.log('[useCallRecording] Recording stopped');

                // Create blob from recorded chunks
                const blob = new Blob(recordedChunksRef.current, {
                    type: 'audio/webm',
                });

                console.log('[useCallRecording] ✅ Recording blob created:', {
                    size: blob.size,
                    type: blob.type,
                });

                cleanupRecording();
                resolve(blob);
            };

            // Stop the recorder
            if (mediaRecorder.state === 'inactive') {
                resolve(null);
            } else {
                mediaRecorder.stop();
            }
        });
    }, [cleanupRecording]);

    /**
     * Pause recording
     */
    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.pause();
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
                durationIntervalRef.current = null;
            }
            console.log('[useCallRecording] ⏸️ Recording paused');
        }
    }, []);

    /**
     * Resume recording
     */
    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'paused') {
            mediaRecorderRef.current.resume();
            durationIntervalRef.current = setInterval(() => {
                setRecordingState((prev) => ({
                    ...prev,
                    duration: prev.duration + 1,
                }));
            }, 1000);
            console.log('[useCallRecording] ▶️ Recording resumed');
        }
    }, []);

    return {
        recordingState,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
    };
};

export default useCallRecording;
