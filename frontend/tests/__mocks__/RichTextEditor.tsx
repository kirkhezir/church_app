import React from 'react';

export const RichTextEditor = ({
  content,
  onChange,
  placeholder,
  disabled,
}: {
  content: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) => (
  <textarea
    data-testid="rich-text-editor"
    placeholder={placeholder}
    value={content}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
  />
);

export default RichTextEditor;
