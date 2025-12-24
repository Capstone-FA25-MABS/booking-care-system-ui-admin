import { toast } from 'react-toastify';
import { NavigateFunction } from 'react-router-dom';
import { ChatService } from '@/services/chat.service';
import { AppointmentCardData } from '@/types/appointment.types';

/**
 * Create or get conversation and navigate to messages page
 * @param appointment - Appointment data containing patient account ID
 * @param currentUserAccountId - Current user's account ID (doctor or hospital)
 * @param messagesPath - Path to messages page
 * @param navigate - React Router navigate function
 * @param logContext - Context name for logging (e.g., 'MyAppointments', 'ListAppointments')
 */
export const createConversationAndNavigate = async (
    appointment: AppointmentCardData,
    currentUserAccountId: string | undefined,
    messagesPath: string,
    navigate: NavigateFunction,
    logContext: string = 'Chat'
) => {
    console.log(`[${logContext}] 💬 Opening chat with patient:`, {
        currentUserAccountId,
        patientAccountId: appointment.patientAccountId,
    });

    if (!currentUserAccountId) {
        toast.error('Không tìm thấy thông tin tài khoản');
        return;
    }

    if (!appointment.patientAccountId) {
        toast.error('Không tìm thấy thông tin tài khoản bệnh nhân');
        return;
    }

    try {
        console.log(`[${logContext}] 📡 Creating conversation...`);

        // Tạo conversation (API sẽ tự động tạo mới hoặc trả về conversation đã tồn tại)
        const response = await ChatService.createConversation({
            participants: [currentUserAccountId, appointment.patientAccountId],
        });

        console.log(`[${logContext}] ✅ Conversation created:`, response.data);

        if (response.success && response.data) {
            console.log(`[${logContext}] 🚀 Navigating to:`, messagesPath, {
                conversationId: response.data.id,
                appointmentId: appointment.appointmentId,
            });

            navigate(messagesPath, {
                state: {
                    conversationId: response.data.id,
                    appointmentId: appointment.appointmentId, // Pass appointmentId for AI summary
                },
            });
        } else {
            console.error(`[${logContext}] ❌ Invalid response:`, response);
            toast.error('Không thể tạo cuộc trò chuyện');
        }
    } catch (error: any) {
        console.error(`[${logContext}] ❌ Error creating conversation:`, error);
        console.error(`[${logContext}] ❌ Error details:`, {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        toast.error(error.message || 'Không thể mở cuộc trò chuyện');
    }
};
