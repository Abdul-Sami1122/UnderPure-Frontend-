import { useState } from "react";
import { Save, CheckCircle, RotateCcw, Store, Truck, Share2, Mail } from "lucide-react";
import { useSiteSettingsStore } from "../../store/siteSettingsStore";
import { toast } from "sonner";

const INPUT_CLS =
  "w-full bg-[#0a0a0a] border border-[#d4a59a]/20 focus:border-[#d4a59a]/50 text-[#f5f0ee] text-xs font-['Montserrat'] px-3 py-2.5 outline-none transition-colors placeholder-[#9a8f8c]/50";
const LABEL_CLS =
  "block text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-2";

function Field({ label, children, hint }) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      {children}
      {hint && <p className="text-[9px] font-['Montserrat'] text-[#9a8f8c]/50 mt-1">{hint}</p>}
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="border border-[#d4a59a]/10 bg-[#0d0d0d] p-6 mb-4">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#d4a59a]/10">
        <Icon size={15} strokeWidth={1.5} className="text-[#d4a59a]" />
        <h2 className="font-['Cormorant_Garamond'] text-xl font-light text-[#f5f0ee]">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function AdminSettings() {
  const settings = useSiteSettingsStore();
  const [saved, setSaved] = useState(false);

  const [draft, setDraft] = useState({
    storeName: settings.storeName,
    storeEmail: settings.storeEmail,
    storePhone: settings.storePhone,
    storeAddress: settings.storeAddress,
    freeShippingThreshold: settings.freeShippingThreshold,
    instagramUrl: settings.instagramUrl,
    facebookUrl: settings.facebookUrl,
    twitterUrl: settings.twitterUrl,
    footerTagline: settings.footerTagline,
  });

  const set = (key, value) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    settings.updateSettings(draft);
    setSaved(true);
    toast.success("Store settings saved successfully");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    settings.resetToDefaults();
    setDraft({
      storeName: "Underpure",
      storeEmail: "hello@underpure.com",
      storePhone: "+44 20 7123 4567",
      storeAddress: "12 Mayfair Row, London W1K 6AB, United Kingdom",
      freeShippingThreshold: 150,
      instagramUrl: "#",
      facebookUrl: "#",
      twitterUrl: "#",
      footerTagline: "Luxury lingerie and intimate apparel, crafted for the discerning woman. Beauty in every thread.",
    });
    toast.success("Settings reset to defaults");
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#f5f0ee]">Settings</h1>
          <p className="text-[#9a8f8c] text-xs font-['Montserrat'] mt-1">Store configuration</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#d4a59a]/20 text-[9px] tracking-[0.15em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#f5f0ee] hover:border-[#d4a59a]/40 transition-colors"
          >
            <RotateCcw size={11} strokeWidth={1.5} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 text-[9px] tracking-[0.15em] uppercase font-['Montserrat'] font-semibold transition-colors ${saved
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-[#d4a59a] text-[#0a0a0a] hover:bg-[#f2c6b4]"
              }`}
          >
            {saved ? <CheckCircle size={11} strokeWidth={1.5} /> : <Save size={11} strokeWidth={1.5} />}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* Store Info */}
      <Section icon={Store} title="Store Information">
        <Field label="Store Name" hint="Displayed in the navbar, footer, and browser tab">
          <input
            type="text"
            value={draft.storeName}
            onChange={(e) => set("storeName", e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Footer Tagline">
          <input
            type="text"
            value={draft.footerTagline}
            onChange={(e) => set("footerTagline", e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Store Address">
          <input
            type="text"
            value={draft.storeAddress}
            onChange={(e) => set("storeAddress", e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
      </Section>

      {/* Contact */}
      <Section icon={Mail} title="Contact Details">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email Address">
            <input
              type="email"
              value={draft.storeEmail}
              onChange={(e) => set("storeEmail", e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
          <Field label="Phone Number">
            <input
              type="tel"
              value={draft.storePhone}
              onChange={(e) => set("storePhone", e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
        </div>
      </Section>

      {/* Shipping */}
      <Section icon={Truck} title="Shipping Settings">
        <Field label="Free Shipping Threshold (£)" hint="Orders above this amount get free shipping">
          <input
            type="number"
            min={0}
            value={draft.freeShippingThreshold}
            onChange={(e) => set("freeShippingThreshold", Number(e.target.value))}
            className={INPUT_CLS}
          />
        </Field>
        <div className="border border-[#d4a59a]/10 p-4 bg-[#0a0a0a]">
          <p className="text-[9px] font-['Montserrat'] text-[#9a8f8c]">
            Current announcement bar shows:{" "}
            <span className="text-[#d4a59a]">
              "Complimentary Shipping on Orders Over £{draft.freeShippingThreshold}"
            </span>
          </p>
          <p className="text-[8px] font-['Montserrat'] text-[#9a8f8c]/50 mt-1">
            Update the announcement bar text in Homepage Content to reflect threshold changes.
          </p>
        </div>
      </Section>

      {/* Social Media */}
      <Section icon={Share2} title="Social Media Links">
        {[
          { key: "instagramUrl", label: "Instagram URL", placeholder: "https://instagram.com/underpure" },
          { key: "facebookUrl", label: "Facebook URL", placeholder: "https://facebook.com/underpure" },
          { key: "twitterUrl", label: "X / Twitter URL", placeholder: "https://x.com/underpure" },
        ].map((field) => (
          <Field key={field.key} label={field.label}>
            <input
              type="url"
              value={draft[field.key]}
              onChange={(e) => set(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={INPUT_CLS}
            />
          </Field>
        ))}
      </Section>

      {/* Danger zone */}
      <div className="border border-red-500/15 bg-red-500/3 p-6">
        <h2 className="font-['Cormorant_Garamond'] text-xl font-light text-red-400 mb-4 pb-3 border-b border-red-500/15">
          Danger Zone
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-['Montserrat'] text-[#f5f0ee]">Maintenance Mode</p>
              <p className="text-[9px] font-['Montserrat'] text-[#9a8f8c]">Temporarily disable the storefront for customers</p>
            </div>
            <button className="px-4 py-2 border border-red-500/30 text-[9px] tracking-[0.15em] uppercase font-['Montserrat'] text-red-400 hover:bg-red-500/10 transition-colors">
              Enable
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-['Montserrat'] text-[#f5f0ee]">Clear All Data</p>
              <p className="text-[9px] font-['Montserrat'] text-[#9a8f8c]">Reset all settings to factory defaults</p>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-red-500/30 text-[9px] tracking-[0.15em] uppercase font-['Montserrat'] text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}