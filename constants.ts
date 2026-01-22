
import { Participant, Country } from './types';

export const ADMIN_PASSWORD = '123';
export const BRAND_GOLD = '#BB9446'; // Heaven Gold
export const BRAND_GOLD_LIGHT = '#D3B962'; // Gold
export const BRAND_GOLD_DARK = '#9C7B3A';
export const BRAND_BLACK = '#050505';

export const HIGH_QUALITY_PLACEHOLDER = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop";

export const getIdentityPlaceholder = (name: string): string => {
  try {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'LS';

    // Premium SVG Avatar Design: Minimalist luxury with Heaven Gold gradients
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${BRAND_GOLD};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${BRAND_GOLD_DARK};stop-opacity:1" />
          </linearGradient>
          <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style="stop-color:${BRAND_GOLD};stop-opacity:0.15" />
            <stop offset="100%" style="stop-color:black;stop-opacity:0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="#0A0A0A"/>
        <circle cx="50" cy="50" r="48" fill="url(#innerGlow)"/>
        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#goldGradient)" stroke-width="0.5" opacity="0.3" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="url(#goldGradient)" stroke-width="1.5" />
        <text 
          x="50%" 
          y="50%" 
          fill="url(#goldGradient)" 
          font-family="'Bodoni Moda', serif" 
          font-weight="400" 
          font-size="32" 
          text-anchor="middle" 
          dominant-baseline="central" 
          style="letter-spacing: 0px; text-transform: uppercase; font-style: italic;"
        >
          ${initials}
        </text>
      </svg>
    `.trim();

    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    return HIGH_QUALITY_PLACEHOLDER;
  }
};

export const COUNTRY_LIST: Country[] = [
  { name: 'Germany', flag: '🇩🇪', code: 'DE' },
  { name: 'France', flag: '🇫🇷', code: 'FR' },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
  { name: 'Italy', flag: '🇮🇹', code: 'IT' },
  { name: 'Spain', flag: '🇪🇸', code: 'ES' },
  { name: 'Sweden', flag: '🇸🇪', code: 'SE' },
  { name: 'Portugal', flag: '🇵🇹', code: 'PT' },
  { name: 'Hungary', flag: '🇭🇺', code: 'HU' },
  { name: 'Czech Republic', flag: '🇨🇿', code: 'CZ' },
  { name: 'Bulgaria', flag: '🇧🇬', code: 'BG' },
  { name: 'Ireland', flag: '🇮🇪', code: 'IE' },
  { name: 'United States', flag: '🇺🇸', code: 'US' },
  { name: 'Slovenia', flag: '🇸🇮', code: 'SI' },
  { name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE' },
  { name: 'Luxembourg', flag: '🇱🇺', code: 'LU' },
  { name: 'Brazil', flag: '🇧🇷', code: 'BR' }
];

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: '1',
    name: 'Matthias Greve',
    title: 'CEO',
    organization: 'Alpha & Omega Stiftung',
    country: { name: 'Germany', flag: '🇩🇪', code: 'DE' },
    nationality: { name: 'Germany', flag: '🇩🇪', code: 'DE' },
    testimony: 'After 40 years of high-tech innovation, my greatest joy is seeing the Spirit transform lives across Europe.',
    phone: '+49 123 456789',
    email: 'matthias@example.org',
    website: 'https://alpha-omega.org',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=400&fit=crop',
    promoPhotoUrl: 'https://images.unsplash.com/photo-1542744095-2ad48424b66a?q=80&w=1200&h=600&fit=crop'
  },
  {
    id: '2',
    name: 'Anna Csöngedi',
    title: 'Executive Director',
    organization: 'Europe For Christ',
    country: { name: 'Hungary', flag: '🇭🇺', code: 'HU' },
    nationality: { name: 'Hungary', flag: '🇭🇺', code: 'HU' },
    testimony: 'My journey started in Budapest, where I saw the transformative power of faith in rebuilding social fabrics.',
    phone: '+36 123 45678',
    email: 'anna@example.org',
    website: 'https://europeforchrist.org',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&fit=crop',
    promoPhotoUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&h=600&fit=crop'
  },
  {
    id: '3',
    name: 'Arnd Herrmann',
    title: 'Director Partnerships',
    organization: 'Alpha EMENA',
    country: { name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE' },
    nationality: { name: 'Germany', flag: '🇩🇪', code: 'DE' },
    testimony: 'From a football hooligan to a man of God, my life is a testament to the radical grace found on an Alpha course.',
    phone: '+971 50 1234567',
    email: 'arnd@alpha.org',
    website: 'https://alpha.org',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&fit=crop',
    promoPhotoUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&h=600&fit=crop'
  }
];
