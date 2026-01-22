
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="relative w-full h-[60vh] flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-40 grayscale"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-black/50 to-black" />

      {/* SVG Logo (Top Right) */}
      <div className="absolute top-8 right-8 z-20 hidden md:block">
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="45" height="45" fill="#BB9446" />
          <rect x="55" width="45" height="45" fill="white" fillOpacity="0.2" />
          <rect y="55" width="45" height="45" fill="white" fillOpacity="0.1" />
          <rect x="55" y="55" width="45" height="45" fill="#BB9446" fillOpacity="0.5" />
        </svg>
      </div>

      {/* Hero Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl flex flex-col items-center">
        <span className="text-[10px] md:text-xs tracking-[0.5em] font-light text-white/80 uppercase mb-4 animate-fade-in">
          EUROPE SHALL BE SAVED
        </span>
        
        <h1 className="text-4xl md:text-7xl font-extrabold text-white uppercase leading-tight mb-6">
          LEADERS' <br />
          <span className="tracking-tighter">SUMMIT '26</span>
        </h1>

        <div className="w-24 h-[2px] bg-[#BB9446] mb-6" />

        <p className="text-sm md:text-lg font-normal text-white/90 tracking-widest uppercase">
          27.01.26 – 28.01.26 | Stuttgart, DE
        </p>
      </div>
    </header>
  );
};

export default Header;
