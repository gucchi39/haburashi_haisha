import { Patient, BrushLogExternal, ClinicBundle, ConversationMessage } from '../types';

export function generateDemoData(): ClinicBundle {
  const patients: Patient[] = [];
  const logs: BrushLogExternal[] = [];
  const conversations: ConversationMessage[] = [];
  
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
  
  // 会話履歴の生成（ランダムに数名の患者に会話を追加）
  const conversationTemplates = [
    {
      concern: '出血',
      messages: [
        { role: 'patient' as const, content: '歯磨きすると毎回血が出るんですが、大丈夫でしょうか？' },
        { role: 'assistant' as const, content: '歯茎からの出血は歯周病の初期症状の可能性があります。優しくブラッシングを続けることで改善することが多いです。2週間続けても改善しない場合は、歯科医院を受診することをおすすめします。' },
        { role: 'patient' as const, content: 'わかりました。力を入れすぎていたかもしれません。' },
      ]
    },
    {
      concern: '時間不足',
      messages: [
        { role: 'patient' as const, content: '朝は時間がなくて、1分くらいしか磨けません。' },
        { role: 'assistant' as const, content: '朝の時間がない気持ち、よくわかります。短時間でも効果的に磨くコツは、奥歯の奥側を重点的にすることです。また、夜は3分以上かけて丁寧に磨くことで、トータルでバランスを取ることができますよ。' },
        { role: 'patient' as const, content: '夜はもう少し時間をかけてみます！' },
      ]
    },
    {
      concern: 'モチベーション',
      messages: [
        { role: 'patient' as const, content: '最近、歯磨きをサボりがちです。やる気が出ません。' },
        { role: 'assistant' as const, content: 'モチベーションが下がることは誰にでもあります。小さな目標から始めてみませんか？例えば「夜だけは必ず2分磨く」など。達成できたら自分を褒めてあげてください。継続は力なりです！' },
        { role: 'patient' as const, content: 'まずは夜だけでも頑張ってみます。' },
      ]
    },
    {
      concern: '痛み',
      messages: [
        { role: 'patient' as const, content: '右下の奥歯が磨くとしみて痛いです。' },
        { role: 'assistant' as const, content: '知覚過敏の可能性があります。柔らかめの歯ブラシで優しく磨いてみてください。また、冷たいものを避けることも効果的です。痛みが続く場合は、早めに歯科医院を受診してくださいね。' },
        { role: 'patient' as const, content: '柔らかい歯ブラシに変えてみます。ありがとうございます。' },
      ]
    },
    {
      concern: 'テクニック',
      messages: [
        { role: 'patient' as const, content: '正しい磨き方がわからないです。' },
        { role: 'assistant' as const, content: '基本は「歯ブラシを45度に傾けて、歯と歯茎の境目を優しく磨く」ことです。力は入れすぎず、小刻みに動かすのがコツです。鏡を見ながら1本1本丁寧に磨いてみてください。' },
        { role: 'patient' as const, content: '鏡を見ながらやってみます！' },
      ]
    },
  ];

  // ランダムに5〜7名の患者に会話を追加
  const conversationCount = Math.floor(Math.random() * 3) + 5;
  const shuffledPatients = [...patients].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < Math.min(conversationCount, patients.length); i++) {
    const patient = shuffledPatients[i];
    const template = conversationTemplates[Math.floor(Math.random() * conversationTemplates.length)];
    
    // 過去1〜7日以内のランダムな日時
    const daysAgo = Math.floor(Math.random() * 7);
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - daysAgo);
    
    template.messages.forEach((msg, idx) => {
      const timestamp = new Date(baseDate);
      timestamp.setMinutes(timestamp.getMinutes() + idx * 2); // 2分間隔で会話
      
      conversations.push({
        id: `conv-${patient.id}-${idx}`,
        patientId: patient.id,
        timestamp: timestamp.toISOString(),
        role: msg.role,
        content: msg.content,
        concern: msg.role === 'patient' && idx === 0 ? template.concern : undefined,
      });
    });
  }

  return {
    patients,
    logs,
    messages: [],
    conversations,
    version: 'daisan-hygienist-lite-v1',
  };
}

function getRandomFutureDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 60) + 1);
  return date.toISOString().split('T')[0];
}
