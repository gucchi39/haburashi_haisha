import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClinicStore } from '../lib/store';
import { calculateMetrics, getLast7DaysAchievementRate } from '../lib/metrics';

type SortKey = 'name' | 'lastLog' | 'achievement7d' | 'consecutive' | 'nextAppointment';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'noLogs' | 'lowAchievement' | 'followUp';

export default function Patients() {
  const { patients, logs } = useClinicStore();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filter, setFilter] = useState<FilterType>('all');

  const patientData = useMemo(() => {
    return patients.map(patient => {
      const patientLogs = logs.filter(log => log.patientId === patient.id);
      const metrics = calculateMetrics(patientLogs, 30);
      const achievement7d = getLast7DaysAchievementRate(patientLogs);
      
      const lastLogDate = patientLogs.length > 0
        ? new Date(Math.max(...patientLogs.map(log => new Date(log.dateISO).getTime())))
        : null;

      return {
        patient,
        metrics,
        achievement7d,
        lastLogDate,
      };
    });
  }, [patients, logs]);

  const filteredAndSorted = useMemo(() => {
    let filtered = patientData;

    // フィルタ適用
    if (filter === 'noLogs') {
      filtered = filtered.filter(d => d.metrics.consecutiveDays === 0);
    } else if (filter === 'lowAchievement') {
      filtered = filtered.filter(d => d.achievement7d < 0.4);
    } else if (filter === 'followUp') {
      filtered = filtered.filter(d => d.patient.followUp?.flag);
    }

    // ソート適用
    const sorted = [...filtered].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortKey) {
        case 'name':
          aVal = a.patient.name;
          bVal = b.patient.name;
          break;
        case 'lastLog':
          aVal = a.lastLogDate?.getTime() || 0;
          bVal = b.lastLogDate?.getTime() || 0;
          break;
        case 'achievement7d':
          aVal = a.achievement7d;
          bVal = b.achievement7d;
          break;
        case 'consecutive':
          aVal = a.metrics.consecutiveDays;
          bVal = b.metrics.consecutiveDays;
          break;
        case 'nextAppointment':
          aVal = a.patient.nextAppointment ? new Date(a.patient.nextAppointment).getTime() : 0;
          bVal = b.patient.nextAppointment ? new Date(b.patient.nextAppointment).getTime() : 0;
          break;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [patientData, sortKey, sortOrder, filter]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('ja-JP');
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  if (patients.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            患者データがありません
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            ホーム画面からダミーデータを生成するか、データをインポートしてください。
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          患者一覧
        </h1>
        
        {/* フィルタボタン */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            すべて ({patientData.length})
          </button>
          <button
            onClick={() => setFilter('noLogs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'noLogs'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            連続0日
          </button>
          <button
            onClick={() => setFilter('lowAchievement')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'lowAchievement'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            低達成率(&lt;40%)
          </button>
          <button
            onClick={() => setFilter('followUp')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'followUp'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            要フォロー
          </button>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  氏名 {sortKey === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('lastLog')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  最終ログ {sortKey === 'lastLog' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('achievement7d')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  7日達成率 {sortKey === 'achievement7d' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('consecutive')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  連続日数 {sortKey === 'consecutive' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('nextAppointment')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  次回予約 {sortKey === 'nextAppointment' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  フラグ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSorted.map(({ patient, metrics, achievement7d, lastLogDate }) => (
                <tr
                  key={patient.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => window.location.href = `/patients/${patient.id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {patient.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(lastLogDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        achievement7d >= 0.7
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : achievement7d >= 0.4
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {formatPercentage(achievement7d)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {metrics.consecutiveDays}日
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {patient.nextAppointment ? formatDate(new Date(patient.nextAppointment)) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {patient.followUp?.flag && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        要フォロー
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          該当する患者がいません
        </div>
      )}
    </div>
  );
}
