import { create } from 'zustand';
import { Patient, BrushLogExternal, MessageSummary, ClinicBundle } from '../types';
import { loadClinicData, saveClinicData } from './storage';
import { generateDemoData } from './demo';

interface ClinicStore {
  patients: Patient[];
  logs: BrushLogExternal[];
  messages: MessageSummary[];
  
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
}

export const useClinicStore = create<ClinicStore>((set, get) => ({
  patients: [],
  logs: [],
  messages: [],
  
  loadData: () => {
    const data = loadClinicData();
    if (data) {
      set({
        patients: data.patients,
        logs: data.logs,
        messages: data.messages || [],
      });
    }
  },
  
  saveData: () => {
    const state = get();
    const bundle: ClinicBundle = {
      patients: state.patients,
      logs: state.logs,
      messages: state.messages,
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
    });
    get().saveData();
  },
  
  importData: (data: ClinicBundle) => {
    set({
      patients: data.patients,
      logs: data.logs,
      messages: data.messages || [],
    });
    get().saveData();
  },
  
  exportData: () => {
    const state = get();
    return {
      patients: state.patients,
      logs: state.logs,
      messages: state.messages,
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
    }));
    get().saveData();
  },
  
  getPatientLogs: (patientId: string) => {
    return get().logs.filter(log => log.patientId === patientId);
  },
  
  getPatientMessages: (patientId: string) => {
    return get().messages.filter(msg => msg.patientId === patientId);
  },
}));
