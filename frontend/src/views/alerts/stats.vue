<template>
  <div class="alert-stats-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日告警数</span>
              <el-tag type="danger">{{ stats.today }}</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="trend">
              <span>较昨日</span>
              <span :class="getTrendClass(stats.today_trend)">
                {{ formatTrend(stats.today_trend) }}
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>本周告警数</span>
              <el-tag type="warning">{{ stats.week_count }}</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="trend">
              <span>较上周</span>
              <span :class="getTrendClass(stats.week_trend)">
                {{ formatTrend(stats.week_trend) }}
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>本月告警数</span>
              <el-tag type="info">{{ stats.month_count }}</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="trend">
              <span>较上月</span>
              <span :class="getTrendClass(stats.month_trend)">
                {{ formatTrend(stats.month_trend) }}
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>告警恢复率</span>
              <el-tag type="success">{{ stats.recovery_rate }}%</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="trend">
              <span>较上月</span>
              <span :class="getTrendClass(stats.recovery_trend)">
                {{ formatTrend(stats.recovery_trend) }}
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>告警类型分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="typeChartRef" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>告警级别分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="levelChartRef" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>告警趋势</span>
              <el-radio-group v-model="trendType" size="small">
                <el-radio-button label="day">按天</el-radio-button>
                <el-radio-button label="week">按周</el-radio-button>
                <el-radio-button label="month">按月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <div ref="trendChartRef" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getAlertStats } from '@/api/alerts'

const stats = ref({
  today: 0,
  severe: 0,
  warning: 0,
  total: 0,
  handled: 0,
  unhandled: 0
})

const trendType = ref('day')
const typeChartRef = ref(null)
const levelChartRef = ref(null)
const trendChartRef = ref(null)
let typeChart = null
let levelChart = null
let trendChart = null

// 获取趋势样式
const getTrendClass = (trend) => {
  if (trend > 0) return 'up'
  if (trend < 0) return 'down'
  return ''
}

// 格式化趋势
const formatTrend = (trend) => {
  if (trend > 0) return `+${trend}%`
  if (trend < 0) return `${trend}%`
  return '0%'
}

// 初始化类型分布图表
const initTypeChart = () => {
  if (!typeChartRef.value) return
  
  typeChart = echarts.init(typeChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: stats.value.type_distribution,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  typeChart.setOption(option)
}

// 初始化级别分布图表
const initLevelChart = () => {
  if (!levelChartRef.value) return
  
  levelChart = echarts.init(levelChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: stats.value.level_distribution,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  levelChart.setOption(option)
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: stats.value.trend_data.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: stats.value.trend_data.map(item => item.count),
        type: 'line',
        smooth: true
      }
    ]
  }
  trendChart.setOption(option)
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await getAlertStats()
    // 兼容后端返回的字段
    stats.value = {
      today: res.today || 0,
      severe: res.severe || 0,
      warning: res.warning || 0,
      total: res.total || 0,
      handled: res.handled || 0,
      unhandled: res.unhandled || 0
    }
  } catch (error) {
    stats.value = {
      today: 0,
      severe: 0,
      warning: 0,
      total: 0,
      handled: 0,
      unhandled: 0
    }
  }
}

// 监听趋势类型变化
watch(trendType, () => {
  fetchStats()
})

// 监听窗口大小变化
const handleResize = () => {
  typeChart?.resize()
  levelChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  fetchStats()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  typeChart?.dispose()
  levelChart?.dispose()
  trendChart?.dispose()
})
</script>

<style lang="scss" scoped>
.alert-stats-container {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-content {
    .trend {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      font-size: 14px;
      color: #909399;
      
      .up {
        color: #f56c6c;
      }
      
      .down {
        color: #67c23a;
      }
    }
  }
  
  .chart-row {
    margin-top: 20px;
  }
  
  .chart-container {
    height: 300px;
    
    .chart {
      width: 100%;
      height: 100%;
    }
  }
}
</style> 