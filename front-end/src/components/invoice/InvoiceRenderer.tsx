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
    <div className="space-y-3">
      <p className="text-center text-[0.82rem] font-semibold text-slate-700">
        Only you can see this data on Vyapar
      </p>
      <div className="rounded-2xl border border-slate-200 bg-[#eef2ff]/45 p-2 sm:p-4">
        <div className="mx-auto w-full max-w-[820px] rounded-xl border border-slate-300 bg-white px-3 py-3 shadow-[0_10px_30px_-25px_rgba(15,23,42,0.45)] sm:px-5 sm:py-5">
          <div
            className="space-y-1"
            style={{
              fontFamily: theme.fontFamily,
            }}
          >
            {order.map((section) => {
              const SectionComponent = SECTION_MAP[section];
              return (
                <SectionComponent key={section} data={data} theme={theme} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceRenderer;
