
import React, { useState, useRef } from 'react';
import { Participant, Country } from '../types';
import { ADMIN_PASSWORD, COUNTRY_LIST, getIdentityPlaceholder } from '../constants';
import { 
  Lock, Plus, Edit2, Trash2, X, Save, ShieldCheck, 
  Image as ImageIcon, CheckCircle2, Loader2, Download, 
  Table, FileSpreadsheet, AlertCircle, FileArchive, 
  UploadCloud, DatabaseZap, Camera, Trash, Info, 
  LayoutTemplate, History, FileUp, ArrowRight, Settings2,
  User, ImageUp, Sparkles, Scan
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../services/api';

interface ImportDetail {
  row: number;
  identifier: string;
  status: 'SUCCESS' | 'ERROR' | 'SKIPPED';
  reason?: string;
}

interface ColumnMapping {
  name: string;
  organization: string;
  title: string;
  country: string;
  bio: string;
  testimony: string;
  email: string;
  phone: string;
  website: string;
  photoUrl: string;
  promoPhotoUrl: string;
}

interface AdminConsoleProps {
  participants: Participant[];
  onAdd: (p: Omit<Participant, 'id'>) => Promise<void>;
  onUpdate: (id: string, p: Partial<Participant>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const AdminConsole: React.FC<AdminConsoleProps> = ({ participants, onAdd, onUpdate, onDelete }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Participant>>({});
  
  // Import States
  const [isImporting, setIsImporting] = useState(false);
  const [importLog, setImportLog] = useState<ImportDetail[]>([]);
  const [pendingData, setPendingData] = useState<any[] | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    name: '', organization: '', title: '', country: '', bio: '',
    testimony: '', email: '', phone: '', website: '', photoUrl: '', promoPhotoUrl: ''
  });

  const [isResetting, setIsResetting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingPromo, setIsUploadingPromo] = useState(false);
  
  // Drag states
  const [isDraggingProfile, setIsDraggingProfile] = useState(false);
  const [isDraggingPromo, setIsDraggingPromo] = useState(false);
  
  const importInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const promoPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsUnlocked(true);
    else alert('ACCESS DENIED: Credentials Invalid.');
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent, 
    type: 'profile' | 'promo'
  ) => {
    let file: File | undefined;
    
    if ('dataTransfer' in e) {
      e.preventDefault();
      file = e.dataTransfer.files[0];
    } else {
      file = e.target.files?.[0];
    }

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Invalid asset type. Please provide an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) return alert("Asset exceeds 2MB limit.");

    const setLoading = type === 'profile' ? setIsUploadingPhoto : setIsUploadingPromo;
    const field = type === 'profile' ? 'photoUrl' : 'promoPhotoUrl';

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      // Add a small artificial delay for visual feedback of the "scanning" state
      setTimeout(() => {
        setFormData(prev => ({ ...prev, [field]: evt.target?.result as string }));
        setLoading(false);
      }, 1000);
    };
    reader.readAsDataURL(file);
    
    // Reset drag states
    setIsDraggingProfile(false);
    setIsDraggingPromo(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
        
        if (json.length === 0) throw new Error("File is empty");
        
        const headers = Object.keys(json[0]);
        setFileHeaders(headers);
        setPendingData(json);
        
        // Auto-guess mapping
        const newMapping = { ...mapping };
        headers.forEach(h => {
          const lh = h.toLowerCase();
          if (lh.includes('name')) newMapping.name = h;
          if (lh.includes('org') || lh.includes('ministry')) newMapping.organization = h;
          if (lh.includes('title') || lh.includes('role')) newMapping.title = h;
          if (lh.includes('country') || lh.includes('hub')) newMapping.country = h;
          if (lh.includes('bio') || lh.includes('desc')) newMapping.bio = h;
          if (lh.includes('testimony') || lh.includes('quote')) newMapping.testimony = h;
          if (lh.includes('email')) newMapping.email = h;
          if (lh.includes('phone')) newMapping.phone = h;
          if (lh.includes('web')) newMapping.website = h;
          if (lh.includes('photo') || lh.includes('avatar')) newMapping.photoUrl = h;
          if (lh.includes('promo') || lh.includes('hero')) newMapping.promoPhotoUrl = h;
        });
        setMapping(newMapping);
      } catch (err) {
        alert("Parsing failed. Check file structure.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const executeImport = async () => {
    if (!pendingData) return;
    setIsImporting(true);
    setImportLog([]);

    const results: ImportDetail[] = [];
    for (let i = 0; i < pendingData.length; i++) {
      const row = pendingData[i];
      const name = mapping.name ? String(row[mapping.name] || '').trim() : '';
      const org = mapping.organization ? String(row[mapping.organization] || '').trim() : '';
      
      if (!name || !org) {
        results.push({ row: i + 2, identifier: name || 'Row ' + (i+2), status: 'SKIPPED', reason: 'Missing Name/Org mapping' });
        continue;
      }

      const countryName = mapping.country ? String(row[mapping.country] || '').trim() : 'Germany';
      const country = COUNTRY_LIST.find(c => c.name.toLowerCase() === countryName.toLowerCase() || c.code === countryName.toUpperCase()) || COUNTRY_LIST[0];

      try {
        await onAdd({
          name,
          organization: org,
          title: mapping.title ? String(row[mapping.title] || '') : 'Leader',
          country,
          bio: mapping.bio ? String(row[mapping.bio] || '') : '',
          testimony: mapping.testimony ? String(row[mapping.testimony] || '') : '',
          email: mapping.email ? String(row[mapping.email] || '') : '',
          phone: mapping.phone ? String(row[mapping.phone] || '') : '',
          website: mapping.website ? String(row[mapping.website] || '') : '',
          photoUrl: mapping.photoUrl ? String(row[mapping.photoUrl] || '') : '',
          promoPhotoUrl: mapping.promoPhotoUrl ? String(row[mapping.promoPhotoUrl] || '') : '',
        });
        results.push({ row: i + 2, identifier: name, status: 'SUCCESS' });
      } catch (err) {
        results.push({ row: i + 2, identifier: name, status: 'ERROR', reason: 'Sync Failure' });
      }
    }
    setImportLog(results);
    setPendingData(null);
    setIsImporting(false);
    alert(`Import session concluded. ${results.filter(r => r.status === 'SUCCESS').length} identity nodes established.`);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.country) return alert('Name and Hub Node required.');
    try {
      if (editingId) await onUpdate(editingId, formData);
      else await onAdd(formData as Omit<Participant, 'id'>);
      setFormData({}); setEditingId(null); setIsAdding(false);
    } catch { alert('Sync failure.'); }
  };

  const handleDragOver = (e: React.DragEvent, type: 'profile' | 'promo') => {
    e.preventDefault();
    if (type === 'profile') setIsDraggingProfile(true);
    else setIsDraggingPromo(true);
  };

  const handleDragLeave = (type: 'profile' | 'promo') => {
    if (type === 'profile') setIsDraggingProfile(false);
    else setIsDraggingPromo(false);
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-[#050505] border border-white/5 mt-10 animate-fade-in shadow-2xl rounded-sm">
        <Lock size={48} className="text-[#BB9446] mb-8" />
        <h2 className="text-xl font-bold uppercase tracking-[0.4em] text-white mb-10">Director Authorization</h2>
        <form onSubmit={handleLogin} className="flex flex-col items-center w-full max-w-xs space-y-6">
          <input type="password" placeholder="SECURE CODE" className="w-full bg-white/5 border border-white/10 p-4 text-center text-white focus:border-[#BB9446] outline-none font-mono" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full py-4 bg-[#BB9446] text-black font-extrabold uppercase tracking-widest hover:bg-white transition-all">Authorize Terminal</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-10 animate-fade-in space-y-12 pb-40">
      {/* Bootstrap Section */}
      <section className="bg-[#080808] border border-white/5 p-10 rounded-sm shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <FileSpreadsheet size={160} />
        </div>
        
        <div className="max-w-4xl relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <FileUp className="text-[#BB9446]" /> Core Database Bootstrap
              </h3>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] mt-2">Scale Identity Core via Batch Processing</p>
            </div>
          </div>

          {!pendingData ? (
            <div className="space-y-8">
              <p className="text-sm text-white/40 leading-relaxed max-w-2xl">
                Deploy leadership nodes in bulk. Upload your directory in <span className="text-white font-bold">.XLSX</span>, <span className="text-white font-bold">.XLS</span>, or <span className="text-white font-bold">.CSV</span> format. Our intelligent parser will assist in field alignment.
              </p>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => importInputRef.current?.click()}
                  className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#BB9446] transition-all flex items-center gap-4 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                >
                  <UploadCloud size={16} /> SELECT IDENTITY SOURCE
                </button>
                <input type="file" ref={importInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileSelect} />
                <button className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] hover:text-[#BB9446] transition-colors flex items-center gap-2 border border-white/5 px-4 py-2 hover:border-[#BB9446]/20">
                  <Download size={12} /> PROTOCOL TEMPLATE
                </button>
              </div>

              {importLog.length > 0 && (
                <div className="mt-12 p-6 bg-black/40 border border-white/10 rounded-sm">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[9px] font-black text-[#BB9446] uppercase tracking-[0.5em]">LATEST SYNC LOG</span>
                    <span className="text-[10px] font-bold text-white/40">{importLog.filter(l => l.status === 'SUCCESS').length} NODES VERIFIED</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                    {importLog.map((log, i) => (
                      <div key={i} className={`text-[10px] flex justify-between items-center py-2 border-b border-white/5 ${log.status === 'ERROR' ? 'text-red-500' : 'text-white/40'}`}>
                        <span className="font-mono opacity-50">#{(log.row).toString().padStart(3, '0')}</span>
                        <span className="flex-1 px-4 truncate font-bold uppercase">{log.identifier}</span>
                        <span className={`text-[8px] font-black tracking-widest ${log.status === 'SUCCESS' ? 'text-green-500' : 'text-red-900'}`}>{log.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-in space-y-10">
              <div className="p-6 bg-[#BB9446]/5 border border-[#BB9446]/20 rounded-sm">
                <h4 className="text-[11px] font-black text-[#BB9446] uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                  <Settings2 size={14} /> FIELD ALIGNMENT INTERFACE
                </h4>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-8">Align your spreadsheet headers with the Core Identity Schema</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                  {Object.keys(mapping).map((key) => (
                    <div key={key} className="space-y-2">
                      <label className="text-[8px] font-black text-white/20 uppercase tracking-widest flex items-center justify-between">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                        {['name', 'organization'].includes(key) && <span className="text-red-900">*</span>}
                      </label>
                      <select 
                        className="w-full bg-black/80 border border-white/10 p-3 text-[10px] text-white/70 font-bold uppercase outline-none focus:border-[#BB9446] transition-colors"
                        value={mapping[key as keyof ColumnMapping]}
                        onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                      >
                        <option value="">[ IGNORE FIELD ]</option>
                        {fileHeaders.map(h => <option key={h} value={h}>{h.toUpperCase()}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={executeImport}
                  className="px-12 py-5 bg-[#BB9446] text-black font-black uppercase tracking-[0.5em] text-[11px] hover:bg-white transition-all flex items-center gap-4"
                >
                  {isImporting ? <Loader2 size={16} className="animate-spin" /> : <DatabaseZap size={16} />} 
                  EXECUTE CORE SYNCHRONIZATION
                </button>
                <button 
                  onClick={() => setPendingData(null)}
                  className="px-8 py-5 border border-white/10 text-white/40 font-bold uppercase tracking-[0.4em] text-[10px] hover:text-white transition-all"
                >
                  ABORT
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Strategic Hub Control */}
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Core Ledger */}
        <div className="flex-1 bg-[#050505] border border-white/5 p-10 rounded-sm shadow-2xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.6em] flex items-center gap-3">
                <History size={16} className="text-[#BB9446]" /> IDENTITY CORE LEDGER
              </h3>
              <p className="text-[8px] text-white/20 uppercase tracking-[0.4em] mt-2">Active Registry Status: {participants.length} NODES</p>
            </div>
            <button 
              onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ country: COUNTRY_LIST[0] }); }}
              className="px-6 py-3 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-[0.3em] hover:text-[#BB9446] hover:border-[#BB9446]/40 transition-all"
            >
              MANUAL REGISTRATION +
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em] border-b border-white/5">
                  <th className="py-6">LEADER IDENTITY</th>
                  <th className="py-6">STRATEGIC HUB</th>
                  <th className="py-6 text-right">PROTOCOL ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {participants.map(p => (
                  <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-black border border-white/10 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all">
                          <img src={p.photoUrl || getIdentityPlaceholder(p.name)} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <div className="text-[12px] font-bold text-white uppercase tracking-wider group-hover:text-[#BB9446] transition-colors">{p.name}</div>
                          <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1">{p.organization}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                       <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-2">
                         {p.country.flag} {p.country.name}
                       </span>
                    </td>
                    <td className="py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setFormData(p); setEditingId(p.id); setIsAdding(false); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-3 text-white/10 hover:text-[#BB9446] transition-all hover:bg-white/5"><Edit2 size={16} /></button>
                        <button onClick={() => { if(confirm('Purge identity node from ledger?')) onDelete(p.id); }} className="p-3 text-white/10 hover:text-red-900 transition-all hover:bg-red-900/10"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tactical Editor Panel - MANUAL ENTRY */}
        {(isAdding || editingId) && (
          <div className="w-full lg:w-[500px] bg-[#080808] border border-[#BB9446]/30 p-10 rounded-sm animate-slide-right sticky top-12 h-fit shadow-[0_0_80px_rgba(187,148,70,0.15)]">
            <div className="flex justify-between items-center mb-12">
              <h4 className="text-[11px] font-black text-[#BB9446] uppercase tracking-[0.5em]">{editingId ? 'MODIFY NODE' : 'INITIALIZE NODE'}</h4>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }}><X size={24} className="text-white/20 hover:text-white" /></button>
            </div>

            <div className="space-y-8">
              {/* Image Studio Slots */}
              <div className="grid grid-cols-2 gap-6">
                {/* Portrait Slot */}
                <div className="space-y-3">
                  <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                    <User size={10} className="text-[#BB9446]" /> Identity Portrait
                  </label>
                  <div 
                    onDragOver={(e) => handleDragOver(e, 'profile')}
                    onDragLeave={() => handleDragLeave('profile')}
                    onDrop={(e) => handleFileUpload(e, 'profile')}
                    onClick={() => profilePhotoInputRef.current?.click()}
                    className={`
                      aspect-[3/4] bg-white/[0.02] border border-dashed rounded-sm transition-all duration-300 cursor-pointer overflow-hidden group/img relative flex flex-col items-center justify-center
                      ${isDraggingProfile ? 'border-[#BB9446] bg-[#BB9446]/10 scale-[1.02]' : 'border-white/10 hover:border-[#BB9446]/40'}
                    `}
                  >
                    {formData.photoUrl ? (
                      <>
                        <img src={formData.photoUrl} className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <ImageUp size={24} className="text-[#BB9446]" />
                          <span className="text-[7px] font-black uppercase tracking-widest text-white/60">Replace Portrait</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setFormData({...formData, photoUrl: ''}); }}
                          className="absolute top-2 right-2 p-1.5 bg-black/80 border border-white/10 text-white/40 hover:text-red-500 rounded-sm transition-colors z-10"
                        >
                          <Trash size={12} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-4 text-center">
                        <div className={`p-4 rounded-full bg-white/[0.02] border border-white/5 transition-all duration-500 ${isDraggingProfile ? 'bg-[#BB9446]/20 border-[#BB9446]/40 scale-110' : ''}`}>
                           <Camera size={24} className={`transition-colors ${isDraggingProfile ? 'text-[#BB9446]' : 'text-white/10 group-hover/img:text-[#BB9446]'}`} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] block">
                            {isDraggingProfile ? 'Release to Scan' : 'Identity Portrait'}
                          </span>
                          <span className="text-[6px] font-bold text-white/20 uppercase tracking-widest leading-tight block">Drag & Drop <br/>or Click</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Visual Scanning Feedback */}
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-4 z-20">
                        <div className="relative w-12 h-12">
                           <Loader2 size={48} className="animate-spin text-[#BB9446] opacity-20" />
                           <Scan size={24} className="absolute inset-0 m-auto text-[#BB9446] animate-pulse" />
                        </div>
                        <div className="text-center space-y-1">
                           <span className="text-[7px] text-white/60 font-black uppercase tracking-[0.4em] animate-pulse">Digitizing Portrait</span>
                           <div className="w-16 h-[2px] bg-white/5 mx-auto relative overflow-hidden">
                              <div className="absolute inset-0 bg-[#BB9446] animate-[shimmer_1.5s_infinite]" style={{width: '40%'}} />
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Promotional Picture Slot */}
                <div className="space-y-3">
                  <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Sparkles size={10} className="text-[#BB9446]" /> Promotional Picture
                  </label>
                  <div 
                    onDragOver={(e) => handleDragOver(e, 'promo')}
                    onDragLeave={() => handleDragLeave('promo')}
                    onDrop={(e) => handleFileUpload(e, 'promo')}
                    onClick={() => promoPhotoInputRef.current?.click()}
                    className={`
                      aspect-[3/4] bg-white/[0.02] border border-dashed rounded-sm transition-all duration-300 cursor-pointer overflow-hidden group/img relative flex flex-col items-center justify-center
                      ${isDraggingPromo ? 'border-[#BB9446] bg-[#BB9446]/10 scale-[1.02]' : 'border-white/10 hover:border-[#BB9446]/40'}
                    `}
                  >
                    {formData.promoPhotoUrl ? (
                      <>
                        <img src={formData.promoPhotoUrl} className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <ImageUp size={24} className="text-[#BB9446]" />
                          <span className="text-[7px] font-black uppercase tracking-widest text-white/60">Replace Promo</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setFormData({...formData, promoPhotoUrl: ''}); }}
                          className="absolute top-2 right-2 p-1.5 bg-black/80 border border-white/10 text-white/40 hover:text-red-500 rounded-sm transition-colors z-10"
                        >
                          <Trash size={12} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-4 text-center">
                        <div className={`p-4 rounded-full bg-white/[0.02] border border-white/5 transition-all duration-500 ${isDraggingPromo ? 'bg-[#BB9446]/20 border-[#BB9446]/40 scale-110' : ''}`}>
                          <ImageIcon size={24} className={`transition-colors ${isDraggingPromo ? 'text-[#BB9446]' : 'text-white/10 group-hover/img:text-[#BB9446]'}`} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] block">
                             {isDraggingPromo ? 'Upload Hub Asset' : 'Promo Picture'}
                          </span>
                          <span className="text-[6px] font-bold text-white/20 uppercase tracking-widest leading-tight block">Drag & Drop <br/>or Click</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Visual Scanning Feedback */}
                    {isUploadingPromo && (
                      <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-4 z-20">
                         <div className="relative w-12 h-12">
                           <Loader2 size={48} className="animate-spin text-[#BB9446] opacity-20" />
                           <Scan size={24} className="absolute inset-0 m-auto text-[#BB9446] animate-pulse" />
                        </div>
                        <div className="text-center space-y-1">
                           <span className="text-[7px] text-white/60 font-black uppercase tracking-[0.4em] animate-pulse">Syncing Promo Node</span>
                           <div className="w-16 h-[2px] bg-white/5 mx-auto relative overflow-hidden">
                              <div className="absolute inset-0 bg-[#BB9446] animate-[shimmer_1.5s_infinite]" style={{width: '40%'}} />
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <input type="file" ref={profilePhotoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'profile')} />
                <input type="file" ref={promoPhotoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'promo')} />
              </div>

              {/* Data Fields */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Full Identity Name</label>
                  <input placeholder="MATTHIAS GREVE" className="w-full bg-white/5 border border-white/10 p-4 text-white text-[11px] font-bold tracking-widest outline-none focus:border-[#BB9446] transition-all" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Organization Hub</label>
                  <input placeholder="ALPHA & OMEGA STIFTUNG" className="w-full bg-white/5 border border-white/10 p-4 text-white text-[11px] font-bold tracking-widest outline-none focus:border-[#BB9446] transition-all" value={formData.organization || ''} onChange={e => setFormData({...formData, organization: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Strategic Role</label>
                  <input placeholder="DIRECTOR OF PARTNERSHIPS" className="w-full bg-white/5 border border-white/10 p-4 text-white text-[11px] font-bold tracking-widest outline-none focus:border-[#BB9446] transition-all" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Geographic Deployment</label>
                  <select className="w-full bg-black border border-white/10 p-4 text-white text-[11px] font-bold tracking-widest outline-none focus:border-[#BB9446] transition-all" value={formData.country?.code || ''} onChange={e => setFormData({...formData, country: COUNTRY_LIST.find(c => c.code === e.target.value)})}>
                    {COUNTRY_LIST.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              
              <button onClick={handleSave} className="w-full py-6 bg-[#BB9446] text-black font-black uppercase tracking-[0.5em] text-[11px] hover:bg-white transition-all shadow-xl flex items-center justify-center gap-3">
                <Save size={18} /> SYNCHRONIZE IDENTITY NODE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Core Purge Access */}
      <div className="pt-24 border-t border-white/5 flex flex-col items-center pb-20">
        <div className="flex items-center gap-3 text-red-900/40 text-[9px] font-black tracking-[0.6em] uppercase mb-8">
           <AlertCircle size={14} /> Security Protocol: Total Purge Restricted
        </div>
        <button 
          disabled={isResetting} 
          onClick={async () => { if(confirm('INITIATE TOTAL DATA PURGE? This action is irreversible and will erase the entire identity core.')) { setIsResetting(true); await api.resetData(); window.location.reload(); }}} 
          className="px-12 py-4 border border-red-900/20 text-red-900/30 text-[10px] font-black uppercase tracking-[0.5em] hover:bg-red-900 hover:text-white hover:border-red-900 transition-all flex items-center gap-4 group"
        >
          {isResetting ? <Loader2 className="animate-spin" size={12} /> : <DatabaseZap size={16} className="group-hover:scale-125 transition-transform" />} 
          EXECUTE FACTORY RESET
        </button>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default AdminConsole;
