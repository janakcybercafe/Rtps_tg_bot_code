import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit3, X, Check } from 'lucide-react';
import { RtpsCategory, RtpsService } from '../bot/rtpsData';

interface ServiceDirectoryViewProps {
  categories: RtpsCategory[];
  services: RtpsService[];
  onAddService: (service: RtpsService) => void;
  onUpdateService: (service: RtpsService) => void;
  onDeleteService: (serviceId: string) => void;
}

export const ServiceDirectoryView: React.FC<ServiceDirectoryViewProps> = ({
  categories,
  services,
  onAddService,
  onUpdateService,
  onDeleteService
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'general_cert');
  const [buttonLabel, setButtonLabel] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [docsText, setDocsText] = useState('');
  const [verificationsText, setVerificationsText] = useState('');
  const [timelineDays, setTimelineDays] = useState('10 Working Days');
  const [issuingAuthority, setIssuingAuthority] = useState('Revenue Officer (RO) / CO');
  const [portalName, setPortalName] = useState('serviceonline.bihar.gov.in');
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setHindiName('');
    setCategory(categories[0]?.id || 'general_cert');
    setButtonLabel('');
    setKeywordsText('');
    setDocsText('');
    setVerificationsText('');
    setTimelineDays('10 Working Days');
    setIssuingAuthority('Revenue Officer (RO) / Circle Officer (CO)');
    setPortalName('serviceonline.bihar.gov.in');
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (srv: RtpsService) => {
    setEditingId(srv.id);
    setName(srv.name);
    setHindiName(srv.hindiName);
    setCategory(srv.category);
    setButtonLabel(srv.buttonLabel);
    setKeywordsText(srv.keywords.join(', '));
    setDocsText(srv.documentsRequired.join('\n'));
    setVerificationsText(srv.verificationsRequired.join('\n'));
    setTimelineDays(srv.timelineDays);
    setIssuingAuthority(srv.issuingAuthority);
    setPortalName(srv.portalName);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanHindi = hindiName.trim();
    const cleanBtn = buttonLabel.trim() || `📄 ${cleanName}`;
    const docs = docsText
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);
    const vers = verificationsText
      .split('\n')
      .map((v) => v.trim())
      .filter(Boolean);

    if (!cleanName) {
      setFormError('Service English Name is required.');
      return;
    }
    if (docs.length === 0) {
      setFormError('Please enter at least one Required Document (one per line).');
      return;
    }
    if (vers.length === 0) {
      setFormError('Please enter at least one Verification Step (one per line).');
      return;
    }

    const keywords = keywordsText
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    if (!keywords.includes(cleanName.toLowerCase())) {
      keywords.unshift(cleanName.toLowerCase());
    }

    const newService: RtpsService = {
      id: editingId || `custom_${Date.now()}`,
      code: editingId
        ? services.find((s) => s.id === editingId)?.code || 'RTPS-CUST-01'
        : `RTPS-CUST-${String(services.length + 1).padStart(2, '0')}`,
      name: cleanName,
      hindiName: cleanHindi || cleanName,
      category,
      buttonLabel: cleanBtn,
      keywords,
      documentsRequired: docs,
      verificationsRequired: vers,
      timelineDays: timelineDays.trim() || '10 Working Days',
      issuingAuthority: issuingAuthority.trim() || 'Concerned RTPS Authority',
      govtFee: '₹0 (Free on Official Portal)',
      portalName: portalName.trim() || 'serviceonline.bihar.gov.in',
      importantNotes: []
    };

    if (editingId) {
      onUpdateService(newService);
    } else {
      onAddService(newService);
    }
    setIsFormOpen(false);
  };

  const filteredServices = services.filter((srv) => {
    const matchesCat =
      selectedCategory === 'all' || srv.category === selectedCategory;
    if (!matchesCat) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      srv.name.toLowerCase().includes(q) ||
      srv.hindiName.toLowerCase().includes(q) ||
      srv.code.toLowerCase().includes(q) ||
      srv.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Filter & Action Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Categories ({services.length})
          </button>
          {categories.map((cat) => {
            const count = services.filter((s) => s.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.shortTitle} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search service or keyword..."
              aria-label="Search RTPS services"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add RTPS Service</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Service Inline Drawer */}
      {isFormOpen && (
        <form
          onSubmit={handleSaveService}
          className="bg-white border border-slate-300 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit RTPS Service' : 'Add New RTPS Service to Bot'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              aria-label="Close service form"
              className="p-1 text-slate-400 hover:text-slate-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-800"
            >
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="srv-name"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Service Name (English) *
              </label>
              <input
                id="srv-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marriage Certificate"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label
                htmlFor="srv-hindi"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Hindi Name (हिंदी नाम)
              </label>
              <input
                id="srv-hindi"
                type="text"
                value={hindiName}
                onChange={(e) => setHindiName(e.target.value)}
                placeholder="e.g. विवाह प्रमाण पत्र"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label
                htmlFor="srv-cat"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Bot Menu Category
              </label>
              <select
                id="srv-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="srv-btn"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Keyboard Button Label (Under Typing Bar)
              </label>
              <input
                id="srv-btn"
                type="text"
                value={buttonLabel}
                onChange={(e) => setButtonLabel(e.target.value)}
                placeholder="e.g. 💍 Marriage Certificate"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label
                htmlFor="srv-keywords"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Search Keywords (comma-separated)
              </label>
              <input
                id="srv-keywords"
                type="text"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                placeholder="marriage certificate, vivah praman patra"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label
                htmlFor="srv-timeline"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Official RTPS Timeline
              </label>
              <input
                id="srv-timeline"
                type="text"
                value={timelineDays}
                onChange={(e) => setTimelineDays(e.target.value)}
                placeholder="10 Working Days"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="srv-docs"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Required Documents (One document per line) *
              </label>
              <textarea
                id="srv-docs"
                rows={4}
                value={docsText}
                onChange={(e) => setDocsText(e.target.value)}
                placeholder={
                  'Bride & Groom Aadhaar Cards\nMarriage Invitation Card / Priest Certificate\nJoint Photograph'
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label
                htmlFor="srv-vers"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Verification Steps (One step per line) *
              </label>
              <textarea
                id="srv-vers"
                rows={4}
                value={verificationsText}
                onChange={(e) => setVerificationsText(e.target.value)}
                placeholder={
                  'Step 1 — Online portal registration\nStep 2 — Ward Member / Panchayat Secretary verification\nStep 3 — Registrar digital approval'
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg inline-flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Service & Sync Bot</span>
            </button>
          </div>
        </form>
      )}

      {/* High-Density Service Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filteredServices.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm font-medium text-slate-700">
              No RTPS services match your current filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Service & Keyboard Button</th>
                  <th className="py-3 px-4">Category & Triggers</th>
                  <th className="py-3 px-4">Required Documents</th>
                  <th className="py-3 px-4">Verification Flow</th>
                  <th className="py-3 px-4 text-right">Timeline & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredServices.map((srv) => {
                  const catObj = categories.find((c) => c.id === srv.category);
                  return (
                    <tr
                      key={srv.id}
                      className="hover:bg-slate-50/80 transition-colors align-top"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {srv.name}
                        </div>
                        <div className="text-slate-600 mt-0.5">{srv.hindiName}</div>
                        <div className="mt-1.5 font-mono text-[11px] text-sky-800">
                          Button: {srv.buttonLabel}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">
                          {catObj?.shortTitle || srv.category}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px] mt-1">
                          {srv.keywords.slice(0, 4).join(' · ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <ul className="space-y-1 text-slate-700">
                          {srv.documentsRequired.slice(0, 3).map((d, i) => (
                            <li key={i} className="truncate" title={d}>
                              • {d}
                            </li>
                          ))}
                          {srv.documentsRequired.length > 3 && (
                            <li className="text-slate-400 font-mono text-[11px]">
                              +{srv.documentsRequired.length - 3} more documents
                            </li>
                          )}
                        </ul>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <ul className="space-y-1 text-slate-700">
                          {srv.verificationsRequired.slice(0, 2).map((v, i) => (
                            <li key={i} className="truncate" title={v}>
                              • {v}
                            </li>
                          ))}
                          {srv.verificationsRequired.length > 2 && (
                            <li className="text-slate-400 font-mono text-[11px]">
                              +{srv.verificationsRequired.length - 2} more steps
                            </li>
                          )}
                        </ul>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-mono text-slate-800 tabular-nums">
                          {srv.timelineDays}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {srv.code}
                        </div>
                        <div className="mt-2 inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(srv)}
                            aria-label={`Edit ${srv.name}`}
                            className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteService(srv.id)}
                            aria-label={`Delete ${srv.name}`}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
