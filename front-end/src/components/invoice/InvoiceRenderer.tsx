import type {
  InvoicePreviewData,
  InvoiceTheme,
  InvoiceSectionProps,
  SectionKey,
} from "@/types/invoice-template";
import Header from "./sections/Header";
import CompanyDetails from "./sections/CompanyDetails";
import ClientDetails from "./sections/ClientDetails";
import ItemsTable from "./sections/ItemsTable";
import ServiceItemsTable from "./sections/ServiceItemsTable";
import TaxSection from "./sections/TaxSection";
import DiscountSection from "./sections/DiscountSection";
import PaymentInfo from "./sections/PaymentInfo";
import Notes from "./sections/Notes";
import Footer from "./sections/Footer";

const SECTION_MAP: Record<
  SectionKey,
  (props: InvoiceSectionProps) => JSX.Element
> = {
  header: Header,
  company_details: CompanyDetails,
  client_details: ClientDetails,
  items: ItemsTable,
  service_items: ServiceItemsTable,
  tax: TaxSection,
  discount: DiscountSection,
  payment_info: PaymentInfo,
  notes: Notes,
  footer: Footer,
};

export type InvoiceRendererProps = {
  data: InvoicePreviewData;
  enabledSections: SectionKey[];
  sectionOrder?: SectionKey[];
  theme: InvoiceTheme;
};

const InvoiceRenderer = ({
  data,
  enabledSections,
  sectionOrder,
  theme,
}: InvoiceRendererProps) => {
  const order = (sectionOrder?.length ? sectionOrder : enabledSections).filter(
    (section) => enabledSections.includes(section),
  );

  return (
    <div className="space-y-4">
      {order.map((section) => {
        const SectionComponent = SECTION_MAP[section];
        return <SectionComponent key={section} data={data} theme={theme} />;
      })}
    </div>
  );
};

export default InvoiceRenderer;
