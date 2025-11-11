import { useEffect, useRef } from 'react';
import useSound from 'use-sound';

/**
 * Custom hook for notification sounds
 * Provides sound effects for messages and calls
 */
export const useNotificationSounds = () => {
    // Track if sounds have been initialized (browser requires user interaction)
    const soundsInitializedRef = useRef(false);

    console.log('[NotificationSounds] 🎵 Hook initialized');

    // Message notification sound
    const [playMessageSound, { stop: stopMessageSound }] = useSound(
        '/sounds/message-notification.mp3',
        {
            volume: 0.5,
            interrupt: true,
            onload: () => console.log('[NotificationSounds] ✅ Message sound loaded'),
            onloaderror: (_id: any, error: any) =>
                console.error('[NotificationSounds] ❌ Failed to load message sound:', error),
        }
    );

    // Incoming call sound (can loop)
    const [playCallSound, { stop: stopCallSound }] = useSound('/sounds/incoming-call.mp3', {
        volume: 0.7,
        loop: true, // Loop for incoming calls
        interrupt: true,
        onload: () => console.log('[NotificationSounds] ✅ Call sound loaded'),
        onloaderror: (_id: any, error: any) =>
            console.error('[NotificationSounds] ❌ Failed to load call sound:', error),
    });

    // Initialize sounds on first user interaction OR component mount
    useEffect(() => {
        const initSounds = () => {
            if (!soundsInitializedRef.current) {
                soundsInitializedRef.current = true;
                console.log('[NotificationSounds] ✅ Sounds initialized');
            }
        };

        // Try to initialize immediately (might work if user already interacted)
        initSounds();

        // Also listen for user interaction to ensure sounds are enabled
        document.addEventListener('click', initSounds, { once: true });
        document.addEventListener('keydown', initSounds, { once: true });

        return () => {
            document.removeEventListener('click', initSounds);
            document.removeEventListener('keydown', initSounds);
        };
    }, []);

    /**
     * Play message notification sound
     * Safe to call - won't error if sound file is missing
     */
    const playMessageNotification = () => {
        console.log(
            '[NotificationSounds] 🔔 playMessageNotification called, soundsInitialized:',
            soundsInitializedRef.current
        );
        try {
            if (soundsInitializedRef.current) {
                playMessageSound();
                console.log('[NotificationSounds] 🔔 Playing message notification');
            } else {
                console.warn(
                    '[NotificationSounds] ⚠️ Sounds not initialized yet - need user interaction first'
                );
                // Try to play anyway - might work if user already interacted
                playMessageSound();
            }
        } catch (error) {
            console.warn('[NotificationSounds] ⚠️ Could not play message sound:', error);
        }
    };

    /**
     * Play incoming call sound (loops until stopped)
     * Safe to call - won't error if sound file is missing
     */
    const playIncomingCallSound = () => {
        console.log(
            '[NotificationSounds] 📞 playIncomingCallSound called, soundsInitialized:',
            soundsInitializedRef.current
        );
        try {
            if (soundsInitializedRef.current) {
                playCallSound();
                console.log('[NotificationSounds] 📞 Playing incoming call sound');
            } else {
                console.warn(
                    '[NotificationSounds] ⚠️ Sounds not initialized yet - need user interaction first'
                );
                // Try to play anyway - might work if user already interacted
                playCallSound();
            }
        } catch (error) {
            console.warn('[NotificationSounds] ⚠️ Could not play call sound:', error);
        }
    };

    /**
     * Stop incoming call sound
     */
    const stopIncomingCallSound = () => {
        try {
            stopCallSound();
            console.log('[NotificationSounds] 🔇 Stopped incoming call sound');
            console.trace('[NotificationSounds] 🔍 stopIncomingCallSound called from:');
        } catch (error) {
            console.warn('[NotificationSounds] ⚠️ Could not stop call sound:', error);
        }
    };

    /**
     * Stop message notification sound
     * (Usually not needed since it's a short sound, but available if needed)
     */
    const stopMessageNotification = () => {
        try {
            stopMessageSound();
            console.log('[NotificationSounds] 🔇 Stopped message notification sound');
        } catch (error) {
            console.warn('[NotificationSounds] ⚠️ Could not stop message sound:', error);
        }
    };

    return {
        playMessageNotification,
        playIncomingCallSound,
        stopIncomingCallSound,
        stopMessageNotification, // Export for flexibility
    };
};
