import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { PublicFaqBlock } from "../model/content-blocks.types";

interface Props {
  block?: PublicFaqBlock | null;
}

export function HomeFaqSection({ block }: Props) {
  if (!block || !block.items || block.items.length === 0) {
    return null;
  }

  const { eyebrow, title, items } = block;

  return (
    <section className="shell mt-14 pb-16" id="faq">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && (
        <h2 className="mt-2 text-3xl font-extrabold text-[#214c3a]">
          {title}
        </h2>
      )}
      <Accordion
        type="single"
        collapsible
        defaultValue="faq-0"
        className="mt-6 grid gap-3"
      >
        {items.map((item, idx) => (
          <AccordionItem
            key={idx}
            value={`faq-${idx}`}
            className="rounded-2xl border border-[#e7e4d9] bg-white px-5"
          >
            <AccordionTrigger className="py-4 text-left text-sm font-bold text-[#214c3a] hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-6 text-muted-foreground whitespace-pre-line">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

