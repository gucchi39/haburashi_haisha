import { useParams, Link } from 'react-router-dom';
import { useClinicStore } from '../lib/store';
import { calculateMetrics } from '../lib/metrics';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useMemo, useState } from 'react';
import { generatePDF } from '../lib/pdf';

// Chart.js登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const { patients, updatePatient, getPatientLogs, getPatientMessages, getPatientConversations } = useClinicStore();
  const [followUpNote, setFollowUpNote] = useState('');

  const patient = patients.find(p => p.id === id);
  const patientLogs = useMemo(() => getPatientLogs(id || ''), [id, getPatientLogs]);
  const patientMessages = useMemo(() => getPatientMessages(id || ''), [id, getPatientMessages]);
  const patientConversations = useMemo(() => getPatientConversations(id || ''), [id, getPatientConversations]);
  const metrics = useMemo(() => calculateMetrics(patientLogs, 30), [patientLogs]);

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            患者が見つかりません
          </h1>
          <Link
            to="/patients"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            患者一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  // 過去30日分のデータを生成
  const chartData = useMemo(() => {
    const days = 30;
    const dates: string[] = [];
    const durations: (number | null)[] = [];
    const hasMorning: boolean[] = [];
    const hasNight: boolean[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
      
      const dayLogs = patientLogs.filter(log => log.dateISO === dateStr);
      const totalDuration = dayLogs.reduce((sum, log) => sum + log.durationSec, 0);
      
      durations.push(dayLogs.length > 0 ? totalDuration / 60 : null);
      hasMorning.push(dayLogs.some(log => log.timeOfDay === 'morning'));
      hasNight.push(dayLogs.some(log => log.timeOfDay === 'night'));
    }

    return {
      labels: dates.map(d => new Date(d).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })),
      datasets: [
        {
          label: '所要時間（分）',
          data: durations,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          spanGaps: true,
        },
      ],
    };
  }, [patientLogs]);

  const handleFollowUpToggle = () => {
    updatePatient(patient.id, {
      followUp: {
        flag: !patient.followUp?.flag,
        note: patient.followUp?.note,
      },
    });
  };

  const handleSaveNote = () => {
    updatePatient(patient.id, {
      followUp: {
        flag: patient.followUp?.flag || false,
        note: followUpNote,
      },
    });
    alert('メモを保存しました');
  };

  const handleExportPDF = async () => {
    await generatePDF('patient-detail-content', `patient-report-${patient.name}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}分${secs}秒`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6 flex justify-between items-center no-print">
        <Link
          to="/patients"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← 患者一覧に戻る
        </Link>
        <button
          onClick={handleExportPDF}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          📄 PDF出力
        </button>
      </div>

      <div id="patient-detail-content">
        {/* 患者情報 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {patient.name}
          </h1>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">生年月日:</span>{' '}
              <span className="text-gray-900 dark:text-white">
                {patient.birthday || '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">性別:</span>{' '}
              <span className="text-gray-900 dark:text-white">
                {patient.sex === 'M' ? '男性' : patient.sex === 'F' ? '女性' : 'その他'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">推奨ブラシ:</span>{' '}
              <span className="text-gray-900 dark:text-white font-medium">
                {patient.brushType || '未設定'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">電話:</span>{' '}
              <span className="text-gray-900 dark:text-white">{patient.phone || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">次回予約:</span>{' '}
              <span className="text-gray-900 dark:text-white">
                {patient.nextAppointment
                  ? new Date(patient.nextAppointment).toLocaleDateString('ja-JP')
                  : '-'}
              </span>
            </div>
            <div>
              <label className="flex items-center space-x-2 cursor-pointer no-print">
                <input
                  type="checkbox"
                  checked={patient.followUp?.flag || false}
                  onChange={handleFollowUpToggle}
                  className="rounded"
                />
                <span className="text-gray-900 dark:text-white">要フォロー</span>
              </label>
            </div>
          </div>
        </div>

        {/* KPIカード */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">達成日数</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {metrics.achievementDays}/{metrics.totalDays}日
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              {formatPercentage(metrics.achievementRate)}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">平均所要時間</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatDuration(metrics.avgDurationSec)}
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">朝晩カバー率</div>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
              朝: {formatPercentage(metrics.morningCoverageRate)}
            </div>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
              夜: {formatPercentage(metrics.nightCoverageRate)}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
            <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">連続日数</div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {metrics.consecutiveDays}日
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              評価平均: {metrics.avgSelfRating.toFixed(1)}
            </div>
          </div>
        </div>

        {/* グラフ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            過去30日の実施状況
          </h2>
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: '所要時間（分）',
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: '日付',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* 症状統計 */}
        {(metrics.bleedingRate > 0 || metrics.sensitivityRate > 0) && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 mb-6 border border-red-200 dark:border-red-700">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              症状の発生率
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-red-700 dark:text-red-300">出血:</span>{' '}
                <span className="font-bold text-red-900 dark:text-red-100">
                  {formatPercentage(metrics.bleedingRate)}
                </span>
              </div>
              <div>
                <span className="text-red-700 dark:text-red-300">しみる:</span>{' '}
                <span className="font-bold text-red-900 dark:text-red-100">
                  {formatPercentage(metrics.sensitivityRate)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 仮想衛生士との会話履歴 */}
        {patientConversations.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 mb-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="text-2xl mr-2">💬</span>
                仮想衛生士との会話履歴
              </h3>
              {patientConversations.find(c => c.concern) && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  困りごと: {patientConversations.find(c => c.concern)?.concern}
                </span>
              )}
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {patientConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex ${conv.role === 'patient' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] ${
                    conv.role === 'patient'
                      ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      : 'bg-blue-500 dark:bg-blue-600 text-white'
                  } rounded-lg p-4 shadow-sm`}>
                    <div className="flex items-center mb-1">
                      <span className="text-xs font-semibold">
                        {conv.role === 'patient' ? '👤 患者さん' : '🦷 仮想衛生士'}
                      </span>
                      <span className={`text-xs ml-2 ${
                        conv.role === 'patient' ? 'text-gray-500 dark:text-gray-400' : 'text-blue-100'
                      }`}>
                        {new Date(conv.timestamp).toLocaleString('ja-JP', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      conv.role === 'patient' ? 'text-gray-700 dark:text-gray-300' : 'text-white'
                    }`}>
                      {conv.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                💡 <strong>衛生士メモ:</strong> 会話から患者さんの困りごとや悩みを把握し、次回の診療でフォローアップできます。
              </p>
            </div>
          </div>
        )}

        {/* アバター要旨 */}
        {patientMessages.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              直近のアドバイス要旨
            </h3>
            <div className="space-y-3">
              {patientMessages.slice(0, 3).map((msg, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {new Date(msg.createdAt).toLocaleString('ja-JP')}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{msg.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* フォローアップメモ */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 no-print">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          フォローアップメモ
        </h3>
        <textarea
          value={followUpNote || patient.followUp?.note || ''}
          onChange={(e) => setFollowUpNote(e.target.value)}
          className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="フォローアップが必要な事項を記入..."
        />
        <button
          onClick={handleSaveNote}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          メモを保存
        </button>
      </div>
    </div>
  );
}
