import { useNavigate } from 'react-router-dom';
import { useClinicStore } from '../lib/store';
import { downloadJSON } from '../lib/pdf';

export default function Home() {
  const navigate = useNavigate();
  const { patients, generateDemo, exportData, importData } = useClinicStore();

  const handleGenerateDemo = () => {
    if (patients.length > 0) {
      if (!confirm('既存のデータが上書きされます。よろしいですか?')) {
        return;
      }
    }
    generateDemo();
    alert('ダミーデータを生成しました（患者10名、過去30日分のログ）');
  };

  const handleExport = () => {
    const data = exportData();
    const timestamp = new Date().toISOString().split('T')[0];
    downloadJSON(data, `clinic-data-${timestamp}.json`);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.version === 'daisan-hygienist-lite-v1') {
          importData(data);
          alert('データをインポートしました');
        } else {
          alert('無効なデータ形式です');
        }
      } catch (error) {
        alert('データの読み込みに失敗しました');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          第三の衛生士 Lite
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          患者指導の導入・ブラシ選択と磨き具合のモニタリングを、最小の手間で体験
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
            📋 歯ブラシ選択の導入
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            インタラクティブな問診で、患者さんに最適な歯ブラシタイプを推奨します。
          </p>
          <button
            onClick={() => navigate('/intake')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            問診を開始
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-green-600 dark:text-green-400">
            👥 患者モニタリング
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            患者さんの磨き具合を一覧・グラフで確認し、フォローが必要な方を把握します。
          </p>
          <button
            onClick={() => navigate('/patients')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            患者一覧を表示
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          データ管理
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={handleGenerateDemo}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            🎲 ダミーデータ生成
          </button>
          <button
            onClick={handleExport}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            💾 データをエクスポート
          </button>
          <label className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer text-center">
            📂 データをインポート
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
        
        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-2">現在のデータ:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>患者数: {patients.length}名</li>
            <li>データはブラウザのローカルストレージに保存されます</li>
            <li>バックアップとして定期的にエクスポートしてください</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ <strong>注意:</strong> このシステムは医療判断を行うものではありません。
          実際の診断や治療方針は歯科医師の判断を優先してください。
          症状がある場合は必ず歯科医院を受診してください。
        </p>
      </div>
    </div>
  );
}
