import type { InvoiceSectionProps } from "@/types/invoice-template";

const Notes = ({ data }: InvoiceSectionProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        Notes
      </p>
      <p className="mt-3 text-sm text-slate-700">{data.notes}</p>
    </section>
  );
};

export default Notes;
