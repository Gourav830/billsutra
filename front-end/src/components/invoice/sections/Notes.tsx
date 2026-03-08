import type { InvoiceSectionProps } from "@/types/invoice-template";
import { useSectionStyles } from "@/components/invoice/DesignConfigContext";

const Notes = ({ data }: InvoiceSectionProps) => {
  const { style } = useSectionStyles("notes");
  return (
    <section className="rounded-2xl border border-slate-200" style={style}>
      <p className="text-xs uppercase tracking-[0.25em] opacity-70">Notes</p>
      <p className="mt-3 text-sm">{data.notes}</p>
    </section>
  );
};

export default Notes;
