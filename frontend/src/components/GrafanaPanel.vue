<template>
  <div class="grafana-panel">
    <div v-if="loading" class="loading">
      <el-spinner></el-spinner>
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else class="panel-content">
      <!-- 嵌入Grafana面板 -->
      <iframe
        v-if="embedUrl"
        :src="embedUrl"
        width="100%"
        :height="height"
        frameborder="0"
        @load="onIframeLoad"
      ></iframe>
      
      <!-- 图表展示区域 -->
      <div v-else-if="chartData" ref="chartContainer" :style="{ height: height + 'px' }">
        <!-- 使用echarts展示数据 -->
      </div>
    </div>
  </div>
</template>

<script>
import { getGrafanaDashboard, getGrafanaPanelData } from '@/api/grafana';
import * as echarts from 'echarts';

export default {
  name: 'GrafanaPanel',
  
  props: {
    dashboardUid: {
      type: String,
      required: true
    },
    panelId: {
      type: [String, Number],
      required: true
    },
    height: {
      type: Number,
      default: 300
    },
    timeRange: {
      type: Object,
      default: () => ({
        from: 'now-1h',
        to: 'now'
      })
    },
    refreshInterval: {
      type: Number,
      default: 0 // 0表示不自动刷新
    },
    useIframe: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      loading: true,
      error: null,
      embedUrl: null,
      chartData: null,
      chart: null,
      refreshTimer: null
    };
  },
  
  computed: {
    panelUrl() {
      if (!this.dashboardUid || !this.panelId) return null;
      const grafanaUrl = process.env.VUE_APP_GRAFANA_URL;
      return `${grafanaUrl}/d-solo/${this.dashboardUid}?panelId=${this.panelId}&from=${this.timeRange.from}&to=${this.timeRange.to}&theme=light`;
    }
  },
  
  watch: {
    timeRange: {
      handler: 'fetchData',
      deep: true
    }
  },
  
  created() {
    this.initPanel();
  },
  
  mounted() {
    if (!this.useIframe) {
      this.initChart();
    }
    this.startAutoRefresh();
  },
  
  beforeDestroy() {
    this.stopAutoRefresh();
    if (this.chart) {
      this.chart.dispose();
    }
  },
  
  methods: {
    async initPanel() {
      try {
        this.loading = true;
        this.error = null;
        
        if (this.useIframe) {
          this.embedUrl = this.panelUrl;
        } else {
          await this.fetchData();
        }
      } catch (error) {
        this.error = error.message || '加载面板失败';
        console.error('初始化Grafana面板失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchData() {
      try {
        const response = await getGrafanaPanelData(
          this.dashboardUid,
          this.panelId,
          this.timeRange
        );
        
        if (response.data) {
          this.chartData = this.transformData(response.data);
          this.updateChart();
        }
      } catch (error) {
        console.error('获取面板数据失败:', error);
        this.error = error.message || '获取数据失败';
      }
    },
    
    transformData(data) {
      // 根据Grafana数据格式转换为echarts数据格式
      if (!data || !data.results) return null;
      
      const series = [];
      for (const result of data.results) {
        const points = result.data.map(point => ({
          value: [new Date(point[0]), point[1]],
        }));
        
        series.push({
          name: result.metric || '数值',
          type: 'line',
          data: points,
          smooth: true,
          showSymbol: false
        });
      }
      
      return series;
    },
    
    initChart() {
      if (!this.$refs.chartContainer) return;
      
      this.chart = echarts.init(this.$refs.chartContainer);
      this.updateChart();
    },
    
    updateChart() {
      if (!this.chart || !this.chartData) return;
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const time = new Date(params[0].value[0]).toLocaleString();
            let html = `${time}<br/>`;
            params.forEach(param => {
              html += `${param.seriesName}: ${param.value[1]}<br/>`;
            });
            return html;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        series: this.chartData
      };
      
      this.chart.setOption(option);
    },
    
    onIframeLoad() {
      this.loading = false;
    },
    
    startAutoRefresh() {
      if (this.refreshInterval > 0) {
        this.refreshTimer = setInterval(() => {
          if (this.useIframe) {
            // 刷新iframe
            const iframe = this.$el.querySelector('iframe');
            if (iframe) {
              iframe.src = iframe.src;
            }
          } else {
            this.fetchData();
          }
        }, this.refreshInterval * 1000);
      }
    },
    
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    }
  }
};
</script>

<style scoped>
.grafana-panel {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
}

.error {
  padding: 20px;
  color: #f56c6c;
  text-align: center;
}

.panel-content {
  width: 100%;
  height: 100%;
}
</style> 