import { Patient, BrushLogExternal, ClinicBundle } from '../types';

export function generateDemoData(): ClinicBundle {
  const patients: Patient[] = [];
  const logs: BrushLogExternal[] = [];
  
  const names = [
    { name: '山田太郎', sex: 'M' as const },
    { name: '佐藤花子', sex: 'F' as const },
    { name: '鈴木一郎', sex: 'M' as const },
    { name: '田中美咲', sex: 'F' as const },
    { name: '高橋健太', sex: 'M' as const },
    { name: '渡辺さくら', sex: 'F' as const },
    { name: '伊藤翔太', sex: 'M' as const },
    { name: '中村愛', sex: 'F' as const },
    { name: '小林大輔', sex: 'M' as const },
    { name: '加藤結衣', sex: 'F' as const },
  ];
  
  const brushTypes = ['複合植毛', '大型・幅広・段差植毛', '極細毛・スーパーテーパード毛', '小型・コンパクト'] as const;
  
  // 患者生成
  names.forEach((person, idx) => {
    const age = 25 + Math.floor(Math.random() * 40);
    const birthYear = new Date().getFullYear() - age;
    const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    
    const patient: Patient = {
      id: `patient-${idx + 1}`,
      name: person.name,
      birthday: `${birthYear}-${birthMonth}-${birthDay}`,
      sex: person.sex,
      phone: `090-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      email: `${person.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      brushType: brushTypes[Math.floor(Math.random() * brushTypes.length)],
      followUp: {
        flag: Math.random() > 0.7,
        note: Math.random() > 0.5 ? '要経過観察' : undefined,
      },
      nextAppointment: Math.random() > 0.5 ? getRandomFutureDate() : null,
    };
    
    patients.push(patient);
    
    // ログ生成（過去30日分）
    const logCount = Math.floor(Math.random() * 30) + 10; // 10〜40日分のログ
    const adherenceRate = Math.random(); // 達成率のばらつき
    
    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dateISO = date.toISOString().split('T')[0];
      
      // 達成率に基づいてログを生成
      if (Math.random() < adherenceRate) {
        // 朝のログ
        if (Math.random() > 0.3) {
          logs.push({
            id: `log-${patient.id}-${dateISO}-morning`,
            patientId: patient.id,
            dateISO,
            durationSec: Math.floor(Math.random() * 120) + 60, // 60-180秒
            timeOfDay: 'morning',
            selfRating: (Math.floor(Math.random() * 3) + 3) as 3 | 4 | 5,
            bleeding: Math.random() < 0.1,
            sensitivity: Math.random() < 0.15,
            pain: Math.random() < 0.05,
            source: 'demo',
          });
        }
        
        // 夜のログ
        if (Math.random() > 0.2) {
          logs.push({
            id: `log-${patient.id}-${dateISO}-night`,
            patientId: patient.id,
            dateISO,
            durationSec: Math.floor(Math.random() * 150) + 90, // 90-240秒
            timeOfDay: 'night',
            selfRating: (Math.floor(Math.random() * 3) + 3) as 3 | 4 | 5,
            bleeding: Math.random() < 0.1,
            sensitivity: Math.random() < 0.15,
            pain: Math.random() < 0.05,
            source: 'demo',
          });
        }
      }
    }
  });
  
  return {
    patients,
    logs,
    messages: [],
    version: 'daisan-hygienist-lite-v1',
  };
}

function getRandomFutureDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 60) + 1);
  return date.toISOString().split('T')[0];
}
