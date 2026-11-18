import type { ReactNode } from "react";

import logo from "@/assets/trend-report/resx-logo-sand.svg";

/*
 * The running header and footer shared by the Pulse's inner pages: the small
 * sand logo with the section name at the top, and the logo with the page
 * number at the bottom. Measurements are Figma px ÷ 8.16 (cqw).
 */
export function PulseFrame({
  label,
  folio,
  children,
}: {
  /** Section name in the top-right corner, e.g. "01 · The Want Ratio". */
  label: string;
  /** Printed page number, e.g. "02". */
  folio: string;
  children: ReactNode;
}) {
  return (
    <div className="pulse-page">
      {children}

      <img
        src={logo.src}
        alt=""
        className="absolute top-[4.17cqw] left-[6.86cqw] h-[1.23cqw] w-[4.33cqw]"
      />
      <p className="pulse-running absolute top-[4.11cqw] right-[6.86cqw]">
        {label}
      </p>

      <img
        src={logo.src}
        alt=""
        className="absolute bottom-[3.68cqw] left-[6.86cqw] h-[1.59cqw] w-[5.63cqw]"
      />
      <p className="pulse-folio absolute right-[6.86cqw] bottom-[3.92cqw]">
        {folio}
      </p>
    </div>
  );
}
