import type { InvoiceSectionProps } from "@/types/invoice-template";
import { useSectionStyles } from "@/components/invoice/DesignConfigContext";

const ClientDetails = ({ data }: InvoiceSectionProps) => {
  const { style } = useSectionStyles("client_details");
  const client = data.client;

  return (
    <section className="rounded-2xl border border-slate-200" style={style}>
      <p className="text-xs uppercase tracking-[0.25em] opacity-70">Bill to</p>
      <div className="mt-3 grid gap-2 text-sm">
        <p className="text-base font-semibold">{client.name}</p>
        <p>{client.address}</p>
        <p>{client.phone}</p>
        <p>{client.email}</p>
      </div>
    </section>
  );
};

export default ClientDetails;
