import { AxiosProgressEvent } from 'axios';
import axiosInstance from '@/configs/axios.config';

export interface UploadRecordingResponse {
    success: boolean;
    data?: {
        recordingId: string;
        fileUrl: string;
        duration: number;
        fileSize: number;
    };
    message?: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

class CallRecordingService {
    /**
     * Upload call recording to server
     * @param audioBlob - The recorded audio blob
     * @param appointmentId - The appointment ID associated with this call
     * @param conversationId - The conversation ID
     * @param onProgress - Optional callback for upload progress
     * @returns Promise with upload response
     */
    async uploadRecording(
        audioBlob: Blob,
        appointmentId: string,
        conversationId: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadRecordingResponse> {
        try {
            console.log('[CallRecordingService] 📤 Uploading recording:', {
                size: audioBlob.size,
                type: audioBlob.type,
                appointmentId,
                conversationId,
            });

            // Create FormData
            const formData = new FormData();

            // Create a File object from Blob with proper filename
            const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
            const filename = `call-recording-${appointmentId}-${timestamp}.webm`;
            const file = new File([audioBlob], filename, { type: audioBlob.type });

            formData.append('file', file);
            formData.append('appointmentId', appointmentId);
            formData.append('conversationId', conversationId);

            // Upload with progress tracking
            const response: any = await axiosInstance.post('/call-recordings/upload', formData, {
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
                            `[CallRecordingService] Upload progress: ${progress.percentage}%`
                        );
                    }
                },
            });

            console.log('[CallRecordingService] ✅ Upload successful:', response.data);
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Upload successful',
            };
        } catch (error: any) {
            console.error('[CallRecordingService] ❌ Upload failed:', error);
            throw new Error(error.message || 'Failed to upload recording');
        }
    }

    /**
     * Download a recording by ID
     * @param recordingId - The recording ID
     * @returns Promise with blob URL
     */
    async downloadRecording(recordingId: string): Promise<string> {
        try {
            console.log('[CallRecordingService] 📥 Downloading recording:', recordingId);

            const response = await axiosInstance.get(`/call-recordings/${recordingId}`, {
                responseType: 'blob',
            });

            // Create blob URL
            const blobUrl = URL.createObjectURL(response.data);
            console.log('[CallRecordingService] ✅ Download successful');

            return blobUrl;
        } catch (error: any) {
            console.error('[CallRecordingService] ❌ Download failed:', error);
            throw new Error(error.message || 'Failed to download recording');
        }
    }

    /**
     * Delete a recording by ID
     * @param recordingId - The recording ID
     */
    async deleteRecording(recordingId: string): Promise<void> {
        try {
            console.log('[CallRecordingService] 🗑️ Deleting recording:', recordingId);

            await axiosInstance.delete(`/call-recordings/${recordingId}`);

            console.log('[CallRecordingService] ✅ Delete successful');
        } catch (error: any) {
            console.error('[CallRecordingService] ❌ Delete failed:', error);
            throw new Error(error.message || 'Failed to delete recording');
        }
    }

    /**
     * Get recording metadata
     * @param appointmentId - The appointment ID
     * @returns Promise with recording metadata
     */
    async getRecordingByAppointment(appointmentId: string): Promise<UploadRecordingResponse> {
        try {
            console.log(
                '[CallRecordingService] 📋 Fetching recording for appointment:',
                appointmentId
            );

            const response: any = await axiosInstance.get(
                `/call-recordings/appointment/${appointmentId}`
            );

            console.log('[CallRecordingService] ✅ Fetch successful:', response.data);
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Fetch successful',
            };
        } catch (error: any) {
            console.error('[CallRecordingService] ❌ Fetch failed:', error);
            throw new Error(error.message || 'Failed to fetch recording metadata');
        }
    }
}

export default new CallRecordingService();
