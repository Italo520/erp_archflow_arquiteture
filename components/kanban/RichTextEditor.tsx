'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react';

export function RichTextEditor({ content, onChange }: { content: string, onChange: (html: string) => void }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert prose-slate focus:outline-none min-h-[150px] p-4 bg-white dark:bg-slate-900 border border-t-0 border-gray-200 dark:border-slate-700 rounded-b-md',
            },
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col w-full rounded-md shadow-sm">
            <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-t-md border-b-0">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-700 text-primary' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-700 text-primary' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('strike') ? 'bg-slate-200 dark:bg-slate-700 text-primary' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    <Strikethrough className="h-4 w-4" />
                </button>
                <div className="w-px h-4 bg-gray-300 dark:bg-slate-600 mx-1" />
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('bulletList') ? 'bg-slate-200 dark:bg-slate-700 text-primary' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('orderedList') ? 'bg-slate-200 dark:bg-slate-700 text-primary' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
