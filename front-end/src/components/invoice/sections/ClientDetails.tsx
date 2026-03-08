import type { InvoiceSectionProps } from "@/types/invoice-template";

const ClientDetails = ({ data }: InvoiceSectionProps) => {
  const client = data.client;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        Bill to
      </p>
      <div className="mt-3 grid gap-2 text-sm text-slate-700">
        <p className="text-base font-semibold text-slate-900">{client.name}</p>
        <p>{client.address}</p>
        <p>{client.phone}</p>
        <p>{client.email}</p>
      </div>
    </section>
  );
};

export default ClientDetails;
