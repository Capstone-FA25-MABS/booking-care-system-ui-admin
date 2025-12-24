import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Spinner, Alert, Form, Badge } from 'react-bootstrap';
import AIService, { type MedicalSummaryResponse } from '@/services/aiService';
import AppointmentService from '@/services/appointment.service';
import VoiceTranscriptionService from '@/services/voiceTranscription.service';
import { toast } from 'react-toastify';
import styles from './MedicalSummaryModal.module.scss';

interface MedicalSummaryModalProps {
    show: boolean;
    onHide: () => void;
    appointmentId: string;
    transcript: string;
    patientName?: string;
    doctorName?: string;
    appointmentDate?: Date;
    onSaveSuccess?: () => void;
}

const MedicalSummaryModal: React.FC<MedicalSummaryModalProps> = ({
    show,
    onHide,
    appointmentId,
    transcript,
    patientName,
    doctorName,
    appointmentDate,
    onSaveSuccess,
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [summary, setSummary] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [aiResponse, setAiResponse] = useState<MedicalSummaryResponse | null>(null);

    // Voice recording states
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionProgress, setTranscriptionProgress] = useState(0);
    const [localTranscript, setLocalTranscript] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Auto-generate summary when modal opens (only if transcript is available)
    useEffect(() => {
        if (show && !aiResponse) {
            // Only auto-generate if we have transcript content
            if (transcript && transcript.trim().length > 0) {
                console.log(
                    '[MedicalSummaryModal] 🤖 Auto-generating summary, transcript length:',
                    transcript.length
                );
                generateSummary();
            } else {
                console.log(
                    '[MedicalSummaryModal] ⏭️ No transcript available, allowing manual entry or voice recording'
                );
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, transcript]);

    // Cleanup recording on unmount or modal close
    useEffect(() => {
        if (!show) {
            stopRecordingInternal();
        }
        return () => {
            stopRecordingInternal();
        };
    }, [show]);

    // Recording duration timer
    useEffect(() => {
        if (isRecording) {
            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } else {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
            }
            setRecordingDuration(0);
        }
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, [isRecording]);

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            console.log('[MedicalSummaryModal] 🎤 Starting voice recording...');

            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Create MediaRecorder
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
                throw new Error('Trình duyệt không hỗ trợ ghi âm');
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: selectedMimeType,
                audioBitsPerSecond: 128000,
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onerror = (event: Event) => {
                console.error('[MedicalSummaryModal] MediaRecorder error:', event);
                toast.error('Lỗi khi ghi âm');
                stopRecordingInternal();
            };

            mediaRecorder.start(1000); // Collect data every 1 second
            setIsRecording(true);
            toast.success('Đã bắt đầu ghi âm');

            console.log('[MedicalSummaryModal] ✅ Recording started');
        } catch (err) {
            console.error('[MedicalSummaryModal] ❌ Failed to start recording:', err);
            const errorMessage =
                err instanceof Error ? err.message : 'Không thể truy cập microphone';
            toast.error(errorMessage);
            setError(errorMessage);
        }
    };

    const stopRecordingInternal = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    const handleTranscription = async (blob: Blob) => {
        setIsTranscribing(true);
        setTranscriptionProgress(0);

        try {
            const result = await VoiceTranscriptionService.uploadAndTranscribe(
                blob,
                `medical-note-${appointmentId}-${Date.now()}.webm`,
                (progress) => {
                    setTranscriptionProgress(progress.percentage);
                }
            );

            const transcriptText = result.data.transcript;
            setLocalTranscript(transcriptText);

            console.log(
                '[MedicalSummaryModal] ✅ Transcription successful:',
                transcriptText.length,
                'characters'
            );

            toast.success('Chuyển đổi giọng nói thành công');

            // Auto-generate summary from transcript
            await generateSummaryFromText(transcriptText);
        } catch (err) {
            console.error('[MedicalSummaryModal] ❌ Transcription failed:', err);
            const errorMessage =
                err instanceof Error ? err.message : 'Không thể chuyển đổi giọng nói';
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setIsTranscribing(false);
            setTranscriptionProgress(0);
            stopRecordingInternal();
        }
    };

    const stopRecordingAndTranscribe = async () => {
        if (!mediaRecorderRef.current) {
            return;
        }

        console.log('[MedicalSummaryModal] 🛑 Stopping recording and transcribing...');

        return new Promise<void>((resolve) => {
            if (!mediaRecorderRef.current) {
                resolve();
                return;
            }

            const mediaRecorder = mediaRecorderRef.current;

            mediaRecorder.onstop = async () => {
                setIsRecording(false);
                console.log('[MedicalSummaryModal] Recording stopped');

                // Create blob from chunks
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                console.log('[MedicalSummaryModal] Audio blob created:', blob.size, 'bytes');

                if (blob.size === 0) {
                    toast.warning('Không có dữ liệu âm thanh để chuyển đổi');
                    resolve();
                    return;
                }

                await handleTranscription(blob);
                resolve();
            };

            if (mediaRecorder.state === 'inactive') {
                resolve();
            } else {
                mediaRecorder.stop();
            }
        });
    };

    const generateSummaryFromText = async (text: string) => {
        setIsGenerating(true);
        setError(null);

        console.log('[MedicalSummaryModal] 📤 Generating summary from transcribed text');

        try {
            const response = await AIService.generateMedicalSummary({
                appointmentId,
                transcript: text,
                patientName,
                doctorName,
                appointmentDate: appointmentDate?.toISOString(),
            });

            console.log('[MedicalSummaryModal] ✅ AI API response:', response);

            if (response.success && response.data) {
                setAiResponse(response.data);
                setSummary(response.data.summary);
                toast.success('Đã tạo tóm tắt từ ghi âm');
            } else {
                setError('Không thể tạo tóm tắt');
            }
        } catch (err: unknown) {
            console.error('[MedicalSummaryModal] ❌ AI API error:', err);
            const errorMessage =
                err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo tóm tắt';
            setError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateSummary = async () => {
        setIsGenerating(true);
        setError(null);

        console.log('[MedicalSummaryModal] 📤 Calling AI API with:', {
            appointmentId,
            transcriptLength: transcript.length,
            patientName,
            doctorName,
            appointmentDate: appointmentDate?.toISOString(),
        });

        try {
            const response = await AIService.generateMedicalSummary({
                appointmentId,
                transcript,
                patientName,
                doctorName,
                appointmentDate: appointmentDate?.toISOString(),
            });

            console.log('[MedicalSummaryModal] ✅ AI API response:', response);

            if (response.success && response.data) {
                setAiResponse(response.data);
                setSummary(response.data.summary);
            } else {
                setError('Không thể tạo tóm tắt');
            }
        } catch (err: unknown) {
            console.error('[MedicalSummaryModal] ❌ AI API error:', err);
            const errorMessage =
                err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo tóm tắt';
            setError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!summary.trim()) {
            setError('Vui lòng nhập nội dung tóm tắt');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await AppointmentService.updateAppointmentResult(appointmentId, summary.trim());

            // Success
            onSaveSuccess?.();
            onHide();
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu tóm tắt';
            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRegenerate = () => {
        setAiResponse(null);
        setSummary('');
        generateSummary();
    };

    const handleClose = () => {
        setSummary('');
        setAiResponse(null);
        setError(null);
        setLocalTranscript('');
        stopRecordingInternal();
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-stars me-2"></i> Tóm tắt kết quả khám bệnh (AI)
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className={styles.modalBody}>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                        <i className="bi bi-exclamation-triangle me-2" />
                        {error}
                    </Alert>
                )}

                {/* Recording Status */}
                {isRecording && (
                    <Alert variant="danger" className="mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-record-circle-fill"></i>
                                <strong>Đang ghi âm...</strong>
                            </div>
                            <Badge bg="danger">{formatDuration(recordingDuration)}</Badge>
                        </div>
                    </Alert>
                )}

                {/* Transcription Progress */}
                {isTranscribing && (
                    <Alert variant="info" className="mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <Spinner animation="border" size="sm" />
                            <div className="flex-grow-1">
                                <strong>Đang chuyển đổi giọng nói thành văn bản...</strong>
                                {transcriptionProgress > 0 && transcriptionProgress < 100 && (
                                    <progress
                                        className="mt-2"
                                        value={transcriptionProgress}
                                        max={100}
                                        style={{ width: '100%', height: '4px' }}
                                    />
                                )}
                            </div>
                        </div>
                    </Alert>
                )}

                {/* Show transcribed text preview from video call */}
                {transcript && transcript.trim().length > 0 && !localTranscript && (
                    <Alert variant="info" className="mb-3">
                        <strong>Văn bản từ cuộc gọi ({transcript.length} ký tự):</strong>
                        <p
                            className="mb-0 mt-2 small"
                            style={{ maxHeight: '100px', overflow: 'auto' }}
                        >
                            {transcript}
                        </p>
                    </Alert>
                )}

                {/* Show transcribed text preview from manual recording */}
                {localTranscript && (
                    <Alert variant="success" className="mb-3">
                        <strong>Văn bản đã chuyển đổi ({localTranscript.length} ký tự):</strong>
                        <p
                            className="mb-0 mt-2 small"
                            style={{ maxHeight: '100px', overflow: 'auto' }}
                        >
                            {localTranscript}
                        </p>
                    </Alert>
                )}

                {isGenerating ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">
                            AI đang phân tích cuộc trò chuyện và tạo tóm tắt...
                        </p>
                        <p className="text-muted small">Quá trình này có thể mất 10-30 giây</p>
                    </div>
                ) : (
                    <>
                        {/* Show AI result if available */}
                        {aiResponse && (
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="form-label mb-0">
                                        <strong>Kết quả từ AI:</strong>
                                    </div>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={handleRegenerate}
                                        disabled={isGenerating}
                                    >
                                        <i className="bi bi-arrow-clockwise me-1"></i> Tạo lại
                                    </Button>
                                </div>
                                <div className={styles.aiSummaryBox}>
                                    <small className="text-muted">
                                        Được tạo lúc:{' '}
                                        {new Date(aiResponse.generatedAt).toLocaleString('vi-VN')}
                                    </small>
                                </div>
                            </div>
                        )}

                        {/* Show generate button if no AI response yet and has transcript */}
                        {!aiResponse && transcript && transcript.trim().length > 0 && (
                            <div className="mb-3">
                                <Alert variant="info">
                                    <i className="bi bi-info-circle me-2"></i> Có dữ liệu cuộc trò
                                    chuyện khả dụng. Bạn có thể sử dụng AI để tạo tóm tắt tự động.
                                </Alert>
                                <Button
                                    variant="primary"
                                    onClick={generateSummary}
                                    disabled={isGenerating}
                                >
                                    <i className="bi bi-stars me-2"></i> Tạo tóm tắt bằng AI
                                </Button>
                            </div>
                        )}

                        {/* Show info if no transcript */}
                        {!aiResponse && (!transcript || transcript.trim().length === 0) && (
                            <>
                                <Alert variant="warning" className="mb-3">
                                    <i className="bi bi-exclamation-triangle me-2" />
                                    <strong>Không có dữ liệu cuộc trò chuyện.</strong> Vui lòng nhập
                                    tóm tắt thủ công bên dưới hoặc sử dụng ghi âm giọng nói.
                                </Alert>

                                {/* Voice Recording Controls */}
                                {!isRecording && !isTranscribing && (
                                    <div className="mb-3 d-flex gap-2">
                                        <Button
                                            variant="outline-primary"
                                            onClick={startRecording}
                                            disabled={isGenerating || isSaving}
                                        >
                                            <i className="bi bi-mic-fill me-2"></i> Ghi âm tóm tắt
                                        </Button>
                                        <small className="text-muted align-self-center">
                                            Bấm để bắt đầu ghi âm và tự động chuyển thành văn bản
                                        </small>
                                    </div>
                                )}

                                {isRecording && (
                                    <div className="mb-3">
                                        <Button
                                            variant="danger"
                                            onClick={stopRecordingAndTranscribe}
                                            className="d-flex align-items-center gap-2"
                                        >
                                            <i className="bi bi-stop-circle-fill"></i>
                                            Dừng ghi âm ({formatDuration(recordingDuration)})
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}

                        <Form.Group>
                            <Form.Label>
                                <strong>Chỉnh sửa tóm tắt:</strong>
                                <small className="text-muted ms-2">
                                    (Bạn có thể chỉnh sửa nội dung trước khi lưu)
                                </small>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={15}
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="Nhập hoặc chỉnh sửa tóm tắt kết quả khám bệnh..."
                                className={styles.summaryTextarea}
                                disabled={isGenerating || isSaving}
                            />
                            <Form.Text className="text-muted">
                                {summary.length} / 4000 ký tự
                            </Form.Text>
                        </Form.Group>

                        <Alert variant="info" className="mt-3 mb-0">
                            <i className="bi bi-info-circle me-2" />
                            <strong>Lưu ý:</strong> Vui lòng kiểm tra và chỉnh sửa kỹ nội dung do AI
                            tạo trước khi lưu. AI chỉ là công cụ hỗ trợ, bác sĩ cần đảm bảo tính
                            chính xác của thông tin y tế.
                        </Alert>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                    disabled={isGenerating || isSaving}
                >
                    Hủy
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isGenerating || isSaving || !summary.trim()}
                >
                    {isSaving ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-check-circle me-2"></i> Xác nhận & Lưu
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default MedicalSummaryModal;
