import { useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import styles from './CustomFileInput.module.scss';

interface CustomFileInputProps {
    files: File[];
    onChange: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    id?: string;
}

/**
 * CustomFileInputProps
 *
 * @property {File[]} files - The array of currently selected files.
 * @property {(files: File[]) => void} onChange - Callback function called when files are selected, dropped, or removed. Receives the updated array of files.
 * @property {string} [accept='image/*'] - Specifies the file types that the input should accept.
 * @property {boolean} [multiple=true] - Allows selection of multiple files if true.
 * @property {number} [maxSize=5] - Maximum allowed file size in MB for each file.
 * @property {string} [id='file-input'] - The id attribute for the file input element.
 */
const CustomFileInput: React.FC<CustomFileInputProps> = ({
    files,
    onChange,
    accept = 'image/*',
    multiple = true,
    maxSize = 5, // 5MB default for images
    id = 'file-input',
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;

        const fileArray = Array.from(selectedFiles);

        // Validate file size
        const validFiles = fileArray.filter((file) => {
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > maxSize) {
                alert(`Tệp "${file.name}" vượt quá kích thước tối đa ${maxSize}MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            onChange([...files, ...validFiles]);
        }

        // Reset input to allow selecting the same file again
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = Array.from(e.dataTransfer.files);

        // Validate file size
        const validFiles = droppedFiles.filter((file) => {
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > maxSize) {
                alert(`Tệp "${file.name}" vượt quá kích thước tối đa ${maxSize}MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            onChange([...files, ...validFiles]);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
            return '🖼️';
        } else if (extension === 'pdf') {
            return '📄';
        } else if (['doc', 'docx'].includes(extension || '')) {
            return '📝';
        }
        return '📎';
    };

    return (
        <div className={styles.wrapper}>
            <input
                ref={inputRef}
                type="file"
                id={id}
                className={styles.hidden}
                multiple={multiple}
                accept={accept}
                onChange={handleFileSelect}
            />

            <button
                type="button"
                className={styles.dropzone}
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                aria-label="Chọn tệp để tải lên"
            >
                <Upload className={styles.icon} size={48} />
                <div className={styles.text}>
                    <p className={styles.title}>
                        Kéo thả tệp vào đây hoặc{' '}
                        <span className={styles.textPrimary}>chọn tệp</span>
                    </p>
                    <p className={styles.subtitle}>
                        Hỗ trợ: Ảnh (JPG, PNG, GIF) - Tối đa {maxSize}MB mỗi ảnh
                    </p>
                </div>
            </button>

            {files.length > 0 && (
                <div className={styles.list}>
                    <div className={styles.listHeader}>
                        <FileText size={16} />
                        <span>{files.length} tệp đã chọn</span>
                    </div>
                    <div className={styles.items}>
                        {files.map((file, index) => {
                            // Create unique key using timestamp and index to ensure proper re-rendering
                            const fileKey = `${file.name}-${file.size}-${file.lastModified}-${index}`;
                            return (
                                <div key={fileKey} className={styles.item}>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemIcon}>
                                            {getFileIcon(file.name)}
                                        </span>
                                        <div className={styles.itemDetails}>
                                            <div className={styles.itemName}>{file.name}</div>
                                            <div className={styles.itemSize}>
                                                {formatFileSize(file.size)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.itemRemove}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRemoveFile(index);
                                        }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                        }}
                                        title="Xóa tệp"
                                        aria-label="Xóa tệp"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomFileInput;
