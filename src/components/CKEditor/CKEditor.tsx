import React, { useEffect, useRef } from 'react';
import { CKEditor as CKEditorReact } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    AccessibilityHelp,
    Alignment,
    AutoLink,
    Autosave,
    BlockQuote,
    Bold,
    Code,
    CodeBlock,
    Essentials,
    FindAndReplace,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    Heading,
    Highlight,
    HorizontalLine,
    ImageBlock,
    ImageCaption,
    ImageInline,
    ImageInsert,
    ImageInsertViaUrl,
    ImageResize,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    Indent,
    IndentBlock,
    Italic,
    Link,
    LinkImage,
    List,
    ListProperties,
    MediaEmbed,
    Mention,
    PageBreak,
    Paragraph,
    PasteFromOffice,
    RemoveFormat,
    SelectAll,
    SpecialCharacters,
    SpecialCharactersArrows,
    SpecialCharactersCurrency,
    SpecialCharactersEssentials,
    SpecialCharactersLatin,
    SpecialCharactersMathematical,
    SpecialCharactersText,
    Strikethrough,
    Subscript,
    Superscript,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableProperties,
    TableToolbar,
    TextTransformation,
    TodoList,
    Underline,
    Undo,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import styles from './CKEditor.module.scss';

export interface CKEditorProps {
    label?: string;
    name: string;
    value: string;
    onChange: (data: string) => void;
    placeholder?: string;
    icon?: string;
    iconPrefix?: 'ti' | 'feather';
    error?: string;
    disabled?: boolean;
    required?: boolean;
    wrapperClassName?: string;
}

const CKEditor: React.FC<CKEditorProps> = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    icon,
    iconPrefix = 'ti',
    error,
    disabled = false,
    required = false,
    wrapperClassName = '',
}) => {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<ClassicEditor | null>(null);
    const [isLayoutReady, setIsLayoutReady] = React.useState(false);

    useEffect(() => {
        setIsLayoutReady(true);
        return () => setIsLayoutReady(false);
    }, []);

    const getIconClass = () => {
        if (!icon) return '';
        if (iconPrefix === 'feather') {
            return icon.startsWith('feather-') ? icon : `feather-${icon}`;
        }
        return icon.startsWith('ti-') ? `ti ${icon}` : `ti ti-${icon}`;
    };

    // Helper function to generate heading options
    const createHeadingOption = (level: number) => ({
        model: `heading${level}` as const,
        view: `h${level}` as const,
        title: `Heading ${level}`,
        class: `ck-heading_heading${level}`,
    });

    const editorConfig = {
        toolbar: {
            items: [
                'undo',
                'redo',
                '|',
                'heading',
                '|',
                'fontSize',
                'fontFamily',
                'fontColor',
                'fontBackgroundColor',
                '|',
                'bold',
                'italic',
                'underline',
                'strikethrough',
                'subscript',
                'superscript',
                'code',
                'removeFormat',
                '|',
                'alignment',
                '|',
                'link',
                'insertImage',
                'mediaEmbed',
                'insertTable',
                'blockQuote',
                'codeBlock',
                'horizontalLine',
                'pageBreak',
                'specialCharacters',
                '|',
                'bulletedList',
                'numberedList',
                'todoList',
                'outdent',
                'indent',
                '|',
                'highlight',
                'findAndReplace',
                'selectAll',
            ],
            shouldNotGroupWhenFull: true,
        },
        plugins: [
            AccessibilityHelp,
            Alignment,
            AutoLink,
            Autosave,
            BlockQuote,
            Bold,
            Code,
            CodeBlock,
            Essentials,
            FindAndReplace,
            FontBackgroundColor,
            FontColor,
            FontFamily,
            FontSize,
            Heading,
            Highlight,
            HorizontalLine,
            ImageBlock,
            ImageCaption,
            ImageInline,
            ImageInsert,
            ImageInsertViaUrl,
            ImageResize,
            ImageStyle,
            ImageTextAlternative,
            ImageToolbar,
            ImageUpload,
            Indent,
            IndentBlock,
            Italic,
            Link,
            LinkImage,
            List,
            ListProperties,
            MediaEmbed,
            Mention,
            PageBreak,
            Paragraph,
            PasteFromOffice,
            RemoveFormat,
            SelectAll,
            SpecialCharacters,
            SpecialCharactersArrows,
            SpecialCharactersCurrency,
            SpecialCharactersEssentials,
            SpecialCharactersLatin,
            SpecialCharactersMathematical,
            SpecialCharactersText,
            Strikethrough,
            Subscript,
            Superscript,
            Table,
            TableCaption,
            TableCellProperties,
            TableColumnResize,
            TableProperties,
            TableToolbar,
            TextTransformation,
            TodoList,
            Underline,
            Undo,
        ],
        heading: {
            options: [
                { model: 'paragraph' as const, title: 'Paragraph', class: 'ck-heading_paragraph' },
                ...Array.from({ length: 6 }, (_, i) => createHeadingOption(i + 1)),
            ],
        },
        image: {
            toolbar: [
                'imageTextAlternative',
                'toggleImageCaption',
                'imageStyle:inline',
                'imageStyle:block',
                'imageStyle:side',
                'linkImage',
            ],
        },
        link: {
            defaultProtocol: 'https://',
            decorators: {
                openInNewTab: {
                    mode: 'manual' as const,
                    label: 'Open in a new tab',
                    attributes: {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                    },
                },
            },
        },
        list: {
            properties: {
                styles: true,
                startIndex: true,
                reversed: true,
            },
        },
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells',
                'tableProperties',
                'tableCellProperties',
            ],
        },
        fontSize: {
            options: [9, 11, 13, 'default', 17, 19, 21],
            supportAllValues: true,
        },
        fontFamily: {
            options: [
                'default',
                'Arial, Helvetica, sans-serif',
                'Courier New, Courier, monospace',
                'Georgia, serif',
                'Lucida Sans Unicode, Lucida Grande, sans-serif',
                'Tahoma, Geneva, sans-serif',
                'Times New Roman, Times, serif',
                'Trebuchet MS, Helvetica, sans-serif',
                'Verdana, Geneva, sans-serif',
            ],
            supportAllValues: true,
        },
        placeholder: placeholder || 'Nhập nội dung...',
        initialData: value,
        // GPL license key for open source projects
        licenseKey: 'GPL',
    };

    return (
        <div className={wrapperClassName || 'mb-3'}>
            {label && (
                <label htmlFor={name} className="form-label">
                    {icon && (
                        <>
                            <i className={`${getIconClass()} me-1`}></i>{' '}
                        </>
                    )}
                    {label}
                    {required && <span className="text-danger ms-1">*</span>}
                </label>
            )}

            <div className={styles.editorWrapper} ref={editorContainerRef}>
                <div className={error ? 'ck-editor is-invalid' : ''}>
                    {isLayoutReady && (
                        <CKEditorReact
                            editor={ClassicEditor}
                            config={editorConfig}
                            data={value}
                            disabled={disabled}
                            onReady={(editor) => {
                                editorRef.current = editor;
                            }}
                            onChange={(_event, editor) => {
                                const data = editor.getData();
                                onChange(data);
                            }}
                        />
                    )}
                </div>
            </div>

            {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
    );
};

export default CKEditor;
