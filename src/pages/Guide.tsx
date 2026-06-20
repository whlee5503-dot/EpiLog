import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, ClipboardList, BarChart2, Download, Shield, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1a6b4a]/10">
          {icon}
        </div>
        <h2 className="font-bold text-gray-900 dark:text-white text-sm">{title}</h2>
      </div>
      <div className="px-4 py-3 flex flex-col gap-3">
        {children}
      </div>
    </section>
  );
}

interface ItemProps {
  title: string;
  desc: string;
  badge?: string;
}

function Item({ title, desc, badge }: ItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <ChevronRight size={14} className="text-[#1a6b4a] shrink-0" />
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#1a6b4a]/10 text-[#1a6b4a]">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-5">{desc}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100 dark:bg-gray-700" />;
}

export default function Guide() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#1a6b4a] text-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 touch-manipulation"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-xl font-bold">{t.gd_title}</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full flex flex-col gap-4">

        {/* ── Getting Started ── */}
        <Section icon={<Info size={16} className="text-[#1a6b4a]" />} title={t.gd_section_start}>
          <Item title={t.gd_what_title} desc={t.gd_what_desc} />
          <Divider />
          <Item title={t.gd_privacy_title} desc={t.gd_privacy_reset} badge="!" />
        </Section>

        {/* ── Recording ── */}
        <Section icon={<ClipboardList size={16} className="text-[#1a6b4a]" />} title={t.gd_section_record}>
          <p className="text-xs font-semibold text-[#1a6b4a] uppercase tracking-wide">{t.gd_record_title}</p>
          <Item title={t.gd_step1_title} desc={t.gd_step1_desc} />
          <Divider />
          <Item title={t.gd_step2_title} desc={t.gd_step2_desc} />
          <Divider />
          <Item title={t.gd_step3_title} desc={t.gd_step3_desc} />
          <Divider />
          <Item title={t.gd_step4_title} desc={t.gd_step4_desc} />
        </Section>

        {/* ── Dashboard ── */}
        <Section icon={<BarChart2 size={16} className="text-[#1a6b4a]" />} title={t.gd_section_dashboard}>
          <Item title={t.gd_dashboard_title} desc={t.gd_dashboard_desc} />
          <Divider />
          <Item title={t.gd_ar_title} desc={t.gd_ar_desc} />
          <Divider />
          <Item title={t.gd_cfr_title} desc={t.gd_cfr_desc} />
          <Divider />
          <Item title={t.gd_sar_title} desc={t.gd_sar_desc} />
        </Section>

        {/* ── Export ── */}
        <Section icon={<Download size={16} className="text-[#1a6b4a]" />} title={t.gd_section_export}>
          <Item title={t.gd_export_title} desc={t.gd_export_desc} />
          <Divider />
          <Item title={t.gd_epicalc_title} desc={t.gd_epicalc_desc} />
        </Section>

        {/* ── Security ── */}
        <Section icon={<Shield size={16} className="text-[#1a6b4a]" />} title={t.gd_section_security}>
          <Item title={t.gd_encrypt_title} desc={t.gd_encrypt_desc} />
          <Divider />
          <Item title={t.gd_reset_title} desc={t.gd_reset_desc} badge="!" />
        </Section>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          EpiCalc Suite — EpiLog v1.1.1
        </p>
      </div>
    </div>
  );
}
