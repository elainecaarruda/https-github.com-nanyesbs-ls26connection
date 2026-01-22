
import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { X, Mail, Globe, Phone, ArrowRightLeft, User, Sparkles, Calendar, ExternalLink, Shield } from 'lucide-react';
import { getIdentityPlaceholder, HIGH_QUALITY_PLACEHOLDER } from '../constants';

interface ProfileModalProps {
  participant: Participant | null;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ participant, onClose }) => {
  const [isShowingPromo, setIsShowingPromo] = useState(false);

  // Keyboard support: Close on ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!participant) return null;

  // Logic for dual-tone name: First word white, others stone-700
  const nameParts = participant.name.split(' ');
  const firstName = nameParts[0];
  const otherNames = nameParts.slice(1).join(' ');

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (target.getAttribute('data-fallback-triggered')) {
      target.src = HIGH_QUALITY_PLACEHOLDER;
      return;
    }
    target.setAttribute('data-fallback-triggered', 'true');
    target.src = getIdentityPlaceholder(participant.name);
  };

  const portraitImage = participant.photoUrl || getIdentityPlaceholder(participant.name);
  const activeImage = isShowingPromo && participant.promoPhotoUrl ? participant.promoPhotoUrl : portraitImage;

  const displayEvents = participant.events || [
    "Regional Leadership Gathering '26",
    "Digital Missions Forum",
    "Stuttgart Strategic Hub Launch"
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/98 backdrop-blur-3xl animate-fade-in overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal Container - Balanced "Square-ish" Professional Ratio */}
      <div className="relative w-full max-w-5xl bg-[#080808] border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,1)] rounded-none">
        
        {/* Close Button - Integrated into Design */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 text-white/20 hover:text-[#BB9446] transition-all duration-300"
          aria-label="Close"
        >
          <X size={24} strokeWidth={1.5} />
        </button>

        {/* LEFT COLUMN: VISUAL PORTAL */}
        <div className="relative w-full md:w-[45%] bg-black flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
          <div className="relative aspect-square md:aspect-auto md:h-full overflow-hidden group">
            <img 
              key={activeImage}
              src={activeImage} 
              alt={participant.name}
              onError={handleImageError}
              className={`w-full h-full object-cover transition-all duration-1000 ease-in-out scale-100 group-hover:scale-105 ${isShowingPromo ? 'brightness-100' : 'brightness-90 group-hover:brightness-100'}`}
            />
            
            {/* Elegant Gradient Wash */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-60" />
            
            {/* Technical Stamp */}
            <div className="absolute top-8 left-8 flex flex-col gap-1 pointer-events-none opacity-30">
              <span className="text-[6px] font-avenir-medium text-[#BB9446] tracking-[0.5em] uppercase">Auth Verification</span>
              <span className="text-[8px] font-avenir-roman text-white tracking-[0.2em] uppercase">Identity Hub 26</span>
            </div>
          </div>

          {/* Interaction Switcher - Refined Minimalism */}
          {participant.promoPhotoUrl && (
            <div className="absolute bottom-8 left-0 w-full px-8 z-20">
              <button 
                onClick={() => setIsShowingPromo(!isShowingPromo)}
                className="w-full py-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-[#BB9446]/40 text-white text-[9px] font-avenir-medium uppercase tracking-[0.4em] transition-all duration-500 flex items-center justify-center gap-4 group/btn"
              >
                {isShowingPromo ? <User size={12} className="text-[#BB9446]" /> : <Sparkles size={12} className="text-[#BB9446]" />}
                <span>{isShowingPromo ? 'Identity Profile' : 'Promotional Asset'}</span>
                <ArrowRightLeft size={10} className="opacity-20 group-hover/btn:rotate-180 transition-transform duration-700" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LEADERSHIP DATA */}
        <div className="w-full md:w-[55%] p-8 md:p-14 lg:p-16 flex flex-col bg-[#080808] overflow-y-auto max-h-[85vh] custom-scrollbar">
          
          {/* Geolocation Protocol - Fixed Flag Color */}
          <div className="mb-10 flex items-center gap-4 animate-fade-in">
            <span className="text-3xl transition-transform hover:scale-110 cursor-default drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              {participant.country.flag}
            </span>
            <div className="h-px w-6 bg-[#BB9446]/30" />
            <span className="text-[10px] font-avenir-medium text-[#BB9446] tracking-[0.6em] uppercase">
              {participant.country.name} Node
            </span>
          </div>

          {/* Primary Identity Header */}
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-black italic font-didot leading-[0.9] tracking-tighter mb-8">
              <span className="text-white block">{firstName}</span>
              <span className="text-stone-800 block -mt-1">{otherNames}</span>
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-baseline gap-4">
                <span className="text-[7px] font-avenir-medium text-white/20 uppercase tracking-[0.4em]">Org</span>
                <span className="text-[11px] font-avenir-medium text-white tracking-[0.15em] uppercase">{participant.organization}</span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-[7px] font-avenir-medium text-white/20 uppercase tracking-[0.4em]">Role</span>
                <span className="text-lg font-avenir-roman italic text-[#BB9446] font-didot tracking-wide">{participant.title}</span>
              </div>
            </div>
          </div>

          {/* Biography Context - Optimized for Readability */}
          <div className="mb-16">
             <div className="h-px w-12 bg-[#BB9446]/40 mb-8" />
             <p className="text-white/70 text-lg leading-[1.85] font-avenir-roman font-light tracking-wide max-w-lg">
               {participant.bio}
             </p>
          </div>

          {/* Connectivity Protocols */}
          <div className="mb-16">
            <h4 className="text-[8px] font-avenir-medium text-white/20 tracking-[0.8em] uppercase mb-10 flex items-center gap-3">
              <Shield size={10} className="text-[#BB9446]/40" /> Contact Terminal
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
              {[
                { icon: Phone, label: 'Secure Line', value: participant.phone, href: `tel:${participant.phone}` },
                { icon: Mail, label: 'Access Point', value: participant.email, href: `mailto:${participant.email}` },
                { icon: Globe, label: 'Web Hub', value: participant.website.replace('https://', ''), href: participant.website }
              ].map((item, i) => (
                <a 
                  key={i} 
                  href={item.href}
                  className="group flex items-center gap-5 transition-all"
                >
                  <div className="w-10 h-10 rounded-none border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/30 group-hover:text-[#BB9446] group-hover:border-[#BB9446]/40 transition-all duration-500">
                    <item.icon size={16} strokeWidth={1.2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-avenir-medium text-white/20 uppercase tracking-[0.3em] mb-1">
                      {item.label}
                    </span>
                    <span className="text-[11px] font-avenir-roman text-white/60 group-hover:text-white transition-colors tracking-widest uppercase truncate max-w-[140px]">
                      {item.value}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Impact Timeline Footer */}
          <div className="mt-auto pt-10 border-t border-white/5">
            <div className="space-y-8">
              <h5 className="text-[9px] font-avenir-medium text-[#BB9446] tracking-[0.4em] uppercase flex items-center gap-3">
                <Calendar size={12} strokeWidth={1.5} /> Deployment Timeline '26
              </h5>
              <div className="grid grid-cols-1 gap-4">
                {displayEvents.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between group/line">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-1 bg-[#BB9446]/40 rounded-full" />
                      <span className="text-[10px] font-avenir-roman text-white/40 group-hover/line:text-white/80 transition-colors tracking-wide">{ev}</span>
                    </div>
                    <ExternalLink size={10} className="text-[#BB9446]/20 group-hover/line:text-[#BB9446] opacity-0 group-hover/line:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
