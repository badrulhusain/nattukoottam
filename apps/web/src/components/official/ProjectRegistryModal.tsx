'use client';

import React, { useState } from 'react';
import { X, Building2, Calendar, MapPin, DollarSign, UserCheck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { createLiveProjectApi } from '../../lib/api';

interface Department {
  id: string;
  name: string;
  code: string;
  type: string;
}

interface ProjectRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
  departments: Department[];
  defaultLocality?: string;
  language?: 'ml' | 'en';
}

export const ProjectRegistryModal: React.FC<ProjectRegistryModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
  departments,
  defaultLocality = 'Kakkanad',
  language = 'ml',
}) => {
  const isMl = language === 'ml';

  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept_pwd_01');
  const [category, setCategory] = useState('ROAD_TRANSPORT');
  const [locality, setLocality] = useState(defaultLocality);
  const [district, setDistrict] = useState('Ernakulam');
  const [roadName, setRoadName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedEndDate, setExpectedEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [estimatedCost, setEstimatedCost] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage(isMl ? 'പദ്ധതിയുടെ പേര് നൽകുക' : 'Please provide project name');
      return;
    }
    if (!roadName.trim()) {
      setErrorMessage(isMl ? 'ബാധിക്കപ്പെടുന്ന റോഡിന്റെ പേര് നൽകുക' : 'Please provide road name');
      return;
    }
    if (!description.trim()) {
      setErrorMessage(isMl ? 'വിശദാംശങ്ങൾ നൽകുക' : 'Please enter work description');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        departmentId: departmentId || departments[0]?.id || 'dept_pwd_01',
        category,
        locality: locality.trim() || 'Kakkanad',
        district: district.trim() || 'Ernakulam',
        roadName: roadName.trim(),
        startDate: new Date(startDate).toISOString(),
        expectedEndDate: new Date(expectedEndDate).toISOString(),
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        contractorName: contractorName.trim() || undefined,
        description: description.trim(),
        latitude: 10.0159,
        longitude: 76.3419,
        radiusMeters: 250,
      };

      const result = await createLiveProjectApi(payload);
      onProjectCreated(result);
      onClose();
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setErrorMessage(err.message || 'Failed to register project in database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E4EBE6] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#14532D] to-[#15803D] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/20 rounded-xl">
              <Building2 className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="font-bold text-sm">
                {isMl ? 'പുതിയ അടിസ്ഥാനസൗകര്യ പദ്ധതി രജിസ്റ്റർ ചെയ്യുക' : 'Register Infrastructure Project'}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {isMl
                  ? 'റോഡ് കുഴിക്കൽ വൈരുദ്ധ്യം കണ്ടെത്താൻ ഡാറ്റാബേസിൽ രേഖപ്പെടുത്തുക'
                  : 'Enables auto-conflict detection for repeated road digging'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-1">
            <label className="font-bold text-[#17231D]">
              {isMl ? 'പദ്ധതിയുടെ പേര്' : 'Project Name'} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isMl ? 'ഉദാ: കാക്കനാട് ലിങ്ക് റോഡ് റീ-ടാറിംഗ് പ്രവൃത്തി' : 'e.g., Kakkanad Link Road Tarring & Resurfacing'}
              className="w-full px-3 py-2 rounded-xl border border-[#E4EBE6] focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] outline-none font-medium"
            />
          </div>

          {/* Department & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#17231D]">
                {isMl ? 'നിർവ്വഹണ വകുപ്പ്' : 'Department'} *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBE6] bg-white focus:border-[#16A34A] outline-none font-medium"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#17231D]">
                {isMl ? 'പ്രവൃത്തി വിഭാഗം' : 'Work Category'} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBE6] bg-white focus:border-[#16A34A] outline-none font-medium"
              >
                <option value="ROAD_TRANSPORT">{isMl ? 'റോഡ് നിർമ്മാണം / റീ-ടാറിംഗ് (PWD)' : 'Road Resurfacing / Transport'}</option>
                <option value="WATER_SUPPLY">{isMl ? 'കുടിവെള്ള പൈപ്പ്‌ലൈൻ പ്രവൃത്തി (KWA)' : 'Water Pipeline Work (KWA)'}</option>
                <option value="ELECTRICITY">{isMl ? 'വൈദ്യുതി കേബിളിംഗ് (KSEB)' : 'Electricity Cable Laying (KSEB)'}</option>
                <option value="DRAINAGE">{isMl ? 'ഓവുചാൽ നിർമ്മാണം (Drainage)' : 'Drainage Construction'}</option>
                <option value="WASTE_MANAGEMENT">{isMl ? 'മാലിന്യ സംസ്കരണ പ്ലാന്റ്' : 'Waste Management'}</option>
                <option value="OTHER">{isMl ? 'മറ്റ് പൊതുമരാമത്ത്' : 'Other Infrastructure'}</option>
              </select>
            </div>
          </div>

          {/* Road Name & Locality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#17231D]">
                {isMl ? 'ബാധിക്കപ്പെടുന്ന റോഡ് / പ്രദേശം' : 'Affected Road / Area'} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  placeholder={isMl ? 'ഉദാ: സീപോർട്ട്-എയർപോർട്ട് റോഡ്' : 'e.g., Seaport-Airport Road'}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E4EBE6] focus:border-[#16A34A] outline-none font-medium"
                />
                <MapPin className="w-4 h-4 text-[#718078] absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#17231D]">
                {isMl ? 'വാർഡ് / പ്രദേശം' : 'Locality / Ward'}
              </label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Kakkanad"
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBE6] focus:border-[#16A34A] outline-none font-medium"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#17231D]">
                {isMl ? 'തുടങ്ങുന്ന തീയതി' : 'Planned Start Date'} *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E4EBE6] focus:border-[#16A34A] outline-none font-medium"
                />
                <Calendar className="w-4 h-4 text-[#718078] absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#17231D]">
                {isMl ? 'പൂർത്തിയാകേണ്ട തീയതി' : 'Expected Completion Date'} *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={expectedEndDate}
                  onChange={(e) => setExpectedEndDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E4EBE6] focus:border-[#16A34A] outline-none font-medium"
                />
                <Calendar className="w-4 h-4 text-[#718078] absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Budget & Contractor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#17231D]">
                {isMl ? 'അനുവദിച്ച തുക (₹)' : 'Estimated Cost (₹)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="3500000"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E4EBE6] focus:border-[#16A34A] outline-none font-medium"
                />
                <DollarSign className="w-4 h-4 text-[#718078] absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#17231D]">
                {isMl ? 'കരാറുകാരൻ / ഏജൻസി' : 'Contractor / Agency'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  placeholder={isMl ? 'ഉദാ: KSCC ലിമിറ്റഡ്' : 'e.g., KSCC Ltd.'}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E4EBE6] focus:border-[#16A34A] outline-none font-medium"
                />
                <UserCheck className="w-4 h-4 text-[#718078] absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Work Description */}
          <div className="space-y-1">
            <label className="font-bold text-[#17231D]">
              {isMl ? 'പ്രവൃത്തിയുടെ വിവരണം' : 'Work Details & Scope'} *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isMl
                  ? 'പ്രവൃത്തിയുടെ പ്രധാന ഘട്ടങ്ങൾ, കുഴിക്കൽ ആഴം, ട്രാഫിക് ക്രമീകരണം...'
                  : 'Trenching depth, pipe diameter, bituminous macadam thickness, traffic plan...'
              }
              className="w-full px-3 py-2 rounded-xl border border-[#E4EBE6] focus:border-[#16A34A] outline-none font-medium resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E4EBE6]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#718078] hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              {isMl ? 'റദ്ദാക്കുക' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active-press"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isMl ? 'രജിസ്റ്റർ ചെയ്യുന്നു...' : 'Registering...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isMl ? 'പദ്ധതി രജിസ്റ്റർ ചെയ്യുക' : 'Register Project'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

