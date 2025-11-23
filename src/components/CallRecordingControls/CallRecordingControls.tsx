import React, { useEffect, useState } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { useCallRecording } from '@/hooks/useCallRecording';
import CallRecordingService, { type UploadProgress } from '@/services/callRecording.service';
import { toast } from 'react-toastify';

interface CallRecordingControlsProps {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    appointmentId?: string;
    conversationId: string;
    isCallActive: boolean;
    onRecordingComplete?: (recordingId: string) => void;
}

/**
 * Component for managing call recording during video calls
 * Integrates with useCallRecording hook and CallRecordingService
 */
const CallRecordingControls: React.FC<CallRecordingControlsProps> = ({
    localStream,
    remoteStream,
    appointmentId,
    conversationId,
    isCallActive,
    onRecordingComplete,
}) => {
    const { recordingState, startRecording, stopRecording, pauseRecording, resumeRecording } =
        useCallRecording();

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [recordingError, setRecordingError] = useState<string | null>(null);

    // Auto-start recording when call becomes active (optional)
    // Comment this out if you want manual control only
    useEffect(() => {
        if (isCallActive && localStream && remoteStream && !recordingState.isRecording) {
            handleStartRecording();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCallActive, localStream, remoteStream]);

    // Auto-stop and upload when call ends
    useEffect(() => {
        if (!isCallActive && recordingState.isRecording) {
            handleStopAndUpload();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCallActive]);

    const handleStartRecording = async () => {
        if (!localStream || !remoteStream) {
            toast.error('Không thể bắt đầu ghi âm: Chưa có kết nối');
            return;
        }

        try {
            setRecordingError(null);
            await startRecording(localStream, remoteStream);
            toast.success('Đã bắt đầu ghi âm cuộc gọi');
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Không thể bắt đầu ghi âm';
            setRecordingError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleStopAndUpload = async () => {
        try {
            // Stop recording and get blob
            const blob = await stopRecording();

            if (!blob || blob.size === 0) {
                console.warn('[CallRecordingControls] No recording data available');
                return;
            }

            console.log('[CallRecordingControls] Recording stopped, blob size:', blob.size);

            // Upload if we have appointmentId
            if (appointmentId) {
                setIsUploading(true);
                setUploadProgress(null);

                const response = await CallRecordingService.uploadRecording(
                    blob,
                    appointmentId,
                    conversationId,
                    (progress) => {
                        setUploadProgress(progress);
                    }
                );

                if (response.success && response.data) {
                    toast.success('Đã lưu bản ghi cuộc gọi');
                    onRecordingComplete?.(response.data.recordingId);
                } else {
                    toast.error('Không thể lưu bản ghi: ' + (response.message || 'Unknown error'));
                }
            } else {
                // No appointmentId - just save locally or download
                console.log('[CallRecordingControls] No appointmentId, creating download link');
                downloadBlob(blob, `call-recording-${conversationId}-${Date.now()}.webm`);
                toast.success('Bản ghi đã được tải xuống');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể lưu bản ghi';
            console.error('[CallRecordingControls] Upload error:', error);
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
        }
    };

    const handlePause = () => {
        pauseRecording();
        toast.info('Đã tạm dừng ghi âm');
    };

    const handleResume = () => {
        resumeRecording();
        toast.info('Đã tiếp tục ghi âm');
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="call-recording-controls">
            {/* Recording Status */}
            {recordingState.isRecording && (
                <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-danger">
                        <i className="bi bi-record-circle me-1"></i>
                        REC {formatDuration(recordingState.duration)}
                    </span>
                </div>
            )}

            {/* Upload Progress */}
            {isUploading && uploadProgress && (
                <Alert variant="info" className="mb-2">
                    <div className="d-flex align-items-center gap-2">
                        <Spinner animation="border" size="sm" />
                        <span>
                            Đang tải lên: {uploadProgress.percentage}% ({uploadProgress.loaded} /{' '}
                            {uploadProgress.total} bytes)
                        </span>
                    </div>
                </Alert>
            )}

            {/* Error Message */}
            {recordingError && (
                <Alert variant="danger" dismissible onClose={() => setRecordingError(null)}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {recordingError}
                </Alert>
            )}

            {recordingState.error && (
                <Alert variant="danger" className="mb-2">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {recordingState.error}
                </Alert>
            )}

            {/* Recording Controls */}
            <div className="d-flex gap-2">
                {recordingState.isRecording ? (
                    <>
                        <Button variant="warning" size="sm" onClick={handlePause}>
                            <i className="bi bi-pause-circle me-1"></i>
                            Tạm dừng
                        </Button>
                        <Button variant="success" size="sm" onClick={handleResume}>
                            <i className="bi bi-play-circle me-1"></i>
                            Tiếp tục
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleStopAndUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        className="me-1"
                                    />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-stop-circle me-1"></i>
                                    Dừng & Lưu
                                </>
                            )}
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleStartRecording}
                        disabled={!isCallActive || !localStream || !remoteStream}
                    >
                        <i className="bi bi-record-circle me-1"></i>
                        Bắt đầu ghi âm
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CallRecordingControls;
