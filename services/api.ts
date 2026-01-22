
import { Participant } from '../types';
import { INITIAL_PARTICIPANTS } from '../constants';

// Simulated database using localStorage to mimic a real API with persistence.
const DB_KEY = 'leaders_summit_db';

const getStoredData = (): Participant[] => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_PARTICIPANTS));
    return INITIAL_PARTICIPANTS;
  }
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) throw new Error("Format invalid");
    return parsed;
  } catch (e) {
    console.error("Data corruption detected. Resetting to initial state.");
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_PARTICIPANTS));
    return INITIAL_PARTICIPANTS;
  }
};

const saveStoredData = (data: Participant[]) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Storage quota exceeded. Cannot save identity core changes.");
    throw new Error("Quota exceeded");
  }
};

export const api = {
  getParticipants: async (): Promise<Participant[]> => {
    // Artificial latency to simulate secure connection
    await new Promise(resolve => setTimeout(resolve, 600));
    return getStoredData();
  },

  addParticipant: async (participant: Omit<Participant, 'id'>): Promise<Participant> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const data = getStoredData();
    const newParticipant: Participant = {
      ...participant,
      id: Math.random().toString(36).substring(2, 7).toUpperCase(),
    };
    data.push(newParticipant);
    saveStoredData(data);
    return newParticipant;
  },

  updateParticipant: async (id: string, updates: Partial<Participant>): Promise<Participant> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const data = getStoredData();
    const index = data.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Identity node not found');
    
    const updated = { ...data[index], ...updates };
    data[index] = updated;
    saveStoredData(data);
    return updated;
  },

  deleteParticipant: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const data = getStoredData();
    const filtered = data.filter(p => p.id !== id);
    saveStoredData(filtered);
  },

  resetData: async (): Promise<void> => {
    // Clear all storage including potential cookies and other artifacts
    localStorage.clear();
    sessionStorage.clear();
    // Re-initialize with defaults
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_PARTICIPANTS));
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
};
