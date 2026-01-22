
export interface Country {
  name: string;
  flag: string;
  code: string;
}

export interface Participant {
  id: string;
  name: string;
  title: string;
  organization: string;
  country: Country;
  bio: string;
  testimony: string;
  phone: string;
  email: string;
  website: string;
  photoUrl: string;
  promoPhotoUrl?: string; // New field for promotional high-res assets
  events?: string[]; // Events for the impact block
}

export type ViewMode = 'directory' | 'admin';
