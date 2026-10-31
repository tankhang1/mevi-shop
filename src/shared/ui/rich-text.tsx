import DOMPurify from "dompurify";

/** Renders admin-authored HTML after sanitising it. */
export function RichText({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}
