import { create } from 'zustand';
import { Patient, BrushLogExternal, MessageSummary, ClinicBundle, ConversationMessage } from '../types';
import { loadClinicData, saveClinicData } from './storage';
import { generateDemoData } from './demo';

interface ClinicStore {
  patients: Patient[];
  logs: BrushLogExternal[];
  messages: MessageSummary[];
  conversations: ConversationMessage[];
  
  loadData: () => void;
  saveData: () => void;
  generateDemo: () => void;
  importData: (data: ClinicBundle) => void;
  exportData: () => ClinicBundle;
  
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  
  getPatientLogs: (patientId: string) => BrushLogExternal[];
  getPatientMessages: (patientId: string) => MessageSummary[];
  getPatientConversations: (patientId: string) => ConversationMessage[];
}

export const useClinicStore = create<ClinicStore>((set, get) => ({
  patients: [],
  logs: [],
  messages: [],
  conversations: [],
  
  loadData: () => {
    const data = loadClinicData();
    if (data) {
      set({
        patients: data.patients,
        logs: data.logs,
        messages: data.messages || [],
        conversations: data.conversations || [],
      });
    }
  },
  
  saveData: () => {
    const state = get();
    const bundle: ClinicBundle = {
      patients: state.patients,
      logs: state.logs,
      messages: state.messages,
      conversations: state.conversations,
      version: 'daisan-hygienist-lite-v1',
    };
    saveClinicData(bundle);
  },
  
  generateDemo: () => {
    const demoData = generateDemoData();
    set({
      patients: demoData.patients,
      logs: demoData.logs,
      messages: demoData.messages || [],
      conversations: demoData.conversations || [],
    });
    get().saveData();
  },
  
  importData: (data: ClinicBundle) => {
    set({
      patients: data.patients,
      logs: data.logs,
      messages: data.messages || [],
      conversations: data.conversations || [],
    });
    get().saveData();
  },
  
  exportData: () => {
    const state = get();
    return {
      patients: state.patients,
      logs: state.logs,
      messages: state.messages,
      conversations: state.conversations,
      version: 'daisan-hygienist-lite-v1',
    };
  },
  
  addPatient: (patient: Patient) => {
    set(state => ({
      patients: [...state.patients, patient],
    }));
    get().saveData();
  },
  
  updatePatient: (id: string, updates: Partial<Patient>) => {
    set(state => ({
      patients: state.patients.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
    get().saveData();
  },
  
  deletePatient: (id: string) => {
    set(state => ({
      patients: state.patients.filter(p => p.id !== id),
      logs: state.logs.filter(l => l.patientId !== id),
      messages: state.messages.filter(m => m.patientId !== id),
      conversations: state.conversations.filter(c => c.patientId !== id),
    }));
    get().saveData();
  },
  
  getPatientLogs: (patientId: string) => {
    return get().logs.filter(log => log.patientId === patientId);
  },
  
  getPatientMessages: (patientId: string) => {
    return get().messages.filter(msg => msg.patientId === patientId);
  },
  
  getPatientConversations: (patientId: string) => {
    return get().conversations.filter(conv => conv.patientId === patientId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
}));
