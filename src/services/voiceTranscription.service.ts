import { AxiosProgressEvent } from 'axios';
import axiosInstance from '@/configs/axios.config';

export interface TranscriptionResponse {
    success: boolean;
    data: {
        originalFileName: string;
        fileSize: number;
        contentType: string;
        transcript: string;
        transcriptLength: number;
        processedAt: string;
    };
    message: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

class VoiceTranscriptionService {
    /**
     * Upload and transcribe audio file in a single request
     * This is the recommended method for most use cases
     *
     * @param audioBlob - The audio blob to transcribe
     * @param fileName - Optional filename (defaults to 'recording.webm')
     * @param onProgress - Optional progress callback
     * @returns Promise with transcription result
     */
    async uploadAndTranscribe(
        audioBlob: Blob,
        fileName: string = 'recording.webm',
        onProgress?: (progress: UploadProgress) => void
    ): Promise<TranscriptionResponse> {
        try {
            console.log('[VoiceTranscriptionService] 📤 Uploading and transcribing:', {
                size: audioBlob.size,
                type: audioBlob.type,
                fileName,
            });

            const formData = new FormData();

            // Create File from Blob with proper filename
            const file = new File([audioBlob], fileName, { type: audioBlob.type });
            formData.append('audio', file);

            const response: any = await axiosInstance.post(
                '/voice/upload-and-transcribe',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                        if (progressEvent.total && onProgress) {
                            const progress: UploadProgress = {
                                loaded: progressEvent.loaded,
                                total: progressEvent.total,
                                percentage: Math.round(
                                    (progressEvent.loaded * 100) / progressEvent.total
                                ),
                            };
                            onProgress(progress);
                            console.log(
                                `[VoiceTranscriptionService] Upload progress: ${progress.percentage}%`
                            );
                        }
                    },
                    // Longer timeout for transcription (5 minutes)
                    timeout: 300000,
                }
            );

            console.log('[VoiceTranscriptionService] ✅ Raw response:', response);
            console.log('[VoiceTranscriptionService] ✅ Response.data:', response.data);
            console.log('[VoiceTranscriptionService] ✅ Transcript:', response.data?.transcript);
            console.log('[VoiceTranscriptionService] ✅ Transcription successful:', {
                transcriptLength: response.data.transcriptLength,
                transcriptPreview: response.data?.transcript?.substring(0, 100),
            });

            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Transcription successful',
            };
        } catch (error: any) {
            console.error('[VoiceTranscriptionService] ❌ Transcription failed:', error);
            throw new Error(error.message || 'Failed to transcribe audio');
        }
    }

    /**
     * Upload audio file only (without transcription)
     * Use this if you want to transcribe later
     */
    async uploadAudio(
        audioBlob: Blob,
        fileName: string = 'recording.webm',
        onProgress?: (progress: UploadProgress) => void
    ): Promise<{ fileName: string; filePath: string }> {
        try {
            console.log('[VoiceTranscriptionService] 📤 Uploading audio:', {
                size: audioBlob.size,
                type: audioBlob.type,
                fileName,
            });

            const formData = new FormData();
            const file = new File([audioBlob], fileName, { type: audioBlob.type });
            formData.append('audio', file);

            const response: any = await axiosInstance.post('/voice/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const progress: UploadProgress = {
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                            percentage: Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            ),
                        };
                        onProgress(progress);
                    }
                },
            });

            console.log('[VoiceTranscriptionService] ✅ Upload successful');

            return {
                fileName: response.data.fileName,
                filePath: response.data.filePath,
            };
        } catch (error: any) {
            console.error('[VoiceTranscriptionService] ❌ Upload failed:', error);
            throw new Error(error.message || 'Failed to upload audio');
        }
    }

    /**
     * Transcribe previously uploaded audio file
     * Use this with uploadAudio() for two-step process
     */
    async transcribeUploadedFile(fileName: string): Promise<string> {
        try {
            console.log('[VoiceTranscriptionService] 🎤 Transcribing file:', fileName);

            const response: any = await axiosInstance.post(
                `/voice/transcribe/${fileName}`,
                {},
                {
                    // Longer timeout for transcription
                    timeout: 300000,
                }
            );

            console.log('[VoiceTranscriptionService] ✅ Transcription successful');

            return response.data.transcript;
        } catch (error: any) {
            console.error('[VoiceTranscriptionService] ❌ Transcription failed:', error);
            throw new Error(error.message || 'Failed to transcribe audio');
        }
    }

    /**
     * Delete temporary audio file
     */
    async deleteTempFile(fileName: string): Promise<void> {
        try {
            console.log('[VoiceTranscriptionService] 🗑️ Deleting temp file:', fileName);

            await axiosInstance.delete(`/voice/temp/${fileName}`);

            console.log('[VoiceTranscriptionService] ✅ Delete successful');
        } catch (error: any) {
            console.error('[VoiceTranscriptionService] ❌ Delete failed:', error);
            throw new Error(error.message || 'Failed to delete temporary file');
        }
    }
}

export default new VoiceTranscriptionService();
