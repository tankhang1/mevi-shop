import { useEffect, useRef } from 'react';
import { Bold, Heading3, Italic, Link2, List, ListOrdered, Underline, Eraser } from 'lucide-react';

// Lightweight WYSIWYG on contentEditable; output is sanitised again when rendered (RichText).
const tools = [
  { cmd: 'bold', icon: Bold, label: 'In đậm' },
  { cmd: 'italic', icon: Italic, label: 'In nghiêng' },
  { cmd: 'underline', icon: Underline, label: 'Gạch chân' },
  { cmd: 'formatBlock', arg: 'h3', icon: Heading3, label: 'Tiêu đề' },
  { cmd: 'insertUnorderedList', icon: List, label: 'Danh sách' },
  { cmd: 'insertOrderedList', icon: ListOrdered, label: 'Danh sách số' },
  { cmd: 'createLink', icon: Link2, label: 'Chèn link' },
  { cmd: 'removeFormat', icon: Eraser, label: 'Xoá định dạng' },
] as const;

export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  // Only push external values in when they differ, so typing doesn't reset the caret.
  useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value; }, [value]);

  const run = (cmd: string, arg?: string) => {
    if (cmd === 'createLink') { arg = window.prompt('Nhập đường dẫn (https://...)') || undefined; if (!arg) return; }
    if (cmd === 'formatBlock' && document.queryCommandValue('formatBlock').toLowerCase() === 'h3') arg = 'p';
    document.execCommand(cmd, false, arg);
    ref.current?.focus();
    onChange(ref.current?.innerHTML ?? '');
  };

  return <div className="overflow-hidden rounded-xl border border-[#deddd2] bg-[#fffefa] focus-within:ring-2 focus-within:ring-[#285e45]/15">
    <div className="flex flex-wrap gap-0.5 border-b border-[#ece8de] bg-[#f6f5ee] p-1.5">{tools.map(t =>
      <button key={t.label} type="button" title={t.label} aria-label={t.label} onMouseDown={e => { e.preventDefault(); run(t.cmd, 'arg' in t ? t.arg : undefined); }}
        className="grid h-8 w-8 place-items-center rounded-lg text-[#52645a] hover:bg-white hover:text-[#285e45]"><t.icon size={15} /></button>)}
    </div>
    <div ref={ref} contentEditable suppressContentEditableWarning onInput={e => onChange(e.currentTarget.innerHTML)}
      className="rich-text min-h-40 px-3.5 py-3 outline-none" data-testid="editor-product-description" />
  </div>;
}
