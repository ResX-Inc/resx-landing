import * as Dialog from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/Button";
import type { GiftNote } from "@/lib/gift/checkout";

interface GiftTextPreviewProps {
  recipientName: string;
  durationMonths: number;
  note: GiftNote;
}

/**
 * The gift code's first part: the recipient's first name, accents folded,
 * upper-cased and cut to four of A-Z0-9, or GIFT when nothing is left
 * (resx-app web-gift-card-sales REQ-11). The random part is never shown here.
 */
function codePrefix(recipientName: string): string {
  const first = recipientName.trim().split(/\s+/)[0] ?? "";
  const letters = first
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
  return letters || "GIFT";
}

/**
 * Shows the buyer the text the recipient will get. The wording mirrors the
 * web gift SMS in resx-app (`apps/worker/src/promotion/gift-promotion-sms-body.ts`,
 * `buildWebGiftSmsBody`), so change both together. It shows the version for a
 * recipient without a ResX account; one with an account gets a direct link.
 */
export function GiftTextPreview({
  recipientName,
  durationMonths,
  note,
}: GiftTextPreviewProps) {
  const firstName = recipientName.trim().split(/\s+/)[0] || recipientName;
  const parts = [
    `🎁 ${note.buyerName} sent you ${durationMonths} months of ResX Premium to access last-minute tables at the city's most in-demand spots.`,
    ...(note.message ? [`"${note.message}"`] : []),
    `Download the app at resx.co/download and use code ${codePrefix(recipientName)}-••••• when you upgrade to redeem your gift.`,
    "Reply STOP to opt out.",
  ];

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          size="xl"
          className="border-white/20 bg-transparent px-6 text-sm hover:border-white/40 hover:bg-transparent hover:text-white"
        >
          See the text {firstName} gets
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-48px)] w-[min(360px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-auto rounded-[34px] border border-white/12 bg-[#0e0e0e] px-3.5 pt-[18px] pb-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] focus:outline-none">
          <div className="flex flex-col items-center gap-1 border-b border-white/8 pb-3.5">
            <span className="font-display text-sand-storm grid size-10 place-items-center rounded-full bg-linear-to-b from-[#b0663a] to-[#6c2d16] text-[15px]">
              R
            </span>
            <Dialog.Title className="text-[15px] leading-5 font-semibold text-white">
              ResX
            </Dialog.Title>
            <Dialog.Description className="text-xs leading-4 text-zinc-300/70">
              The text {firstName} gets
            </Dialog.Description>
          </div>

          <p className="mt-3.5 max-w-[88%] rounded-[18px_18px_18px_6px] bg-[#2a2a2c] px-3 py-2.5 text-sm leading-[19px] break-words whitespace-pre-line text-white">
            {parts.join("\n\n")}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[13px] leading-[18px] text-zinc-300/75">
              Only {firstName}'s text shows the full code.
            </span>
            <Dialog.Close asChild>
              <Button variant="premium" className="h-9.5 shrink-0 px-4">
                Done
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
