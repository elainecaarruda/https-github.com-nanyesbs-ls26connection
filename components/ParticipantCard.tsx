
import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { Building2, ChevronRight } from 'lucide-react';
import { getIdentityPlaceholder, HIGH_QUALITY_PLACEHOLDER } from '../constants';

interface ParticipantCardProps {
  participant: Participant;
  onClick: () => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, onClick }) => {
  const [imgSrc, setImgSrc] = useState<string>(participant.photoUrl || getIdentityPlaceholder(participant.name));
  const [fallbackStage, setFallbackStage] = useState<number>(participant.photoUrl ? 0 : 1);

  useEffect(() => {
    setImgSrc(participant.photoUrl || getIdentityPlaceholder(participant.name));
    setFallbackStage(participant.photoUrl ? 0 : 1);
  }, [participant.photoUrl, participant.name]);

  const handleImageError = () => {
    if (fallbackStage === 0) {
      setImgSrc(getIdentityPlaceholder(participant.name));
      setFallbackStage(1);
    } else if (fallbackStage === 1) {
      setImgSrc(HIGH_QUALITY_PLACEHOLDER);
      setFallbackStage(2);
    }
  };

  const showDualFlags = participant.country.code !== participant.nationality.code;

  return (
    <div 
      onClick={onClick}
      className="group relative bg-black dark:bg-stone-50 border border-white/10 dark:border-stone-200 hover:border-brand-heaven-gold transition-all duration-300 cursor-pointer overflow-hidden p-8 flex flex-col items-center text-center rounded-card shadow-card hover:shadow-modal"
    >
      {/* 1. Profile Picture (Coloring & Flags) */}
      <div className="relative mb-6">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 dark:border-stone-200 group-hover:border-brand-heaven-gold group-hover:shadow-[0_0_15px_rgba(187,148,70,0.3)] transition-all duration-300 bg-black dark:bg-white">
          <img 
            src={imgSrc} 
            alt={participant.name}
            onError={handleImageError}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
          />
        </div>
        
        {/* Flags */}
        <div className="absolute -bottom-1 -right-1 flex items-center">
          {showDualFlags ? (
            <div className="flex -space-x-3">
              <div className="bg-black dark:bg-white border border-white/10 dark:border-stone-200 rounded-full w-9 h-9 flex items-center justify-center text-lg shadow-lg z-10">
                {participant.nationality.flag}
              </div>
              <div className="bg-black dark:bg-white border border-white/10 dark:border-stone-200 rounded-full w-9 h-9 flex items-center justify-center text-lg shadow-lg z-20">
                {participant.country.flag}
              </div>
            </div>
          ) : (
            <div className="bg-black dark:bg-white border border-white/10 dark:border-stone-200 rounded-full w-9 h-9 flex items-center justify-center text-lg shadow-lg">
              {participant.country.flag}
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col items-center">
        {/* 2. Full Name (18px) */}
        <h3 className="text-[18px] font-avenir-bold text-white dark:text-black mb-1 group-hover:text-brand-heaven-gold transition-colors">
          {participant.name}
        </h3>
        
        {/* 3. Role (14px - Gold) */}
        <p className="text-[14px] font-avenir-medium text-brand-heaven-gold mb-2 uppercase tracking-wide">
          {participant.title}
        </p>
        
        {/* 4. Organization (14px - Avenir Roman) */}
        <div className="flex items-center justify-center gap-2 text-[14px] text-white dark:text-black font-avenir-roman mb-8 opacity-60 dark:opacity-50">
          <Building2 size={14} className="text-brand-heaven-gold" />
          <span className="truncate">{participant.organization}</span>
        </div>

        {/* 5. View More Button */}
        <div className="w-full pt-6 border-t border-white/10 dark:border-stone-100 flex flex-col items-center">
          <button className="flex items-center gap-2 px-6 py-2 bg-white/5 dark:bg-black/5 group-hover:bg-brand-heaven-gold group-hover:text-white rounded-full text-[10px] font-avenir-bold text-brand-heaven-gold dark:text-brand-heaven-gold uppercase transition-all tracking-widest shadow-sm">
            View More
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantCard;
