
import React from 'react';
import { Participant } from '../types';
import { Building2 } from 'lucide-react';
import { getIdentityPlaceholder, HIGH_QUALITY_PLACEHOLDER } from '../constants';

interface ParticipantCardProps {
  participant: Participant;
  onClick: () => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, onClick }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    // Prevent infinite loop if the placeholder itself fails
    if (target.getAttribute('data-fallback-triggered')) {
      target.src = HIGH_QUALITY_PLACEHOLDER;
      return;
    }
    target.setAttribute('data-fallback-triggered', 'true');
    target.src = getIdentityPlaceholder(participant.name);
  };

  const displayImage = participant.photoUrl || getIdentityPlaceholder(participant.name);

  return (
    <div 
      onClick={onClick}
      className="group relative bg-[#0a0a0a] border border-white/10 hover:border-[#BB9446]/50 transition-all duration-500 cursor-pointer overflow-hidden p-8 flex flex-col items-center text-center"
    >
      {/* Circular Photo Container */}
      <div className="relative mb-6">
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-[#BB9446]/50 transition-all duration-500 bg-[#111]">
          <img 
            src={displayImage} 
            alt={participant.name}
            onError={handleImageError}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
          />
        </div>
        {/* Flag Badge on Circle */}
        <div className="absolute -bottom-1 -right-1 bg-black border border-white/10 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-xl group-hover:border-[#BB9446]/30 transition-colors">
          {participant.country.flag}
        </div>
      </div>

      <div className="w-full">
        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#BB9446] transition-colors uppercase tracking-tight">
          {participant.name}
        </h3>
        <p className="text-xs font-semibold text-[#BB9446] mb-4 uppercase tracking-[0.2em] opacity-80">
          {participant.title}
        </p>
        
        <div className="flex items-center justify-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-bold mb-6">
          <Building2 size={12} className="text-white/20" />
          <span className="truncate">{participant.organization}</span>
        </div>

        <p className="text-xs text-white/30 line-clamp-2 leading-relaxed italic font-didot mb-4">
          "{participant.bio}"
        </p>
        
        <div className="inline-block px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-bold text-white/60 uppercase tracking-widest">
          {participant.country.flag} {participant.country.name}
        </div>
      </div>

      {/* Decorative Accents */}
      <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none overflow-hidden">
        <div className="absolute top-4 right-4 w-px h-3 bg-[#BB9446]/10 group-hover:bg-[#BB9446]/40 transition-colors" />
        <div className="absolute top-4 right-4 w-3 h-px bg-[#BB9446]/10 group-hover:bg-[#BB9446]/40 transition-colors" />
      </div>
    </div>
  );
};

export default ParticipantCard;
