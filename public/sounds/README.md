# Sound Files for Notifications

This directory contains sound files for chat notifications.

## Required Sound Files

Please add the following audio files to this directory:

### 1. `message-notification.mp3`

- **Usage:** New message notification
- **Trigger:** When receiving a new message (not on chat page)
- **Recommended:** Short, pleasant notification sound (1-2 seconds)
- **Example sources:**
    - https://mixkit.co/free-sound-effects/notification/
    - https://freesound.org/search/?q=notification
    - Create custom using tools like Audacity

### 2. `incoming-call.mp3`

- **Usage:** Incoming video/audio call
- **Trigger:** When receiving an incoming call
- **Recommended:** Ringtone-style sound (3-5 seconds, can loop)
- **Example sources:**
    - https://mixkit.co/free-sound-effects/phone/
    - https://freesound.org/search/?q=ringtone
    - https://www.zedge.net/find/ringtones/phone

## File Requirements

- **Format:** MP3 (widely supported)
- **Size:** Keep files small (< 100KB) for fast loading
- **Quality:** 128kbps is sufficient for notification sounds
- **Volume:** Normalize audio levels for consistent volume

## Alternative Formats (Optional)

You can also provide multiple formats for better browser compatibility:

- `message-notification.mp3`
- `message-notification.ogg`
- `message-notification.wav`

The code will automatically fall back to supported formats.

## Testing Sounds

After adding files, test them in the app:

1. Open two browser windows (different users)
2. Send a message → Should hear `message-notification.mp3`
3. Make a call → Should hear `incoming-call.mp3`

## Volume Control

Users can control sound volume through:

- Browser settings (site permissions)
- Future enhancement: In-app volume slider
