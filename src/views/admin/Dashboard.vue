<template>
  <div class="dashboard">
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon orders">📋</div>
        <div class="stat-info">
          <span class="stat-label">今日订单</span>
          <span class="stat-value">{{ stats?.todayOrders || 0 }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon income">💰</div>
        <div class="stat-info">
          <span class="stat-label">今日收入</span>
          <span class="stat-value">¥{{ (stats?.todayIncome || 0).toFixed(2) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon month">📈</div>
        <div class="stat-info">
          <span class="stat-label">本月收入</span>
          <span class="stat-value">¥{{ (stats?.monthIncome || 0).toFixed(2) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon users">👥</div>
        <div class="stat-info">
          <span class="stat-label">总用户数</span>
          <span class="stat-value">{{ stats?.totalUsers || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Flow Warning -->
    <div v-if="flowWarning?.warning" :class="['warning-card', `level-${flowWarning.level.toLowerCase()}`]">
      <div class="warning-icon">⚠️</div>
      <div class="warning-info">
        <span class="warning-title">客流预警 - {{ flowWarning.level }}</span>
        <span class="warning-message">{{ flowWarning.message }}</span>
        <span class="warning-detail">今日预约人数：{{ flowWarning.count }}</span>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <div class="chart-card">
        <h3>票种销售占比</h3>
        <div class="chart-content">
          <div v-if="stats?.ticketTypeStats?.length" class="pie-chart">
            <div v-for="(item, index) in stats.ticketTypeStats" :key="index" class="pie-item">
              <span class="pie-color" :style="{ background: colors[index % colors.length] }"></span>
              <span class="pie-name">{{ item.name }}</span>
              <span class="pie-value">{{ item.value }}</span>
            </div>
          </div>
          <p v-else class="no-data">暂无数据</p>
        </div>
      </div>
      <div class="chart-card">
        <h3>游客地域分布</h3>
        <div class="chart-content">
          <div v-if="stats?.regionStats?.length" class="bar-chart">
            <div v-for="(item, index) in stats.regionStats" :key="index" class="bar-item">
              <span class="bar-name">{{ item.name }}</span>
              <div class="bar-track">
                <div 
                  class="bar-fill" 
                  :style="{ 
                    width: `${(item.value / maxRegionValue) * 100}%`,
                    background: colors[index % colors.length]
                  }"
                ></div>
              </div>
              <span class="bar-value">{{ item.value }}</span>
            </div>
          </div>
          <p v-else class="no-data">暂无数据</p>
        </div>
      </div>
    </div>

    <!-- Trend Charts -->
    <div class="trend-section">
      <div class="trend-header">
        <h3>数据趋势统计</h3>
        <div class="period-toggle">
          <button :class="['toggle-btn', { active: trendPeriod === 'week' }]" @click="switchPeriod('week')">一周</button>
          <button :class="['toggle-btn', { active: trendPeriod === 'month' }]" @click="switchPeriod('month')">一月</button>
        </div>
      </div>
      <div class="trend-grid">
        <div class="trend-card" v-for="metric in trendMetrics" :key="metric.key">
          <div class="trend-card-title">
            <span class="trend-icon">{{ metric.icon }}</span>
            {{ metric.label }}
          </div>
          <div class="trend-chart-wrap">
            <svg v-if="trendChartData(metric.key)" :viewBox="`0 0 ${SVG_W} ${SVG_H}`" class="trend-svg" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line
                v-for="i in 4" :key="'h'+i"
                :x1="PAD_L" :y1="PAD_T + ((SVG_H - PAD_T - PAD_B) / 4) * (i - 1)"
                :x2="SVG_W - PAD_R" :y2="PAD_T + ((SVG_H - PAD_T - PAD_B) / 4) * (i - 1)"
                class="grid-line"
              />
              <!-- Y-axis labels -->
              <text
                v-for="i in 5" :key="'yl'+i"
                :x="PAD_L - 6"
                :y="PAD_T + ((SVG_H - PAD_T - PAD_B) / 4) * (i - 1) + 4"
                class="axis-label" text-anchor="end"
              >{{ yLabel(metric.key, i - 1) }}</text>
              <!-- Area fill -->
              <path
                v-if="trendChartData(metric.key)"
                :d="trendAreaPath(metric.key)"
                :fill="metric.color + '20'"
              />
              <!-- Line -->
              <path
                v-if="trendChartData(metric.key)"
                :d="trendLinePath(metric.key)"
                :stroke="metric.color"
                fill="none"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <!-- Dots + tooltips -->
              <g v-for="(pt, idx) in trendChartData(metric.key)!.points" :key="'pt'+idx" class="dot-group">
                <circle :cx="pt.x" :cy="pt.y" r="4" :fill="metric.color" />
                <text :x="pt.x" :y="SVG_H - PAD_B + 14" class="axis-label" text-anchor="middle">{{ pt.dateLabel }}</text>
                <title>{{ pt.dateLabel }}: {{ metric.key === 'income' ? '¥' + pt.value.toFixed(2) : pt.value }}</title>
              </g>
            </svg>
            <p v-else class="no-data">暂无数据</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getStatistics, getFlowWarning, getTrendStatistics } from '@/api/admin'
import type { Statistics, FlowWarning, TrendStatistics, TrendDataPoint } from '@/types'

const stats = ref<Statistics | null>(null)
const flowWarning = ref<FlowWarning | null>(null)
const trendData = ref<TrendStatistics | null>(null)
const trendPeriod = ref<'week' | 'month'>('week')

const colors = ['#10b981', '#06b6d4', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6']

// SVG chart constants
const SVG_W = 400
const SVG_H = 200
const PAD_L = 50
const PAD_R = 16
const PAD_T = 16
const PAD_B = 36

function formatDateLabel(date: string): string {
  const match = date.match(/\d{4}-(\d{2}-\d{2})/)
  return match?.[1] ?? date
}

const trendMetrics = [
  { key: 'orders',  label: '订单数',  icon: '📋', color: '#06b6d4' },
  { key: 'income',  label: '收入(¥)', icon: '💰', color: '#10b981' },
  { key: 'users',   label: '用户数',  icon: '👥', color: '#8b5cf6' },
  { key: 'visitors', label: '入园人数', icon: '🎫', color: '#f97316' },
] as const

type MetricKey = typeof trendMetrics[number]['key']

function getPoints(key: MetricKey): TrendDataPoint[] {
  if (!trendData.value) return []
  const dates = trendData.value.dates ?? []
  const values: number[] = trendData.value[key] ?? []
  const len = Math.min(dates.length, values.length)
  return dates.slice(0, len).map((date, i) => ({ date, value: Number(values[i]) }))
}

interface ChartPoint { x: number; y: number; value: number; dateLabel: string }

function trendChartData(key: MetricKey): { points: ChartPoint[]; minVal: number; maxVal: number } | null {
  const pts = getPoints(key)
  if (!pts.length) return null
  const values = pts.map(p => p.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = maxVal - minVal || 1
  const chartW = SVG_W - PAD_L - PAD_R
  const chartH = SVG_H - PAD_T - PAD_B
  const points: ChartPoint[] = pts.map((p, i) => ({
    x: PAD_L + (pts.length === 1 ? chartW / 2 : (i / (pts.length - 1)) * chartW),
    y: PAD_T + chartH - ((p.value - minVal) / range) * chartH,
    value: p.value,
    dateLabel: formatDateLabel(p.date),
  }))
  return { points, minVal, maxVal }
}

function trendLinePath(key: MetricKey): string {
  const data = trendChartData(key)
  if (!data) return ''
  return data.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

function trendAreaPath(key: MetricKey): string {
  const data = trendChartData(key)
  if (!data || !data.points.length) return ''
  const pts = data.points
  const first = pts[0]
  const last = pts[pts.length - 1]
  if (!first || !last) return ''
  const bottom = SVG_H - PAD_B
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  return `${line} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`
}

function yLabel(key: MetricKey, step: number): string {
  const data = trendChartData(key)
  if (!data) return ''
  const val = data.maxVal - ((data.maxVal - data.minVal) / 4) * step
  return key === 'income' ? val.toFixed(0) : Math.round(val).toString()
}

const maxRegionValue = computed(() => {
  if (!stats.value?.regionStats?.length) return 1
  return Math.max(...stats.value.regionStats.map(r => r.value))
})

async function loadTrend() {
  try {
    const res = await getTrendStatistics(trendPeriod.value)
    trendData.value = res.data
  } catch (e) {
    console.error('Failed to load trend data:', e)
  }
}

async function switchPeriod(period: 'week' | 'month') {
  trendPeriod.value = period
  await loadTrend()
}

const loadData = async () => {
  try {
    const [statsRes, warningRes] = await Promise.all([
      getStatistics(),
      getFlowWarning()
    ])
    stats.value = statsRes.data
    flowWarning.value = warningRes.data
  } catch (e) {
    console.error('Failed to load dashboard data:', e)
  }
}

onMounted(() => {
  loadData()
  loadTrend()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.orders { background: #e3f2fd; }
.stat-icon.income { background: #e8f5e9; }
.stat-icon.month { background: #fff3e0; }
.stat-icon.users { background: #fce4ec; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}

.warning-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid;
}

.warning-card.level-low {
  border-color: #4caf50;
  background: #e8f5e9;
}

.warning-card.level-medium {
  border-color: #ff9800;
  background: #fff3e0;
}

.warning-card.level-high {
  border-color: #f44336;
  background: #ffebee;
}

.warning-icon {
  font-size: 32px;
}

.warning-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.warning-title {
  font-weight: 600;
  color: #1a1a2e;
}

.warning-message {
  color: #666;
}

.warning-detail {
  color: #999;
  font-size: 14px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-card h3 {
  margin: 0 0 16px;
  color: #1a1a2e;
  font-size: 16px;
}

.chart-content {
  min-height: 200px;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 60px 0;
}

.pie-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pie-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pie-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.pie-name {
  flex: 1;
  color: #333;
}

.pie-value {
  color: #666;
  font-weight: 500;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-name {
  width: 80px;
  color: #333;
  font-size: 14px;
}

.bar-track {
  flex: 1;
  height: 20px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.bar-value {
  width: 50px;
  text-align: right;
  color: #666;
  font-weight: 500;
}

/* Trend section */
.trend-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.trend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.trend-header h3 {
  margin: 0;
  color: #1a1a2e;
  font-size: 16px;
}

.period-toggle {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  padding: 6px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: #f5f5f5;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: #10b981;
  border-color: #10b981;
  color: #fff;
}

.trend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
}

.trend-card {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 14px;
  background: #fafafa;
}

.trend-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.trend-icon {
  font-size: 18px;
}

.trend-chart-wrap {
  width: 100%;
}

.trend-svg {
  width: 100%;
  height: 200px;
  display: block;
  overflow: visible;
}

.grid-line {
  stroke: #e5e7eb;
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.axis-label {
  font-size: 11px;
  fill: #9ca3af;
}

.dot-group:hover circle {
  r: 6;
}
</style>
