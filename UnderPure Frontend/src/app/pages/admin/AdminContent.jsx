import { useState } from "react";
import { Eye, EyeOff, RotateCcw, Save, CheckCircle } from "lucide-react";
import { useSiteSettingsStore } from "../../store/siteSettingsStore";
import { toast } from "sonner";

const INPUT_CLS =
  "w-full bg-[#1a1a1a] md:bg-[#0a0a0a] border border-[#d4a59a]/20 focus:border-[#d4a59a]/50 text-[#f5f0ee] text-sm md:text-xs font-['Montserrat'] px-4 py-3 md:px-3 md:py-2.5 outline-none transition-colors placeholder-[#9a8f8c]/50 rounded-sm md:rounded-none";
const TEXTAREA_CLS = INPUT_CLS + " resize-none";
const LABEL_CLS =
  "block text-[11px] md:text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] font-semibold md:font-normal mb-2 md:mb-2";

function Field({ label, children }) {
  return (
    <div className="mb-5 md:mb-0">
      <label className={LABEL_CLS}>{label}</label>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border border-[#d4a59a]/15 md:border-[#d4a59a]/10 bg-[#0d0d0d] p-5 md:p-6 mb-5 md:mb-4 rounded-sm md:rounded-none shadow-sm md:shadow-none">
      <h2 className="font-['Cormorant_Garamond'] text-2xl md:text-xl font-medium md:font-light text-[#f5f0ee] mb-5 pb-3 border-b border-[#d4a59a]/10">
        {title}
      </h2>
      <div className="space-y-0 md:space-y-4">{children}</div>
    </div>
  );
}

export function AdminContent() {
  const settings = useSiteSettingsStore();
  const [saved, setSaved] = useState(false);

  // Local draft state
  const [draft, setDraft] = useState({
    announcementText: settings.announcementText,
    announcementVisible: settings.announcementVisible,
    heroHeadline: settings.heroHeadline,
    heroHeadlineItalic: settings.heroHeadlineItalic,
    heroSubheadline: settings.heroSubheadline,
    heroBadgeText: settings.heroBadgeText,
    heroCtaText: settings.heroCtaText,
    newsletterTitle: settings.newsletterTitle,
    newsletterSub: settings.newsletterSub,
  });

  const set = (key, value) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    settings.updateSettings(draft);
    setSaved(true);
    toast.success("Homepage content updated — changes are live");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    settings.resetToDefaults();
    setDraft({
      announcementText: "Complimentary Shipping on Orders Over £150 · New Collection Now Available",
      announcementVisible: true,
      heroHeadline: "Dressed in",
      heroHeadlineItalic: "Nothing But Luxury",
      heroSubheadline:
        "Handcrafted lingerie for the woman who understands that true luxury begins with what lies beneath.",
      heroBadgeText: "New Collection · Spring 2026",
      heroCtaText: "Shop The Collection",
      newsletterTitle: "Join Our Inner Circle",
      newsletterSub:
        "Be the first to discover new collections, exclusive offers, and intimate styling notes.",
    });
    toast.success("Reset to defaults");
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-32 md:pb-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-0">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl md:text-3xl font-medium md:font-light text-[#f5f0ee]">Homepage Content</h1>
          <p className="text-[#9a8f8c] text-sm md:text-xs font-['Montserrat'] mt-2 md:mt-1">
            Changes apply immediately to the live storefront
          </p>
        </div>
        
        {/* Desktop Buttons (Hidden on mobile) */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#d4a59a]/20 text-[9px] tracking-[0.15em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#f5f0ee] hover:border-[#d4a59a]/40 transition-colors"
          >
            <RotateCcw size={11} strokeWidth={1.5} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 text-[9px] tracking-[0.15em] uppercase font-['Montserrat'] font-semibold transition-colors ${
              saved
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-[#d4a59a] text-[#0a0a0a] hover:bg-[#f2c6b4]"
            }`}
          >
            {saved ? <CheckCircle size={11} strokeWidth={1.5} /> : <Save size={11} strokeWidth={1.5} />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Announcement Bar */}
      <Section title="Announcement Bar">
        <div className="flex items-center justify-between mb-4 md:mb-2">
          <label className={LABEL_CLS + " mb-0"}>Visibility</label>
          <button
            onClick={() => set("announcementVisible", !draft.announcementVisible)}
            className={`flex items-center gap-2 text-[11px] md:text-[10px] tracking-[0.15em] md:tracking-[0.12em] uppercase font-['Montserrat'] font-semibold md:font-normal px-4 py-2 md:px-3 md:py-1.5 border transition-colors rounded-sm md:rounded-none ${
              draft.announcementVisible
                ? "border-[#d4a59a] text-[#d4a59a] bg-[#d4a59a]/10 md:bg-[#d4a59a]/5"
                : "border-[#d4a59a]/20 text-[#9a8f8c] hover:border-[#d4a59a]/40"
            }`}
          >
            {draft.announcementVisible ? <Eye size={14} md:size={11} strokeWidth={1.5} /> : <EyeOff size={14} md:size={11} strokeWidth={1.5} />}
            {draft.announcementVisible ? "Visible" : "Hidden"}
          </button>
        </div>
        <Field label="Announcement Text">
          <input
            type="text"
            value={draft.announcementText}
            onChange={(e) => set("announcementText", e.target.value)}
            className={INPUT_CLS}
            placeholder="Complimentary Shipping on Orders Over £150…"
          />
        </Field>
        {/* Live preview */}
        <div className={`mt-4 md:mt-3 py-3 px-4 md:py-2 text-center text-xs md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] uppercase font-['Montserrat'] font-semibold md:font-normal transition-all rounded-sm md:rounded-none ${
          draft.announcementVisible ? "bg-[#8b4f5c] text-[#f5f0ee]" : "bg-[#1a1a1a] text-[#9a8f8c] line-through opacity-50"
        }`}>
          {draft.announcementText || "No text set"}
        </div>
        <p className="text-[10px] md:text-[9px] font-['Montserrat'] text-[#9a8f8c]/50 mt-2 md:mt-1 text-center md:text-left">↑ Live preview</p>
      </Section>

      {/* Hero Section */}
      <Section title="Hero Section">
        <Field label="Badge Text">
          <input
            type="text"
            value={draft.heroBadgeText}
            onChange={(e) => set("heroBadgeText", e.target.value)}
            className={INPUT_CLS}
            placeholder="New Collection · Spring 2026"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
          <Field label="Headline (first line)">
            <input
              type="text"
              value={draft.heroHeadline}
              onChange={(e) => set("heroHeadline", e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
          <Field label="Headline (italic accent)">
            <input
              type="text"
              value={draft.heroHeadlineItalic}
              onChange={(e) => set("heroHeadlineItalic", e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
        </div>
        <Field label="Subheadline">
          <textarea
            value={draft.heroSubheadline}
            onChange={(e) => set("heroSubheadline", e.target.value)}
            rows={4} md:rows={3}
            className={TEXTAREA_CLS}
          />
        </Field>
        <Field label="Primary CTA Button Text">
          <input
            type="text"
            value={draft.heroCtaText}
            onChange={(e) => set("heroCtaText", e.target.value)}
            className={INPUT_CLS}
            placeholder="Shop The Collection"
          />
        </Field>

        {/* Preview card */}
        <div className="mt-4 md:mt-2 border border-[#d4a59a]/15 md:border-[#d4a59a]/10 p-6 md:p-6 bg-[#0a0a0a] text-center rounded-sm md:rounded-none">
          <p className="text-[#d4a59a] text-[10px] md:text-[9px] tracking-[0.2em] md:tracking-[0.35em] uppercase font-['Montserrat'] font-semibold md:font-normal mb-3 md:mb-2">
            {draft.heroBadgeText}
          </p>
          <p className="font-['Cormorant_Garamond'] text-4xl md:text-2xl font-medium md:font-light text-[#f5f0ee] mb-1">
            {draft.heroHeadline}
          </p>
          <p className="font-['Cormorant_Garamond'] text-4xl md:text-2xl font-medium md:font-light text-[#d4a59a] italic mb-4 md:mb-3">
            {draft.heroHeadlineItalic}
          </p>
          <p className="text-[#9a8f8c] text-xs md:text-[10px] font-['Montserrat'] mb-6 md:mb-4 max-w-sm md:max-w-xs mx-auto leading-relaxed">
            {draft.heroSubheadline}
          </p>
          <span className="inline-block bg-[#d4a59a] text-[#0a0a0a] px-6 py-3 md:py-2 text-[10px] md:text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] font-bold md:font-semibold rounded-sm md:rounded-none shadow-sm">
            {draft.heroCtaText}
          </span>
          <p className="text-[10px] md:text-[9px] font-['Montserrat'] text-[#9a8f8c]/50 mt-4 md:mt-3">↑ Live preview</p>
        </div>
      </Section>

      {/* Newsletter Section */}
      <Section title="Newsletter Section">
        <Field label="Newsletter Title">
          <input
            type="text"
            value={draft.newsletterTitle}
            onChange={(e) => set("newsletterTitle", e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Newsletter Subtext">
          <textarea
            value={draft.newsletterSub}
            onChange={(e) => set("newsletterSub", e.target.value)}
            rows={3} md:rows={2}
            className={TEXTAREA_CLS}
          />
        </Field>
      </Section>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#111]/95 backdrop-blur-md border-t border-[#d4a59a]/15 flex gap-3 z-40 md:hidden">
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-[#1a1a1a] border border-[#d4a59a]/20 text-[11px] tracking-[0.15em] uppercase font-['Montserrat'] font-semibold text-[#f5f0ee] rounded-sm"
        >
          <RotateCcw size={14} strokeWidth={1.5} />
          Reset
        </button>
        <button
          onClick={handleSave}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-[11px] tracking-[0.15em] uppercase font-['Montserrat'] font-bold rounded-sm shadow-lg transition-colors ${
            saved
              ? "bg-green-500 text-[#0a0a0a]"
              : "bg-[#d4a59a] text-[#0a0a0a]"
          }`}
        >
          {saved ? <CheckCircle size={14} strokeWidth={1.5} /> : <Save size={14} strokeWidth={1.5} />}
          {saved ? "Saved!" : "Save"}
        </button>
      </div>

    </div>
  );
}