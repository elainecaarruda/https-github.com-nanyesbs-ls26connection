
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
  country: Country; // Residency/Current Node
  nationality: Country; // Origin/Heritage
  testimony: string;
  phone: string;
  email: string;
  website: string;
  photoUrl: string;
  promoPhotoUrl?: string;
  events?: string[];
}

export type ViewMode = 'directory' | 'admin';
