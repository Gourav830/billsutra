"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import DashNavbar from "@/components/dashboard/DashNav";
import InvoiceRenderer from "@/components/invoice/InvoiceRenderer";
import {
  BUSINESS_TYPES,
  SECTION_LABELS,
  TEMPLATE_CATALOG,
} from "@/lib/invoiceTemplateData";
import { PREVIEW_INVOICE } from "@/lib/invoicePreviewData";
import type { SectionKey } from "@/types/invoice-template";
import {
  fetchTemplates,
  fetchUserTemplates,
  saveUserTemplate,
} from "@/lib/apiClient";
import { calculateTotals } from "@/components/invoice/sections/utils";
import { useInvoicePdf } from "@/hooks/invoice/useInvoicePdf";

const TemplatesClient = ({ name, image }: { name: string; image?: string }) => {
  const [businessTypeId, setBusinessTypeId] = useState("retail");
  const [selectedTemplateId, setSelectedTemplateId] = useState("minimal");
  const [enabledSections, setEnabledSections] = useState<SectionKey[]>(
    BUSINESS_TYPES[0].defaultSections,
  );
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(
    BUSINESS_TYPES[0].defaultSections,
  );
  const [themeColor, setThemeColor] = useState("#2563eb");
  const [showLogo, setShowLogo] = useState(true);
  const [pendingAutoSave, setPendingAutoSave] = useState<SectionKey[] | null>(
    null,
  );
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(
    null,
  );
  const [previewEnabledSections, setPreviewEnabledSections] = useState<
    SectionKey[]
  >([]);
  const [previewSectionOrder, setPreviewSectionOrder] = useState<SectionKey[]>(
    [],
  );
  const [previewThemeColor, setPreviewThemeColor] = useState("#2563eb");
  const [previewShowLogo, setPreviewShowLogo] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: templateRecords = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
  });

  const { data: userTemplateRecords = [] } = useQuery({
    queryKey: ["user-templates"],
    queryFn: fetchUserTemplates,
  });

  const { downloadPdf } = useInvoicePdf();

  const saveTemplateMutation = useMutation({
    mutationFn: saveUserTemplate,
    onSuccess: () => {
      toast.success("Template settings saved");
    },
    onError: () => {
      toast.error("Unable to save template settings");
    },
  });

  const knownSections = useMemo(
    () => new Set<SectionKey>(Object.keys(SECTION_LABELS) as SectionKey[]),
    [],
  );

  const normalizeSection = useCallback(
    (section: string): SectionKey | null => {
      return knownSections.has(section as SectionKey)
        ? (section as SectionKey)
        : null;
    },
    [knownSections],
  );

  const templatesFromApi = useMemo(() => {
    if (!templateRecords.length) return null;

    const mapFontFamily = (font: string) => {
      const value = font.toLowerCase();
      if (value.includes("sora")) return "var(--font-sora)";
      if (value.includes("fraunces")) return "var(--font-fraunces)";
      if (value.includes("mono")) return "var(--font-geist-mono)";
      return "var(--font-geist-sans)";
    };

    return templateRecords.map((template) => {
      const orderedSections = (template.sections ?? [])
        .slice()
        .sort((a, b) => a.section_order - b.section_order)
        .map((section) => normalizeSection(section.section_key))
        .filter((section): section is SectionKey => Boolean(section));
      const defaultSections = (template.sections ?? [])
        .filter((section) => section.is_default)
        .sort((a, b) => a.section_order - b.section_order)
        .map((section) => normalizeSection(section.section_key))
        .filter((section): section is SectionKey => Boolean(section));

      return {
        id: String(template.id),
        name: template.name,
        description: template.description ?? "",
        layout: template.layout_config.layout,
        defaultSections: defaultSections.length
          ? defaultSections
          : orderedSections,
        theme: {
          primaryColor: template.layout_config.primaryColor,
          fontFamily: mapFontFamily(template.layout_config.font),
          tableStyle: template.layout_config.tableStyle,
        },
        sectionOrder: orderedSections.length
          ? orderedSections
          : defaultSections,
      };
    });
  }, [templateRecords, normalizeSection]);

  const templates = templatesFromApi ?? TEMPLATE_CATALOG;

  const selectedTemplate = useMemo(() => {
    return (
      templates.find((item) => item.id === selectedTemplateId) ?? templates[0]
    );
  }, [selectedTemplateId, templates]);

  const previewTemplate = useMemo(() => {
    if (!previewTemplateId) return null;
    return templates.find((item) => item.id === previewTemplateId) ?? null;
  }, [previewTemplateId, templates]);

  useEffect(() => {
    if (!templates.length) return;
    if (!templates.some((item) => item.id === selectedTemplateId)) {
      setSelectedTemplateId(templates[0].id);
      setThemeColor(templates[0].theme.primaryColor);
    }
  }, [templates, selectedTemplateId]);

  useEffect(() => {
    const templateIdNumber = Number(selectedTemplateId);
    if (!templateIdNumber || Number.isNaN(templateIdNumber)) return;

    const userTemplate = userTemplateRecords.find(
      (item) => item.template_id === templateIdNumber,
    );
    const template = templatesFromApi?.find(
      (item) => item.id === selectedTemplateId,
    );

    if (userTemplate) {
      const normalizedEnabled = userTemplate.enabled_sections
        .map((section) => normalizeSection(section))
        .filter((section): section is SectionKey => Boolean(section));
      const normalizedOrder = userTemplate.section_order
        .map((section) => normalizeSection(section))
        .filter((section): section is SectionKey => Boolean(section));
      if (normalizedEnabled.length) setEnabledSections(normalizedEnabled);
      if (normalizedOrder.length) setSectionOrder(normalizedOrder);
      if (userTemplate.theme_color) {
        setThemeColor(userTemplate.theme_color);
      }
      return;
    }

    if (template) {
      setEnabledSections(template.defaultSections);
      if ("sectionOrder" in template && Array.isArray(template.sectionOrder)) {
        setSectionOrder(template.sectionOrder as SectionKey[]);
      } else {
        setSectionOrder(template.defaultSections);
      }
      setThemeColor(template.theme.primaryColor);
    }
  }, [
    selectedTemplateId,
    templatesFromApi,
    userTemplateRecords,
    normalizeSection,
  ]);

  const handleBusinessTypeChange = (value: string) => {
    setBusinessTypeId(value);
    const matched = BUSINESS_TYPES.find((type) => type.id === value);
    if (matched) {
      setEnabledSections(matched.defaultSections);
      setSectionOrder(matched.defaultSections);
      setPendingAutoSave(matched.defaultSections);
    }
  };

  useEffect(() => {
    if (!pendingAutoSave) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      const templateIdNumber = Number(selectedTemplateId);
      if (!templateIdNumber || Number.isNaN(templateIdNumber)) return;

      saveTemplateMutation.mutate({
        template_id: templateIdNumber,
        enabled_sections: pendingAutoSave,
        section_order: pendingAutoSave,
        theme_color: themeColor,
      });
      setPendingAutoSave(null);
    }, 600);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [pendingAutoSave, selectedTemplateId, themeColor, saveTemplateMutation]);

  const handleToggleSection = (section: SectionKey) => {
    setEnabledSections((prev) => {
      if (prev.includes(section)) {
        return prev.filter((item) => item !== section);
      }
      return [...prev, section];
    });
  };

  const moveSection = (section: SectionKey, direction: "up" | "down") => {
    setSectionOrder((prev) => {
      const index = prev.indexOf(section);
      if (index === -1) return prev;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const updated = [...prev];
      const [removed] = updated.splice(index, 1);
      updated.splice(nextIndex, 0, removed);
      return updated;
    });
  };

  const movePreviewSection = (
    section: SectionKey,
    direction: "up" | "down",
  ) => {
    setPreviewSectionOrder((prev) => {
      const index = prev.indexOf(section);
      if (index === -1) return prev;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const updated = [...prev];
      const [removed] = updated.splice(index, 1);
      updated.splice(nextIndex, 0, removed);
      return updated;
    });
  };

  const previewData = useMemo(() => {
    return {
      ...PREVIEW_INVOICE,
      business: {
        ...PREVIEW_INVOICE.business,
        showLogoOnInvoice: showLogo,
      },
    };
  }, [showLogo]);

  const modalPreviewData = useMemo(() => {
    return {
      ...PREVIEW_INVOICE,
      business: {
        ...PREVIEW_INVOICE.business,
        showLogoOnInvoice: previewShowLogo,
      },
    };
  }, [previewShowLogo]);

  const buildPreviewPdfInput = () => {
    const totals = calculateTotals(modalPreviewData.items);
    return {
      businessName: modalPreviewData.business.businessName,
      invoiceNumber: modalPreviewData.invoiceNumber,
      invoiceDate: modalPreviewData.invoiceDate,
      customer: modalPreviewData.client,
      items: modalPreviewData.items.map((item) => {
        const lineSubtotal = item.quantity * item.unitPrice;
        const lineTax = lineSubtotal * ((item.taxRate ?? 0) / 100);
        return {
          name: item.name,
          quantity: item.quantity,
          price: item.unitPrice,
          tax_rate: item.taxRate ?? 0,
          total: lineSubtotal + lineTax,
        };
      }),
      totals: {
        subtotal: totals.subtotal,
        tax: totals.tax,
        discount: 0,
        total: totals.total,
      },
      taxMode: "CGST_SGST" as const,
      themeColor: previewThemeColor,
      fileName: `${previewTemplate?.name ?? "template"}-preview.pdf`,
    };
  };

  const cardPreviewData = useMemo(() => {
    return {
      ...PREVIEW_INVOICE,
      business: {
        ...PREVIEW_INVOICE.business,
        showLogoOnInvoice: false,
      },
      items: PREVIEW_INVOICE.items.slice(0, 1),
      notes: "",
    };
  }, []);

  const theme = useMemo(() => {
    return {
      ...selectedTemplate.theme,
      primaryColor: themeColor || selectedTemplate.theme.primaryColor,
    };
  }, [selectedTemplate, themeColor]);

  const previewTheme = useMemo(() => {
    if (!previewTemplate) return theme;
    return {
      ...previewTemplate.theme,
      primaryColor: previewThemeColor || previewTemplate.theme.primaryColor,
    };
  }, [previewTemplate, previewThemeColor, theme]);

  const applyTemplate = (templateId: string, color?: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedTemplateId(templateId);
    setThemeColor(color ?? template.theme.primaryColor);
    setEnabledSections(template.defaultSections);
    setSectionOrder(template.sectionOrder ?? template.defaultSections);
  };

  const openPreview = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setPreviewTemplateId(templateId);
    setPreviewThemeColor(template.theme.primaryColor);
    setPreviewEnabledSections(template.defaultSections);
    setPreviewSectionOrder(template.sectionOrder ?? template.defaultSections);
    setPreviewShowLogo(false);
  };

  const closePreview = () => {
    setPreviewTemplateId(null);
  };

  const handleSaveSettings = async () => {
    const templateIdNumber = Number(selectedTemplateId);
    if (!templateIdNumber || Number.isNaN(templateIdNumber)) return;

    await saveTemplateMutation.mutateAsync({
      template_id: templateIdNumber,
      enabled_sections: enabledSections,
      section_order: sectionOrder,
      theme_color: themeColor,
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f1ea] text-[#1f1b16]">
      <DashNavbar name={name} image={image} />
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <header>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
              Template studio
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Invoice templates</h1>
            <p className="mt-2 text-sm text-[#5c4b3b]">
              Choose a business type, enable sections, and preview updates in
              real time.
            </p>
          </header>

          <div className="rounded-3xl border border-[#eadfd3] bg-white p-6">
            <h2 className="text-sm font-semibold">1. Business type</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleBusinessTypeChange(type.id)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    businessTypeId === type.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-[#eadfd3] text-[#5c4b3b] hover:border-primary/50"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#eadfd3] bg-white p-6">
            <h2 className="text-sm font-semibold">2. Template selection</h2>
            {templatesLoading ? (
              <p className="mt-3 text-xs text-[#8a6d56]">
                Loading templates...
              </p>
            ) : null}
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    selectedTemplateId === template.id
                      ? "border-primary bg-primary/5"
                      : "border-[#eadfd3] hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div
                        className="h-2 w-12 rounded-full"
                        style={{ backgroundColor: template.theme.primaryColor }}
                      />
                      <p className="mt-3 text-base font-semibold">
                        {template.name}
                      </p>
                      <p className="mt-2 text-xs text-[#5c4b3b]">
                        {template.description}
                      </p>
                    </div>
                    {selectedTemplateId === template.id ? (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                        Active
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 max-h-[240px] overflow-hidden rounded-2xl border border-[#f1e6da] bg-[#fffaf5] p-3">
                    <div className="pointer-events-none origin-top-left scale-[0.65]">
                      <InvoiceRenderer
                        data={cardPreviewData}
                        enabledSections={template.defaultSections}
                        sectionOrder={template.sectionOrder}
                        theme={template.theme}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openPreview(template.id)}
                      className="rounded-full border border-[#eadfd3] px-4 py-2 text-xs font-semibold"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate(template.id)}
                      className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      Use template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#eadfd3] bg-white p-6">
            <h2 className="text-sm font-semibold">3. Customize sections</h2>
            <div className="mt-4 grid gap-3">
              {sectionOrder.map((section) => (
                <div
                  key={section}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eadfd3] px-4 py-3"
                >
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={enabledSections.includes(section)}
                      onChange={() => handleToggleSection(section)}
                      className="h-4 w-4 rounded border-[#d6c8b8] text-primary"
                    />
                    {SECTION_LABELS[section]}
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => moveSection(section, "up")}
                      className="rounded-full border border-[#eadfd3] px-3 py-1"
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(section, "down")}
                      className="rounded-full border border-[#eadfd3] px-3 py-1"
                    >
                      Move down
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <span>Theme color</span>
                <input
                  type="color"
                  value={themeColor}
                  onChange={(event) => setThemeColor(event.target.value)}
                  className="h-9 w-9 rounded border border-[#eadfd3]"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={() => setShowLogo((prev) => !prev)}
                  className="h-4 w-4 rounded border-[#d6c8b8] text-primary"
                />
                Show logo
              </label>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saveTemplateMutation.isPending}
                className="ml-auto rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saveTemplateMutation.isPending ? "Saving..." : "Save settings"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#eadfd3] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Live preview</h2>
            <span className="text-xs text-[#8a6d56]">Mock data</span>
          </div>
          <div className="mt-5">
            <InvoiceRenderer
              data={previewData}
              enabledSections={enabledSections}
              sectionOrder={sectionOrder}
              theme={theme}
            />
          </div>
        </section>
      </main>
      {previewTemplate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white text-[#1f1b16] shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eadfd3] px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
                  Template preview
                </p>
                <h3 className="mt-1 text-xl font-semibold">
                  {previewTemplate.name}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => downloadPdf(buildPreviewPdfInput())}
                  className="rounded-full border border-[#eadfd3] px-4 py-2 text-xs font-semibold"
                >
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const normalizedOrder = previewSectionOrder.length
                      ? previewSectionOrder
                      : previewEnabledSections;
                    applyTemplate(previewTemplate.id, previewThemeColor);
                    setEnabledSections(previewEnabledSections);
                    setSectionOrder(normalizedOrder);

                    const templateIdNumber = Number(previewTemplate.id);
                    if (templateIdNumber && !Number.isNaN(templateIdNumber)) {
                      await saveTemplateMutation.mutateAsync({
                        template_id: templateIdNumber,
                        enabled_sections: previewEnabledSections,
                        section_order: normalizedOrder,
                        theme_color: previewThemeColor,
                      });
                    }

                    closePreview();
                  }}
                  disabled={saveTemplateMutation.isPending}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {saveTemplateMutation.isPending
                    ? "Saving..."
                    : "Use template"}
                </button>
                <button
                  type="button"
                  onClick={closePreview}
                  className="rounded-full border border-[#eadfd3] px-4 py-2 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="grid flex-1 gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-[0.4fr_0.6fr]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-[#eadfd3] bg-[#fffaf5] p-4">
                  <h4 className="text-sm font-semibold">Preview settings</h4>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <label className="flex items-center gap-2">
                      <span>Theme color</span>
                      <input
                        type="color"
                        value={previewThemeColor}
                        onChange={(event) =>
                          setPreviewThemeColor(event.target.value)
                        }
                        className="h-9 w-9 rounded border border-[#eadfd3]"
                      />
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={previewShowLogo}
                        onChange={() => setPreviewShowLogo((prev) => !prev)}
                        className="h-4 w-4 rounded border-[#d6c8b8] text-primary"
                      />
                      Show logo
                    </label>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#eadfd3] bg-white p-4">
                  <h4 className="text-sm font-semibold">Sections</h4>
                  <div className="mt-3 grid gap-2 text-sm">
                    {previewSectionOrder.map((section) => (
                      <div
                        key={section}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#eadfd3] px-3 py-2"
                      >
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={previewEnabledSections.includes(section)}
                            onChange={() =>
                              setPreviewEnabledSections((prev) => {
                                if (prev.includes(section)) {
                                  return prev.filter(
                                    (item) => item !== section,
                                  );
                                }
                                return [...prev, section];
                              })
                            }
                            className="h-4 w-4 rounded border-[#d6c8b8] text-primary"
                          />
                          <span>{SECTION_LABELS[section]}</span>
                        </label>
                        <div className="flex items-center gap-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() => movePreviewSection(section, "up")}
                            className="rounded-full border border-[#eadfd3] px-2 py-1"
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            onClick={() => movePreviewSection(section, "down")}
                            className="rounded-full border border-[#eadfd3] px-2 py-1"
                          >
                            Down
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[#eadfd3] bg-white p-4">
                <InvoiceRenderer
                  data={modalPreviewData}
                  enabledSections={previewEnabledSections}
                  sectionOrder={previewSectionOrder}
                  theme={previewTheme}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TemplatesClient;
