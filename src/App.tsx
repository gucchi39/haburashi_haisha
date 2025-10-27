import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useClinicStore } from './lib/store';
import Home from './routes/Home';
import Intake from './routes/Intake';
import Patients from './routes/Patients';
import PatientDetail from './routes/PatientDetail';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const loadData = useClinicStore(state => state.loadData);

  useEffect(() => {
    loadData();
    
    // ダークモードの初期設定
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
  }, [loadData]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router basename="/haburashi_haisha">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  ホーム
                </Link>
                <Link
                  to="/intake"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  歯ブラシ選択
                </Link>
                <Link
                  to="/patients"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  患者一覧
                </Link>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="テーマ切替"
                >
                  {darkMode ? '🌞' : '🌙'}
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/intake" element={<Intake />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
