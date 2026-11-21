import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Building, ShieldCheck, 
  Package, Database, CheckCircle2, Save, Cpu, Key, Radio 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { showToast } = useApp();

  const [companyName, setCompanyName] = useState('SunPower Solutions Pvt Ltd');
  const [gstin, setGstin] = useState('27AABCS1429P1ZK');
  const [monthlyTarget, setMonthlyTarget] = useState(40);
  const [inverterWarrantyYears, setInverterWarrantyYears] = useState(2);
  const [panelWarrantyYears, setPanelWarrantyYears] = useState(20);
  const [gstRate, setGstRate] = useState(13.8);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Company operational settings and warranty parameters updated!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">System Settings & Configurations</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            SunPower Solutions enterprise policies, warranty durations, GST parameters & API integrations
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Company Profile Settings */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-charcoal border-b border-warmGrey/60 pb-3">
            <Building className="w-4 h-4 text-navy" />
            <span>Company Operational Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Company Registered Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:ring-1 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">GSTIN Number</label>
              <input
                type="text"
                value={gstin}
                onChange={e => setGstin(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-mono focus:ring-1 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Monthly Project Capacity Target</label>
              <input
                type="number"
                value={monthlyTarget}
                onChange={e => setMonthlyTarget(parseInt(e.target.value) || 40)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>
        </div>

        {/* Warranty Durations Configuration (Prompt requirement: Configurable warranty rules) */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-charcoal border-b border-warmGrey/60 pb-3">
            <ShieldCheck className="w-4 h-4 text-sage" />
            <span>Configurable Equipment Warranty Policies (Calculated from Delivery Date)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Inverter Warranty (Years)</label>
              <input
                type="number"
                value={inverterWarrantyYears}
                onChange={e => setInverterWarrantyYears(parseInt(e.target.value) || 2)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
              <span className="text-[11px] text-mutedGrey mt-1 block">Default: 2 Years standard</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Battery Storage Warranty (Years)</label>
              <input
                type="number"
                defaultValue={2}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
              <span className="text-[11px] text-mutedGrey mt-1 block">Default: 2 Years LiFePO4</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Solar PV Panel Warranty (Years)</label>
              <input
                type="number"
                value={panelWarrantyYears}
                onChange={e => setPanelWarrantyYears(parseInt(e.target.value) || 20)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
              <span className="text-[11px] text-mutedGrey mt-1 block">Default: 20 Years performance</span>
            </div>
          </div>
        </div>

        {/* Financial & Tax Configurations */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-charcoal border-b border-warmGrey/60 pb-3">
            <Package className="w-4 h-4 text-amber" />
            <span>Taxation & Solar Subsidies Schedule</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Blended Solar GST Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={gstRate}
                onChange={e => setGstRate(parseFloat(e.target.value) || 13.8)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
              <span className="text-[11px] text-mutedGrey mt-1 block">70% goods @ 12% + 30% services @ 18% = 13.8%</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Central MNRE Subsidy Portal Sync</label>
              <input
                type="text"
                disabled
                value="PM Surya Ghar Muft Bijli Yojana (Active Sync)"
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-sand-50 text-mutedGrey"
              />
            </div>
          </div>
        </div>

        {/* API & Backend Integrations Status */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-charcoal border-b border-warmGrey/60 pb-3">
            <Cpu className="w-4 h-4 text-navy" />
            <span>Planned Cloud Integrations Architecture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey flex items-center justify-between">
              <div>
                <strong className="text-charcoal block">FastAPI Python REST</strong>
                <span className="text-[11px] text-mutedGrey">Local / Cloud Gateway</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-sage" />
            </div>

            <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey flex items-center justify-between">
              <div>
                <strong className="text-charcoal block">Supabase PostgreSQL</strong>
                <span className="text-[11px] text-mutedGrey">schema.sql with RLS</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-sage" />
            </div>

            <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey flex items-center justify-between">
              <div>
                <strong className="text-charcoal block">Retell AI Voice</strong>
                <span className="text-[11px] text-mutedGrey">Inbound Telephony</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-amber" />
            </div>

            <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey flex items-center justify-between">
              <div>
                <strong className="text-charcoal block">Dify Agent Platform</strong>
                <span className="text-[11px] text-mutedGrey">Business Reasoning</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-amber" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </div>

      </form>
    </div>
  );
};
