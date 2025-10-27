export type Patient = {
  id: string;
  name: string;
  birthday?: string;
  sex?: 'M' | 'F' | 'Other';
  phone?: string;
  email?: string;
  notes?: string;
  brushType?: '複合植毛' | '大型・幅広・段差植毛' | '極細毛・スーパーテーパード毛' | '小型・コンパクト' | null;
  followUp?: {
    flag: boolean;
    note?: string;
  };
  nextAppointment?: string | null;
};

export type BrushLogExternal = {
  id: string;
  patientId: string;
  dateISO: string;
  durationSec: number;
  timeOfDay: 'morning' | 'night' | 'other';
  selfRating: 1 | 2 | 3 | 4 | 5;
  bleeding?: boolean;
  sensitivity?: boolean;
  pain?: boolean;
  source: 'demo' | 'import';
};

export type MessageSummary = {
  patientId: string;
  createdAt: string;
  summary: string;
};

export type ClinicBundle = {
  patients: Patient[];
  logs: BrushLogExternal[];
  messages?: MessageSummary[];
  version: 'daisan-hygienist-lite-v1';
};

export type ToothbrushType = '複合植毛' | '大型・幅広・段差植毛' | '極細毛・スーパーテーパード毛' | '小型・コンパクト';

export type QuestionAnswer = {
  questionId: string;
  answer: string;
};

export type RecommendationResult = {
  brushType: ToothbrushType;
  reason: string;
  notes: string;
  marketExamples?: string;
};
