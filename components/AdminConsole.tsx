
import React, { useState, useRef, useEffect } from 'react';
import { Participant, Country } from '../types';
import { ADMIN_PASSWORD, COUNTRY_LIST, getIdentityPlaceholder } from '../constants';
import { 
  Lock, Edit2, Trash2, X, ShieldCheck, 
  Image as ImageIcon, UploadCloud, Camera, History, Globe, 
  Link as LinkIcon, Mail, Phone, AlignLeft, AlertCircle,
  Upload, Trash, RefreshCw, Loader2
} from 'lucide-react';

interface AdminConsoleProps {
  participants: Participant[];
  onAdd: (p: Omit<Participant, 'id'>) => Promise<void>;
  onUpdate: (id: string, p: Partial<Participant>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isAuthorized: boolean;
  onAuthorize: (v: boolean) => void;
  editingId: string | null;
  onSetEditingId: (id: string | null) => void;
}

const AdminConsole: React.FC<AdminConsoleProps> = ({ 
  participants, onAdd, onUpdate, onDelete, 
  isAuthorized, onAuthorize, editingId, onSetEditingId 
}) => {
  const [password, setPassword] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Participant>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});
  
  const importInputRef = useRef<HTMLInputElement>(null);
  const profileFileRef = useRef<HTMLInputElement>(null);
  const promoFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) {
      const p = participants.find(part => part.id === editingId);
      if (p) {
        setFormData(p);
        setErrors({});
      }
    }
  }, [editingId, participants]);

  const validateImageUrl = (url: string): boolean => {
    if (!url) return true;
    if (url.startsWith('data:image/')) return true;
    const imageRegex = /\.(jpeg|jpg|gif|png|webp|svg|avif)(\?.*)?$/i;
    const isUnsplash = url.includes('images.unsplash.com');
    const isValidProtocol = url.startsWith('http://') || url.startsWith('https://');
    return isValidProtocol && (imageRegex.test(url) || isUnsplash);
  };

  const handleUrlChange = (field: 'photoUrl' | 'promoPhotoUrl', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (value && !validateImageUrl(value)) {
      setErrors(prev => ({ ...prev, [field]: 'Protocol mismatch or invalid image format' }));
    } else {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const processFile = (file: File, field: 'photoUrl' | 'promoPhotoUrl') => {
    if (!file.type.startsWith('image/')) {
      return alert('Please upload an image file.');
    }

    setIsUploading(prev => ({ ...prev, [field]: true }));

    const reader = new FileReader();
    reader.onload = (event) => {
      // Simulate slight delay for visual feedback of "uploading"
      setTimeout(() => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({ ...prev, [field]: base64 }));
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
        setIsUploading(prev => ({ ...prev, [field]: false }));
      }, 600);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'promoPhotoUrl') => {
    const file = e.target.files?.[0];
    if (file) processFile(file, field);
  };

  const handleDrag = (e: React.DragEvent, field: string, isActive: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [field]: isActive }));
  };

  const handleDrop = (e: React.DragEvent, field: 'photoUrl' | 'promoPhotoUrl') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [field]: false }));
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file, field);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) onAuthorize(true);
    else alert('ACCESS DENIED.');
  };

  const handleSave = async () => {
    if (!formData.name || !formData.country || !formData.nationality) {
      return alert('Required: Name, Residency, and Nationality.');
    }
    
    if (Object.keys(errors).length > 0) {
      return alert('Correct visual identity errors before syncing.');
    }

    try {
      if (editingId) await onUpdate(editingId, formData);
      else await onAdd(formData as Omit<Participant, 'id'>);
      setFormData({}); onSetEditingId(null); setIsAdding(false);
      setErrors({});
    } catch { alert('Sync failure.'); }
  };

  const selectCountry = (field: 'country' | 'nationality', code: string) => {
    const country = COUNTRY_LIST.find(c => c.code === code);
    if (country) setFormData(prev => ({ ...prev, [field]: country }));
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white/5 dark:bg-stone-50 border border-white/10 dark:border-stone-200 rounded-card shadow-card animate-fade-in mt-10">
        <Lock size={40} className="text-brand-heaven-gold mb-6" />
        <h2 className="text-lg font-avenir-bold uppercase text-white dark:text-black mb-8">Authorization Required</h2>
        <form onSubmit={handleLogin} className="flex flex-col items-center w-full max-w-xs space-y-4">
          <input 
            type="password" 
            placeholder="SECURE CODE" 
            className="w-full bg-black/40 dark:bg-white border border-white/10 dark:border-stone-200 p-4 rounded-button text-center outline-none focus:border-brand-heaven-gold" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button className="w-full py-4 bg-brand-heaven-gold text-white font-avenir-bold uppercase rounded-button hover:brightness-110 transition-all">Authorize</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-10 animate-fade-in space-y-10 pb-24">
      <section className="bg-white/5 dark:bg-stone-50 border border-white/10 dark:border-stone-200 p-8 rounded-card">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-avenir-bold text-white dark:text-black uppercase">Batch Import</h3>
            <p className="text-[10px] font-avenir-roman text-white/40 dark:text-stone-400 mt-1 uppercase">Deploy multiple nodes simultaneously</p>
          </div>
          <button 
            onClick={() => importInputRef.current?.click()} 
            className="px-6 py-3 bg-brand-heaven-gold text-white text-[10px] font-avenir-bold uppercase rounded-button flex items-center gap-2"
          >
            <UploadCloud size={14} /> Select Source
          </button>
          <input type="file" ref={importInputRef} className="hidden" accept=".xlsx, .csv" />
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 bg-white/5 dark:bg-stone-50 border border-white/10 dark:border-stone-200 p-8 rounded-card h-fit">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-avenir-bold text-white dark:text-black uppercase flex items-center gap-2">
              <History size={16} className="text-brand-heaven-gold" /> Identity Ledger
            </h3>
            <button 
              onClick={() => { 
                setIsAdding(true); 
                onSetEditingId(null); 
                setFormData({ 
                  country: COUNTRY_LIST[0], 
                  nationality: COUNTRY_LIST[0] 
                }); 
                setErrors({});
              }} 
              className="text-[10px] font-avenir-bold text-brand-heaven-gold uppercase"
            >
              Manual +
            </button>
          </div>
          <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar">
            {participants.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-black/20 dark:bg-white border border-white/5 dark:border-stone-200 rounded-card">
                <div className="flex items-center gap-4">
                  <img src={p.photoUrl || getIdentityPlaceholder(p.name)} className="w-10 h-10 rounded-full object-cover border border-brand-heaven-gold/20" />
                  <div>
                    <div className="text-[12px] font-avenir-bold text-white dark:text-black uppercase">{p.name}</div>
                    <div className="text-[10px] font-avenir-roman text-white/30 dark:text-stone-400 uppercase">
                      {p.country.code} {p.country.code !== p.nationality.code && `• Origin ${p.nationality.code}`}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onSetEditingId(p.id)} className="p-2 text-white/20 dark:text-stone-300 hover:text-brand-heaven-gold transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => onDelete(p.id)} className="p-2 text-white/20 dark:text-stone-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(isAdding || editingId) && (
          <div className="w-full lg:w-[600px] bg-black dark:bg-white border border-brand-heaven-gold/40 p-8 rounded-card shadow-modal h-fit">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-[11px] font-avenir-bold text-brand-heaven-gold uppercase">{editingId ? 'Modify Node' : 'Initialize Node'}</h4>
              <button onClick={() => { setIsAdding(false); onSetEditingId(null); setErrors({}); }}><X size={20} className="text-white/20 dark:text-stone-400" /></button>
            </div>
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-avenir-medium text-white/20 dark:text-stone-400 uppercase">Residency</label>
                    <select 
                      className="w-full bg-white/5 dark:bg-stone-50 border border-white/10 dark:border-stone-200 p-2 rounded-button text-[11px] text-white dark:text-black"
                      value={formData.country?.code || ''}
                      onChange={(e) => selectCountry('country', e.target.value)}
                    >
                      {COUNTRY_LIST.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-avenir-medium text-white/20 dark:text-stone-400 uppercase">Nationality</label>
                    <select 
                      className="w-full bg-white/5 dark:bg-stone-50 border border-white/10 dark:border-stone-200 p-2 rounded-button text-[11px] text-white dark:text-black"
                      value={formData.nationality?.code || ''}
                      onChange={(e) => selectCountry('nationality', e.target.value)}
                    >
                      {COUNTRY_LIST.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-avenir-medium text-white/20 dark:text-stone-400 uppercase">Full Name</label>
                  <input 
                    className="w-full bg-white/5 dark:bg-stone-50 border border-white/10 dark:border-stone-200 p-3 rounded-button text-[12px] text-white dark:text-black outline-none focus:border-brand-heaven-gold transition-all" 
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-avenir-medium text-white/20 dark:text-stone-400 uppercase">Organization</label>
                    <input 
                      className="w-full bg-white/5 dark:bg-stone-50 border border-white/10 dark:border-stone-200 p-3 rounded-button text-[12px] text-white dark:text-black outline-none focus:border-brand-heaven-gold transition-all" 
                      value={formData.organization || ''} 
                      onChange={e => setFormData({...formData, organization: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-avenir-medium text-white/20 dark:text-stone-400 uppercase">Title / Role</label>
                    <input 
                      className="w-full bg-white/5 dark:bg-stone-50 border border-white/10 dark:border-stone-200 p-3 rounded-button text-[12px] text-white dark:text-black outline-none focus:border-brand-heaven-gold transition-all" 
                      value={formData.title || ''} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Visual Identity Section */}
              <div className="space-y-6 pt-4 border-t border-white/5 dark:border-stone-100">
                <h5 className="text-[10px] font-avenir-bold text-brand-heaven-gold uppercase flex items-center gap-2">
                  <ImageIcon size={14} /> Visual Assets
                </h5>
                
                <div className="space-y-8">
                  {/* Profile Image Node */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-avenir-medium text-white/20 dark:text-stone-400 uppercase">Profile Core</label>
                      {errors.photoUrl && <span className="text-brand-heaven-gold text-[8px] animate-pulse uppercase"><AlertCircle size={8} className="inline mr-1 mb-0.5" />Error</span>}
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div 
                        onDragOver={(e) => handleDrag(e, 'photoUrl', true)}
                        onDragLeave={(e) => handleDrag(e, 'photoUrl', false)}
                        onDrop={(e) => handleDrop(e, 'photoUrl')}
                        className={`relative group w-32 h-32 rounded-full border-2 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden bg-white/5 dark:bg-stone-50 cursor-pointer
                          ${dragActive.photoUrl ? 'border-brand-heaven-gold bg-brand-heaven-gold/10 scale-105' : 'border-white/10 dark:border-stone-200'}
                          ${isUploading.photoUrl ? 'opacity-50' : 'opacity-100'}
                        `}
                        onClick={() => profileFileRef.current?.click()}
                      >
                        {formData.photoUrl ? (
                          <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div className="text-center p-2">
                            <Camera size={24} className="text-white/20 dark:text-stone-300 mx-auto mb-1" />
                            <span className="text-[7px] text-white/30 dark:text-stone-400 uppercase tracking-widest block">Drop Photo</span>
                          </div>
                        )}
                        
                        {isUploading.photoUrl && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 size={20} className="text-brand-heaven-gold animate-spin" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload size={20} className="text-white" />
                        </div>

                        {formData.photoUrl && !isUploading.photoUrl && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setFormData({...formData, photoUrl: ''}); }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg z-30"
                          >
                            <Trash size={10} />
                          </button>
                        )}
                      </div>

                      <div className="flex-1 w-full space-y-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-avenir-bold text-white/20 dark:text-stone-400 uppercase flex items-center gap-1">
                            <LinkIcon size={10} /> Remote Node Link
                          </label>
                          <input 
                            placeholder="https://..."
                            className={`w-full bg-white/5 dark:bg-stone-50 border ${errors.photoUrl ? 'border-brand-heaven-gold/50' : 'border-white/10 dark:border-stone-200'} p-2.5 rounded-button text-[11px] text-white dark:text-black outline-none focus:border-brand-heaven-gold transition-all`} 
                            value={formData.photoUrl?.startsWith('data:') ? '' : (formData.photoUrl || '')} 
                            onChange={e => handleUrlChange('photoUrl', e.target.value)}
                            disabled={isUploading.photoUrl}
                          />
                          {formData.photoUrl?.startsWith('data:') && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-brand-heaven-gold font-avenir-bold uppercase flex items-center gap-1">
                                <ShieldCheck size={10} /> Local Asset Encrypted
                              </span>
                            </div>
                          )}
                        </div>
                        <input type="file" ref={profileFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'photoUrl')} />
                      </div>
                    </div>
                  </div>

                  {/* Promotional Image Node */}
                  <div className="space-y-3 pt-6 border-t border-white/5 dark:border-stone-50">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-avenir-medium text-white/20 dark:text-stone-400 uppercase">Promotional Asset</label>
                      {errors.promoPhotoUrl && <span className="text-brand-heaven-gold text-[8px] animate-pulse uppercase"><AlertCircle size={8} className="inline mr-1 mb-0.5" />Error</span>}
                    </div>

                    <div className="flex flex-col md:row gap-6 items-start">
                      <div 
                        onDragOver={(e) => handleDrag(e, 'promoPhotoUrl', true)}
                        onDragLeave={(e) => handleDrag(e, 'promoPhotoUrl', false)}
                        onDrop={(e) => handleDrop(e, 'promoPhotoUrl')}
                        className={`relative group w-full md:w-48 h-28 rounded-card border-2 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden bg-white/5 dark:bg-stone-50 cursor-pointer
                          ${dragActive.promoPhotoUrl ? 'border-brand-heaven-gold bg-brand-heaven-gold/10 scale-[1.02]' : 'border-white/10 dark:border-stone-200'}
                          ${isUploading.promoPhotoUrl ? 'opacity-50' : 'opacity-100'}
                        `}
                        onClick={() => promoFileRef.current?.click()}
                      >
                        {formData.promoPhotoUrl ? (
                          <img src={formData.promoPhotoUrl} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon size={24} className="text-white/20 dark:text-stone-300 mx-auto mb-1" />
                            <span className="text-[8px] text-white/30 dark:text-stone-400 uppercase tracking-widest block">Drop Event Asset</span>
                          </div>
                        )}

                        {isUploading.promoPhotoUrl && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 size={20} className="text-brand-heaven-gold animate-spin" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload size={20} className="text-white" />
                        </div>

                        {formData.promoPhotoUrl && !isUploading.promoPhotoUrl && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setFormData({...formData, promoPhotoUrl: ''}); }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg z-30"
                          >
                            <Trash size={10} />
                          </button>
                        )}
                      </div>

                      <div className="flex-1 w-full space-y-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-avenir-bold text-white/20 dark:text-stone-400 uppercase flex items-center gap-1">
                            <LinkIcon size={10} /> Remote Asset Link
                          </label>
                          <input 
                            placeholder="https://..."
                            className={`w-full bg-white/5 dark:bg-stone-50 border ${errors.promoPhotoUrl ? 'border-brand-heaven-gold/50' : 'border-white/10 dark:border-stone-200'} p-2.5 rounded-button text-[11px] text-white dark:text-black outline-none focus:border-brand-heaven-gold transition-all`} 
                            value={formData.promoPhotoUrl?.startsWith('data:') ? '' : (formData.promoPhotoUrl || '')} 
                            onChange={e => handleUrlChange('promoPhotoUrl', e.target.value)}
                            disabled={isUploading.promoPhotoUrl}
                          />
                        </div>
                        <input type="file" ref={promoFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'promoPhotoUrl')} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4 pt-4 border-t border-white/5 dark:border-stone-100">
                <h5 className="text-[10px] font-avenir-bold text-brand-heaven-gold uppercase flex items-center gap-2">
                  <AlignLeft size={14} /> Profile Narrative
                </h5>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-avenir-medium text-white/20 dark:text-stone-400 uppercase">Testimony / Bio</label>
                    <textarea 
                      className="w-full bg-white/5 dark:bg-stone-50 border border-white/10 dark:border-stone-200 p-3 rounded-button text-[12px] text-white dark:text-black outline-none focus:border-brand-heaven-gold transition-all min-h-[80px]" 
                      value={formData.testimony || ''} 
                      onChange={e => setFormData({...formData, testimony: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-avenir-medium text-white/20 dark:text-stone-400 uppercase">Secure Email</label>
                      <input 
                        type="email"
                        className="w-full bg-white/5 dark:bg-stone-50 border border-white/10 dark:border-stone-200 p-3 rounded-button text-[12px] text-white dark:text-black outline-none focus:border-brand-heaven-gold transition-all" 
                        value={formData.email || ''} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-avenir-medium text-white/20 dark:text-stone-400 uppercase">Phone Line</label>
                      <input 
                        type="tel"
                        className="w-full bg-white/5 dark:bg-stone-50 border border-white/10 dark:border-stone-200 p-3 rounded-button text-[12px] text-white dark:text-black outline-none focus:border-brand-heaven-gold transition-all" 
                        value={formData.phone || ''} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-avenir-medium text-white/20 dark:text-stone-400 uppercase">Web Hub</label>
                    <input 
                      className="w-full bg-white/5 dark:bg-stone-50 border border-white/10 dark:border-stone-200 p-3 rounded-button text-[12px] text-white dark:text-black outline-none focus:border-brand-heaven-gold transition-all" 
                      value={formData.website || ''} 
                      onChange={e => setFormData({...formData, website: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <button onClick={handleSave} className="w-full py-5 bg-brand-heaven-gold text-white font-avenir-bold uppercase rounded-button hover:brightness-110 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2">
                <RefreshCw size={16} /> Sync Node Identity
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConsole;
