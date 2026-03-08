import type { InvoiceSectionProps } from "@/types/invoice-template";
import { useSectionStyles } from "@/components/invoice/DesignConfigContext";

const Footer = ({ data }: InvoiceSectionProps) => {
  const { style } = useSectionStyles("footer");
  return (
    <section
      className="rounded-2xl border border-slate-200 text-sm"
      style={style}
    >
      <p>
        Thank you for choosing {data.business.businessName}. We appreciate your
        business.
      </p>
    </section>
  );
};

export default Footer;
