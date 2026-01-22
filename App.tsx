
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import ParticipantCard from './components/ParticipantCard';
import ProfileModal from './components/ProfileModal';
import AdminConsole from './components/AdminConsole';
import { Participant, ViewMode, Country } from './types';
import { api } from './services/api';
import { COUNTRY_LIST } from './constants';
import { Search, ShieldCheck, Users, Loader2, LayoutGrid, Moon, Sun, Globe, Building, Briefcase } from 'lucide-react';

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ls_theme');
    return saved ? saved === 'dark' : false;
  });
  
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  const [filterCountryCode, setFilterCountryCode] = useState<string>('ALL');
  const [filterMinistry, setFilterMinistry] = useState<string>('ALL');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ls_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ls_theme', 'light');
    }
  }, [darkMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getParticipants();
      setParticipants(data);
    } catch (err) {
      console.error('Core Offline');
    } finally {
      setLoading(false);
    }
  };

  const activeCountries = useMemo(() => {
    const codesInUse = new Set(participants.map(p => p.country.code));
    return COUNTRY_LIST.filter(c => codesInUse.has(c.code));
  }, [participants]);

  const uniqueMinistries = useMemo(() => Array.from(new Set(participants.map(p => p.organization))).sort(), [participants]);
  const uniqueRoles = useMemo(() => Array.from(new Set(participants.map(p => p.title))).sort(), [participants]);

  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) || p.organization.toLowerCase().includes(q) || p.title.toLowerCase().includes(q);
      const matchesCountry = filterCountryCode === 'ALL' || p.country.code === filterCountryCode;
      const matchesMinistry = filterMinistry === 'ALL' || p.organization === filterMinistry;
      const matchesRole = filterRole === 'ALL' || p.title === filterRole;
      return matchesSearch && matchesCountry && matchesMinistry && matchesRole;
    });
  }, [participants, searchQuery, filterCountryCode, filterMinistry, filterRole]);

  const handleAdd = async (p: Omit<Participant, 'id'>) => {
    const fresh = await api.addParticipant(p);
    setParticipants(prev => [...prev, fresh]);
  };

  const handleUpdate = async (id: string, updates: Partial<Participant>) => {
    const updated = await api.updateParticipant(id, updates);
    setParticipants(prev => prev.map(p => p.id === id ? updated : p));
  };

  const handleDelete = async (id: string) => {
    await api.deleteParticipant(id);
    setParticipants(prev => prev.filter(p => p.id !== id));
    if (selectedParticipant?.id === id) setSelectedParticipant(null);
  };

  return (
    <div className="min-h-screen transition-colors duration-500 bg-black dark:bg-white">
      <Header />

      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-10 right-10 z-[100] w-14 h-14 bg-white/10 dark:bg-black/5 backdrop-blur-lg border border-white/20 dark:border-black/10 rounded-full flex items-center justify-center shadow-modal hover:scale-110 active:scale-95 transition-all text-brand-heaven-gold"
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <main className="max-w-[1400px] mx-auto px-8 py-20">
        <div className="flex flex-col gap-16 mb-20">
          <div className="flex flex-col xl:flex-row justify-between items-center gap-10 border-b border-white/10 dark:border-black/5 pb-10">
            <div className="flex gap-10">
              <button 
                onClick={() => setViewMode('directory')}
                className={`text-[11px] font-avenir-bold uppercase flex items-center gap-3 transition-all pb-2 border-b-2 ${viewMode === 'directory' ? 'text-brand-heaven-gold border-brand-heaven-gold' : 'text-white/40 dark:text-black/40 border-transparent'}`}
              >
                <LayoutGrid size={16} /> Directory
              </button>
              <button 
                onClick={() => setViewMode('admin')}
                className={`text-[11px] font-avenir-bold uppercase flex items-center gap-3 transition-all pb-2 border-b-2 ${viewMode === 'admin' ? 'text-brand-heaven-gold border-brand-heaven-gold' : 'text-white/40 dark:text-black/40 border-transparent'}`}
              >
                <ShieldCheck size={16} /> Admin {isAdminAuthorized && <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-1" />}
              </button>
            </div>

            {viewMode === 'directory' && (
              <div className="relative w-full xl:w-[350px]">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-heaven-gold" />
                <input 
                  type="text"
                  placeholder="Search participants..."
                  className="w-full bg-white/5 dark:bg-black/5 border border-white/10 dark:border-black/5 p-3 pl-11 rounded-button text-[12px] font-avenir-medium text-white dark:text-black outline-none focus:border-brand-heaven-gold transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          {viewMode === 'directory' && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 bg-white/5 dark:bg-black/5 border border-white/5 dark:border-black/5 p-8 rounded-card shadow-card">
              <div className="space-y-4">
                <span className="text-[9px] font-avenir-bold text-brand-heaven-gold uppercase flex items-center gap-2">
                  <Globe size={12} /> Geographic Hub
                </span>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setFilterCountryCode('ALL')} className={`px-3 py-1.5 text-[10px] font-avenir-medium rounded-button border ${filterCountryCode === 'ALL' ? 'bg-brand-heaven-gold text-white border-brand-heaven-gold' : 'border-white/10 dark:border-black/10 text-white dark:text-black opacity-50'}`}>Global</button>
                  {activeCountries.map(c => (
                    <button key={c.code} onClick={() => setFilterCountryCode(c.code)} className={`px-3 py-1.5 text-[10px] font-avenir-medium rounded-button border ${filterCountryCode === c.code ? 'bg-white dark:bg-black text-black dark:text-white border-white dark:border-black' : 'border-white/10 dark:border-black/10 text-white dark:text-black opacity-50'}`}>{c.code}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[9px] font-avenir-bold text-brand-heaven-gold uppercase flex items-center gap-2">
                  <Building size={12} /> Ministry
                </span>
                <select value={filterMinistry} onChange={e => setFilterMinistry(e.target.value)} className="w-full bg-black/40 dark:bg-white border border-white/10 dark:border-black/10 p-3 rounded-button text-[11px] font-avenir-medium text-white dark:text-black outline-none focus:border-brand-heaven-gold">
                  <option value="ALL">All Organizations</option>
                  {uniqueMinistries.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <span className="text-[9px] font-avenir-bold text-brand-heaven-gold uppercase flex items-center gap-2">
                  <Briefcase size={12} /> Capacity
                </span>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="w-full bg-black/40 dark:bg-white border border-white/10 dark:border-black/10 p-3 rounded-button text-[11px] font-avenir-medium text-white dark:text-black outline-none focus:border-brand-heaven-gold">
                  <option value="ALL">All Leadership Roles</option>
                  {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-brand-heaven-gold mb-4" size={32} />
            <p className="text-[10px] text-brand-heaven-gold uppercase font-avenir-medium tracking-widest">Synchronizing Identity Stream...</p>
          </div>
        ) : viewMode === 'directory' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredParticipants.map(p => (
              <ParticipantCard key={p.id} participant={p} onClick={() => setSelectedParticipant(p)} />
            ))}
          </div>
        ) : (
          <AdminConsole 
            participants={participants}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isAuthorized={isAdminAuthorized}
            onAuthorize={setIsAdminAuthorized}
            editingId={activeEditingId}
            onSetEditingId={setActiveEditingId}
          />
        )}
      </main>

      <footer className="mt-40 border-t border-white/5 dark:border-black/5 py-32 bg-black dark:bg-white text-center">
        <div className="max-w-[1400px] mx-auto px-8 space-y-10">
          <p className="font-didot italic text-3xl text-white/30 dark:text-black/20 max-w-3xl mx-auto leading-relaxed">
            "History is defined by the dedicated few who lead with purpose."
          </p>
          <div className="text-[10px] font-avenir-bold text-brand-heaven-gold uppercase tracking-[4px]">
            Leaders' Summit 2026 Stuttgart
          </div>
        </div>
      </footer>

      <ProfileModal 
        participant={selectedParticipant} 
        onClose={() => setSelectedParticipant(null)} 
        isAdmin={isAdminAuthorized}
        onDelete={handleDelete}
        onEdit={(id) => { setSelectedParticipant(null); setActiveEditingId(id); setViewMode('admin'); }}
      />
    </div>
  );
};

export default App;
