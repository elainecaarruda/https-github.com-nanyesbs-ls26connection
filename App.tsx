
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import ParticipantCard from './components/ParticipantCard';
import ProfileModal from './components/ProfileModal';
import AdminConsole from './components/AdminConsole';
import { Participant, ViewMode, Country } from './types';
import { api } from './services/api';
import { COUNTRY_LIST } from './constants';
import { Search, ShieldCheck, Users, Loader2, Filter, AlertTriangle, XCircle, Briefcase, Building, LayoutGrid, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  
  const [filterCountryCode, setFilterCountryCode] = useState<string>('ALL');
  const [filterMinistry, setFilterMinistry] = useState<string>('ALL');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getParticipants();
      setParticipants(data);
    } catch (err) {
      setError('CORE OFFLINE: Secure identity stream unavailable.');
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
  };

  const isAnyFilterActive = searchQuery !== '' || filterCountryCode !== 'ALL' || filterMinistry !== 'ALL' || filterRole !== 'ALL';

  const resetFilters = () => {
    setFilterCountryCode('ALL');
    setFilterMinistry('ALL');
    setFilterRole('ALL');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-[#BB9446] selection:text-black font-montserrat">
      <Header />

      <main className="max-w-[1500px] mx-auto px-10 py-24">
        {error && (
          <div className="mb-16 p-8 bg-red-950/10 border border-red-900/30 text-red-500 text-[11px] font-black uppercase tracking-[0.6em] flex items-center gap-6 animate-pulse">
            <AlertTriangle size={24} /> {error}
          </div>
        )}

        <div className="flex flex-col gap-20 mb-24">
          {/* Dashboard Control Bar */}
          <div className="flex flex-col xl:flex-row justify-between items-center gap-12 border-b border-white/5 pb-12">
            <div className="flex gap-12">
              <button 
                onClick={() => setViewMode('directory')}
                className={`text-[12px] tracking-[0.6em] font-black uppercase flex items-center gap-4 transition-all pb-2 border-b-2 ${viewMode === 'directory' ? 'text-[#BB9446] border-[#BB9446]' : 'text-white/20 border-transparent hover:text-white'}`}
              >
                <LayoutGrid size={18} /> CONNECTION DIRECTORY
              </button>
              <button 
                onClick={() => setViewMode('admin')}
                className={`text-[12px] tracking-[0.6em] font-black uppercase flex items-center gap-4 transition-all pb-2 border-b-2 ${viewMode === 'admin' ? 'text-[#BB9446] border-[#BB9446]' : 'text-white/20 border-transparent hover:text-white'}`}
              >
                <ShieldCheck size={18} /> STRATEGIC HUB
              </button>
            </div>

            {viewMode === 'directory' && (
              <div className="flex items-center gap-6 w-full xl:w-auto">
                <div className="relative w-full xl:w-[450px] group">
                  <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#BB9446] transition-colors" />
                  <input 
                    type="text"
                    placeholder="LOCATE IDENTITY NODES..."
                    className="w-full bg-white/[0.03] border border-white/10 p-5 pl-14 text-[11px] font-bold tracking-[0.3em] uppercase focus:border-[#BB9446] transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {isAnyFilterActive && (
                  <button 
                    onClick={resetFilters}
                    className="p-5 border border-white/5 text-white/20 hover:text-[#BB9446] hover:border-[#BB9446]/30 transition-all flex items-center gap-3 group"
                    title="Clear All Protocols"
                  >
                    <XCircle size={20} className="group-hover:rotate-90 transition-transform" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tactical Filters Shell */}
          {viewMode === 'directory' && !loading && participants.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 bg-[#030303] border border-white/5 p-10 rounded-sm shadow-xl">
              {/* Hub Network Filter */}
              <div className="space-y-6">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.6em] flex items-center gap-3">
                  <Globe size={12} className="text-[#BB9446]" /> GEOGRAPHIC HUB NODES
                </span>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-4">
                  <button 
                    onClick={() => setFilterCountryCode('ALL')} 
                    className={`px-4 py-2 text-[10px] font-black border tracking-widest transition-all ${filterCountryCode === 'ALL' ? 'bg-[#BB9446] text-black border-[#BB9446]' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
                  >
                    GLOBAL
                  </button>
                  {activeCountries.map(c => (
                    <button 
                      key={c.code} 
                      onClick={() => setFilterCountryCode(c.code)} 
                      className={`px-4 py-2 text-[10px] font-black border tracking-widest transition-all flex items-center gap-2 ${filterCountryCode === c.code ? 'bg-white text-black border-white' : 'bg-white/[0.02] text-white/40 border-white/5 hover:border-[#BB9446]/40 hover:text-white'}`}
                    >
                      <span>{c.flag}</span> {c.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Organization Logic Filter */}
              <div className="space-y-6">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.6em] flex items-center gap-3">
                  <Building size={12} className="text-[#BB9446]" /> MINISTRY ORIENTATION
                </span>
                <select 
                  value={filterMinistry} 
                  onChange={e => setFilterMinistry(e.target.value)} 
                  className="w-full bg-black border border-white/10 p-4 text-[10px] text-white/70 font-black tracking-widest uppercase outline-none focus:border-[#BB9446] cursor-pointer"
                >
                  <option value="ALL">ALL STRATEGIC ORGANIZATIONS</option>
                  {uniqueMinistries.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                </select>
              </div>

              {/* Capacity Filter */}
              <div className="space-y-6">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.6em] flex items-center gap-3">
                  <Briefcase size={12} className="text-[#BB9446]" /> LEADERSHIP CAPACITY
                </span>
                <select 
                  value={filterRole} 
                  onChange={e => setFilterRole(e.target.value)} 
                  className="w-full bg-black border border-white/10 p-4 text-[10px] text-white/70 font-black tracking-widest uppercase outline-none focus:border-[#BB9446] cursor-pointer"
                >
                  <option value="ALL">ALL LEADERSHIP ROLES</option>
                  {uniqueRoles.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Display Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <Loader2 className="animate-spin text-[#BB9446] mb-8" size={48} />
            <p className="text-[11px] tracking-[0.8em] text-white/20 uppercase font-black animate-pulse">Establishing Secure Stream...</p>
          </div>
        ) : viewMode === 'directory' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-12">
            {filteredParticipants.length > 0 ? (
              filteredParticipants.map(p => (
                <ParticipantCard key={p.id} participant={p} onClick={() => setSelectedParticipant(p)} />
              ))
            ) : (
              <div className="col-span-full py-60 text-center border border-dashed border-white/10 opacity-30 group hover:opacity-100 transition-opacity">
                <p className="text-[14px] font-black uppercase tracking-[1em] mb-8">IDENTITY QUERY FAILED</p>
                <button 
                  onClick={resetFilters} 
                  className="px-10 py-4 border border-[#BB9446] text-[10px] font-black text-[#BB9446] uppercase tracking-[0.5em] hover:bg-[#BB9446] hover:text-black transition-all"
                >
                  REBOOT FILTERS
                </button>
              </div>
            )}
          </div>
        ) : (
          <AdminConsole 
            participants={participants}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Cinematic Footer Overlay */}
      <footer className="mt-60 border-t border-white/5 py-48 bg-[#010101] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <ShieldCheck size={600} strokeWidth={0.5} className="text-white" />
        </div>
        
        <div className="max-w-[1500px] mx-auto px-10 text-center space-y-20 relative z-10">
          <div className="space-y-8">
            <p className="font-didot italic text-4xl md:text-6xl text-white/30 leading-[1.2] max-w-5xl mx-auto tracking-tight">
              "History is not defined by the masses, but by the dedicated minority who choose to lead through purpose."
            </p>
            <div className="w-32 h-[1px] bg-[#BB9446]/40 mx-auto" />
          </div>
          
          <div className="space-y-4">
            <div className="text-[12px] font-black tracking-[1em] text-white/20 uppercase">LEADERS' SUMMIT 2026</div>
            <div className="flex items-center justify-center gap-4 text-[9px] font-bold tracking-[0.5em] text-[#BB9446]/40 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BB9446]/20 animate-pulse" />
              SECURE INFRASTRUCTURE STUTTGART HUB-021-X
              <span className="w-1.5 h-1.5 rounded-full bg-[#BB9446]/20 animate-pulse" />
            </div>
          </div>
        </div>
      </footer>

      <ProfileModal participant={selectedParticipant} onClose={() => setSelectedParticipant(null)} />
    </div>
  );
};

export default App;
