import { BrushLogExternal } from '../types';

export interface PatientMetrics {
  achievementDays: number;
  totalDays: number;
  achievementRate: number;
  avgDurationSec: number;
  morningCoverageRate: number;
  nightCoverageRate: number;
  avgSelfRating: number;
  bleedingRate: number;
  sensitivityRate: number;
  consecutiveDays: number;
}

export function calculateMetrics(logs: BrushLogExternal[], days: number = 30): PatientMetrics {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // 期間内のログをフィルタ
  const relevantLogs = logs.filter(log => {
    const logDate = new Date(log.dateISO);
    return logDate >= startDate && logDate <= endDate;
  });
  
  // 日付ごとにグループ化
  const logsByDate = new Map<string, BrushLogExternal[]>();
  relevantLogs.forEach(log => {
    const existing = logsByDate.get(log.dateISO) || [];
    existing.push(log);
    logsByDate.set(log.dateISO, existing);
  });
  
  const achievementDays = logsByDate.size;
  const achievementRate = achievementDays / days;
  
  // 平均所要時間
  const avgDurationSec = relevantLogs.length > 0
    ? relevantLogs.reduce((sum, log) => sum + log.durationSec, 0) / relevantLogs.length
    : 0;
  
  // 朝晩カバー率
  const morningLogs = relevantLogs.filter(log => log.timeOfDay === 'morning');
  const nightLogs = relevantLogs.filter(log => log.timeOfDay === 'night');
  const morningCoverageRate = morningLogs.length / days;
  const nightCoverageRate = nightLogs.length / days;
  
  // 自己評価平均
  const avgSelfRating = relevantLogs.length > 0
    ? relevantLogs.reduce((sum, log) => sum + log.selfRating, 0) / relevantLogs.length
    : 0;
  
  // 出血・しみた率
  const bleedingCount = relevantLogs.filter(log => log.bleeding).length;
  const sensitivityCount = relevantLogs.filter(log => log.sensitivity).length;
  const bleedingRate = relevantLogs.length > 0 ? bleedingCount / relevantLogs.length : 0;
  const sensitivityRate = relevantLogs.length > 0 ? sensitivityCount / relevantLogs.length : 0;
  
  // 連続日数（最新から）
  const consecutiveDays = calculateConsecutiveDays(logs);
  
  return {
    achievementDays,
    totalDays: days,
    achievementRate,
    avgDurationSec,
    morningCoverageRate,
    nightCoverageRate,
    avgSelfRating,
    bleedingRate,
    sensitivityRate,
    consecutiveDays,
  };
}

function calculateConsecutiveDays(logs: BrushLogExternal[]): number {
  if (logs.length === 0) return 0;
  
  // 日付のユニークなセットを作成し、降順ソート
  const uniqueDates = Array.from(new Set(logs.map(log => log.dateISO))).sort().reverse();
  
  if (uniqueDates.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  // 今日のログがない場合は0
  if (uniqueDates[0] !== todayStr) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // 昨日もない場合は0
    if (uniqueDates[0] !== yesterdayStr) {
      return 0;
    }
  }
  
  let consecutive = 0;
  let currentDate = new Date(uniqueDates[0]);
  
  for (const dateStr of uniqueDates) {
    const expectedDateStr = currentDate.toISOString().split('T')[0];
    
    if (dateStr === expectedDateStr) {
      consecutive++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return consecutive;
}

export function getLast7DaysAchievementRate(logs: BrushLogExternal[]): number {
  const metrics = calculateMetrics(logs, 7);
  return metrics.achievementRate;
}
