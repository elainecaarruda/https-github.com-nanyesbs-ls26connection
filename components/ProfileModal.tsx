
import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { X, Mail, Globe, Phone, User, Sparkles, Shield } from 'lucide-react';
import { getIdentityPlaceholder, HIGH_QUALITY_PLACEHOLDER } from '../constants';

interface ProfileModalProps {
  participant: Participant | null;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ participant, onClose, isAdmin, onEdit, onDelete }) => {
  const [isShowingPromo, setIsShowingPromo] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [fallbackStage, setFallbackStage] = useState<number>(0);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (participant) {
      const initialUrl = isShowingPromo && participant.promoPhotoUrl ? participant.promoPhotoUrl : participant.photoUrl;
      setImgSrc(initialUrl || getIdentityPlaceholder(participant.name));
      setFallbackStage(initialUrl ? 0 : 1);
    }
  }, [participant, isShowingPromo]);

  if (!participant) return null;

  const handleImageError = () => {
    if (fallbackStage === 0) {
      setImgSrc(getIdentityPlaceholder(participant.name));
      setFallbackStage(1);
    } else if (fallbackStage === 1) {
      setImgSrc(HIGH_QUALITY_PLACEHOLDER);
      setFallbackStage(2);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 dark:bg-white/90 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-5xl bg-[#0a0a0a] dark:bg-white border border-white/5 dark:border-stone-200 overflow-hidden flex flex-col md:row rounded-modal shadow-modal transition-colors duration-500">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 text-white/50 dark:text-stone-300 hover:text-brand-heaven-gold transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row w-full h-full">
          <div className="relative w-full md:w-[40%] bg-black dark:bg-stone-100 flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-white/5 dark:border-stone-200">
            <div className="relative aspect-square md:aspect-auto md:h-full overflow-hidden">
              <img 
                key={imgSrc}
                src={imgSrc} 
                alt={participant.name}
                onError={handleImageError}
                className={`w-full h-full object-cover transition-all duration-700 ${isShowingPromo ? 'brightness-100' : 'brightness-90 dark:brightness-100'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-white/20 via-transparent to-transparent" />
            </div>

            {participant.promoPhotoUrl && (
              <div className="absolute bottom-6 left-0 w-full px-6 z-20">
                <button 
                  onClick={() => {
                    setIsShowingPromo(!isShowingPromo);
                    setFallbackStage(0);
                  }}
                  className="w-full py-3 bg-white/10 dark:bg-black/5 backdrop-blur-lg border border-white/10 dark:border-black/5 rounded-button text-white dark:text-black text-[10px] font-avenir-medium uppercase flex items-center justify-center gap-3 transition-all hover:bg-brand-heaven-gold hover:text-white"
                >
                  {isShowingPromo ? <User size={14} /> : <Sparkles size={14} />}
                  <span>{isShowingPromo ? 'Identity Profile' : 'Promotional Asset'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-full md:w-[60%] p-8 md:p-12 lg:p-14 flex flex-col bg-[#0a0a0a] dark:bg-white overflow-y-auto max-h-[80vh] custom-scrollbar">
            
            <div className="mb-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{participant.country.flag}</span>
                <div className="flex flex-col">
                  <span className="text-[8px] font-avenir-bold text-brand-heaven-gold uppercase tracking-wider">Resident Node</span>
                  <span className="text-[10px] font-avenir-medium text-white dark:text-black uppercase">{participant.country.name}</span>
                </div>
              </div>
              
              {participant.country.code !== participant.nationality.code && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{participant.nationality.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-avenir-bold text-brand-heaven-gold uppercase tracking-wider">Nationality</span>
                    <span className="text-[10px] font-avenir-medium text-white dark:text-black uppercase">{participant.nationality.name}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-10">
              <h2 className="text-4xl md:text-5xl font-avenir-bold text-white dark:text-black leading-tight mb-2">
                {participant.name}
              </h2>
              <p className="text-lg font-didot italic text-brand-heaven-gold">{participant.title}</p>
              <p className="text-[12px] font-avenir-roman text-white dark:text-black opacity-60 dark:opacity-50 uppercase mt-1">
                {participant.organization}
              </p>
            </div>

            <div className="mb-10">
              <div className="w-12 h-0.5 bg-brand-heaven-gold" />
            </div>

            {isAdmin && (
              <div className="mb-10 p-5 bg-white/5 dark:bg-stone-50 border border-brand-heaven-gold/20 rounded-button">
                <h4 className="text-[9px] font-avenir-bold text-brand-heaven-gold uppercase mb-4 flex items-center gap-2">
                  <Shield size={12} /> Management Protocol
                </h4>
                <div className="flex gap-3">
                  <button onClick={() => onEdit?.(participant.id)} className="flex-1 py-3 bg-brand-heaven-gold text-white rounded-button text-[10px] font-avenir-bold uppercase transition-all hover:brightness-110">Edit</button>
                  <button onClick={() => onDelete?.(participant.id)} className="flex-1 py-3 border border-red-500/30 text-red-500 rounded-button text-[10px] font-avenir-bold uppercase hover:bg-red-500 hover:text-white transition-all">Delete</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-auto">
              {[
                { icon: Phone, label: 'Secure Line', value: participant.phone },
                { icon: Mail, label: 'Access Point', value: participant.email },
                { icon: Globe, label: 'Web Hub', value: participant.website.replace('https://', '') }
              ].map((item, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[8px] font-avenir-medium text-brand-heaven-gold uppercase mb-1">{item.label}</span>
                  <span className="text-[12px] font-avenir-roman text-white dark:text-black opacity-80 dark:opacity-70 truncate">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
