import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/hooks/invoice/useInvoiceDrafts";

type InvoiceHeaderProps = {
  isDirty: boolean;
  lastSavedAt: Date | null;
};

const InvoiceHeader = ({ isDirty, lastSavedAt }: InvoiceHeaderProps) => {
  return (
    <div className="rounded-3xl border border-[#e8d9cc] bg-white/80 p-6 shadow-[0_20px_40px_-30px_rgba(92,75,59,0.6)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8a6d56]">
            Invoices
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Create invoice
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5c4b3b]">
            Build GST-ready invoices with live totals, customer details, and
            preview-ready layouts for printing.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <span className="rounded-full border border-[#e8d9cc] bg-[#fff7ef] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[#8a6d56]">
            {isDirty ? "Draft" : "Saved"}
          </span>
          <span className="text-xs text-[#8a6d56]">
            {isDirty
              ? "Unsaved changes"
              : lastSavedAt
                ? `Saved ${formatRelativeTime(lastSavedAt)}`
                : "Ready"}
          </span>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/invoices/history">View invoice history</Link>
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-[#8a6d56]">
        <span className="rounded-full border border-[#e8d9cc] bg-white px-3 py-1">
          Live totals
        </span>
        <span className="rounded-full border border-[#e8d9cc] bg-white px-3 py-1">
          GST ready
        </span>
        <span className="rounded-full border border-[#e8d9cc] bg-white px-3 py-1">
          Print preview
        </span>
      </div>
    </div>
  );
};

export default InvoiceHeader;
