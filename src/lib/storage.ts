import { ClinicBundle } from '../types';

const STORAGE_KEY = 'daisan-hygienist-lite-clinic-data';

export function saveClinicData(data: ClinicBundle): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadClinicData(): ClinicBundle | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  try {
    const data = JSON.parse(stored) as ClinicBundle;
    if (data.version === 'daisan-hygienist-lite-v1') {
      return data;
    }
  } catch (e) {
    console.error('Failed to parse clinic data:', e);
  }
  
  return null;
}

export function clearClinicData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportClinicData(): string {
  const data = loadClinicData();
  if (!data) {
    return JSON.stringify({
      patients: [],
      logs: [],
      messages: [],
      version: 'daisan-hygienist-lite-v1'
    }, null, 2);
  }
  return JSON.stringify(data, null, 2);
}

export function importClinicData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as ClinicBundle;
    if (data.version === 'daisan-hygienist-lite-v1') {
      saveClinicData(data);
      return true;
    }
  } catch (e) {
    console.error('Failed to import clinic data:', e);
  }
  return false;
}
