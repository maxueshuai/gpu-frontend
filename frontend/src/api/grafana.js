import request from '@/utils/request';

export function getGrafanaDashboard(uid) {
  return request({
    url: `/api/grafana/dashboards/${uid}`,
    method: 'get'
  });
}

export function getGrafanaPanelData(dashboardUid, panelId, timeRange) {
  return request({
    url: `/api/grafana/panels/${dashboardUid}/${panelId}/data`,
    method: 'get',
    params: timeRange
  });
}

export function getServerMetrics(serverId, metrics, timeRange) {
  return request({
    url: `/api/grafana/servers/${serverId}/metrics`,
    method: 'get',
    params: {
      metrics: metrics.join(','),
      ...timeRange
    }
  });
}

export function checkGrafanaHealth() {
  return request({
    url: '/api/grafana/health',
    method: 'get'
  });
} 