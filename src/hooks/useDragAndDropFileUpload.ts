import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook for drag and drop file upload functionality
 * Extracts common drag & drop logic to reduce code duplication
 */
export const useDragAndDropFileUpload = (
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    accept: string = 'image/*',
    name: string = 'file'
) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const objectUrlRef = useRef<string | null>(null);

    // Cleanup object URL on unmount
    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            // Check if file type matches accept pattern (e.g., 'image/*' matches 'image/jpeg', 'image/png', etc.)
            const isImageType = accept === 'image/*' && file.type.startsWith('image/');
            const matchesAccept = accept.includes(file.type) || isImageType;

            if (matchesAccept) {
                setIsUploading(true);
                setTimeout(() => {
                    const mockEvent = {
                        target: {
                            files: [file],
                            name,
                            value: '',
                        },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    onFileChange(mockEvent);
                    setIsUploading(false);
                }, 500);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsUploading(true);
        setTimeout(() => {
            onFileChange(e);
            setIsUploading(false);
        }, 500);
    };

    /**
     * Creates object URL from file and manages cleanup
     */
    const createObjectUrl = (file: File | null): string => {
        // Clean up previous object URL if it exists
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        if (file) {
            const objectUrl = URL.createObjectURL(file);
            objectUrlRef.current = objectUrl;
            return objectUrl;
        }

        return '';
    };

    return {
        isDragOver,
        isUploading,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleFileChange,
        createObjectUrl,
    };
};
