import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionListProps {
  items: FAQItem[];
}

export function FAQSectionList({
  items,
}: FAQSectionListProps): React.ReactElement {
  return (
    <Accordion type="multiple" className="w-full">
      {items.map((item, idx) => (
        <AccordionItem key={idx} value={`item-${idx}`}>
          <AccordionTrigger className="text-left text-base font-semibold text-white">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="prose prose-sm prose-invert max-w-none pt-2 text-white/80 [&_p]:first:mt-0 [&_p]:last:mb-0 [&_strong]:font-semibold [&_strong]:text-white/80">
            <div
              dangerouslySetInnerHTML={{
                __html: item.answer
                  .split("\n\n")
                  .map(
                    (para) =>
                      `<p>${para
                        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br>")}</p>`,
                  )
                  .join(""),
              }}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default FAQSectionList;
