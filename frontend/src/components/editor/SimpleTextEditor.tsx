import { Textarea } from '@/components/ui/textarea';

interface SimpleTextEditorProps {
  content: string;
  onChange: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * SimpleTextEditor Component
 *
 * A clean, user-friendly textarea for announcement content
 * No formatting tags or complex markup - just plain text
 */
export function SimpleTextEditor({
  content,
  onChange,
  placeholder = 'Write your announcement here...',
  disabled = false,
}: SimpleTextEditorProps) {
  return (
    <Textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={12}
      className="resize-y font-sans text-base"
    />
  );
}
