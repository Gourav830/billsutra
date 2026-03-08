import { Button } from "@/components/ui/button";

type InvoiceActionsProps = {
  onPrint: () => void;
  onDownloadPdf: () => void;
};

const InvoiceActions = ({ onPrint, onDownloadPdf }: InvoiceActionsProps) => {
  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button type="button" variant="outline" onClick={onPrint}>
        Print invoice
      </Button>
      <Button type="button" onClick={onDownloadPdf}>
        Download PDF
      </Button>
    </div>
  );
};

export default InvoiceActions;
