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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getStatistics, getFlowWarning } from '@/api/admin'
import type { Statistics, FlowWarning } from '@/types'

const stats = ref<Statistics | null>(null)
const flowWarning = ref<FlowWarning | null>(null)

const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']

const maxRegionValue = computed(() => {
  if (!stats.value?.regionStats?.length) return 1
  return Math.max(...stats.value.regionStats.map(r => r.value))
})

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
</style>
