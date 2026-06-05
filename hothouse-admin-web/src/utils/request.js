import axios from 'axios'
import { message } from 'antd'
import { API_BASE_URL } from '@/config'

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res.data
  },
  error => {
    message.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export const api = {
  getOverview: () => request.get('/overview'),
  getGreenhouseList: () => request.get('/greenhouse'),
  getGreenhouse: (id) => request.get(`/greenhouse/${id}`),
  updateGreenhouse: (data) => request.put('/greenhouse', data),

  getDeviceList: (params) => request.get('/device', { params }),
  getDeviceByGreenhouse: (greenhouseId) => request.get(`/device/greenhouse/${greenhouseId}`),
  getDevice: (id) => request.get(`/device/${id}`),
  updateDevice: (data) => request.put('/device', data),

  getRealTimeData: (greenhouseId) => request.get(`/control/realtime/${greenhouseId}`),
  getSensorHistory: (greenhouseId, startTime, endTime) =>
    request.get(`/sensor-data/history/${greenhouseId}`, { params: { startTime, endTime } }),

  manualControl: (data) => request.post('/control/manual', data),
  switchMode: (data) => request.post('/control/mode', data),

  getStrategyList: (params) => request.get('/strategy', { params }),
  getActiveStrategies: (greenhouseId) => request.get(`/strategy/active/${greenhouseId}`),
  createStrategy: (data) => request.post('/strategy', data),
  updateStrategy: (data) => request.put('/strategy', data),
  deleteStrategy: (id) => request.delete(`/strategy/${id}`),
  toggleStrategy: (id, status) => request.put(`/strategy/${id}/status`, { status }),

  getActiveAlarms: (greenhouseId) => request.get(`/alarm/active/${greenhouseId}`),
  getAlarmHistory: (greenhouseId, startTime, endTime) =>
    request.get(`/alarm/history/${greenhouseId}`, { params: { startTime, endTime } }),
  handleAlarm: (data) => request.post('/alarm/handle', data),
  getAlarmCount: () => request.get('/alarm/count'),

  getControlHistory: (greenhouseId, startTime, endTime) =>
    request.get(`/control-log/history/${greenhouseId}`, { params: { startTime, endTime } }),
  getDeviceLogs: (deviceCode, limit = 20) =>
    request.get(`/control-log/device/${deviceCode}`, { params: { limit } }),
  getControlLogPage: (params) =>
    request.get('/control-log/page', { params }),
  exportControlLog: (params) =>
    request.get('/control-log/export', { params, responseType: 'blob' }),

  getDeviceLedgerPage: (params) =>
    request.get('/device-ledger/page', { params }),
  getDeviceLedger: (deviceCode) =>
    request.get(`/device-ledger/${deviceCode}`),
  getLedgerTypeStats: () =>
    request.get('/device-ledger/stats/device-type'),
  getNeedMaintenance: () =>
    request.get('/device-ledger/need-maintenance'),

  getMaintenancePlanList: () =>
    request.get('/maintenance/plan/list'),
  getMaintenancePlanByType: (deviceType) =>
    request.get(`/maintenance/plan/device-type/${deviceType}`),
  addMaintenancePlan: (data) =>
    request.post('/maintenance/plan', data),
  updateMaintenancePlan: (id, data) =>
    request.put(`/maintenance/plan/${id}`, data),
  deleteMaintenancePlan: (id) =>
    request.delete(`/maintenance/plan/${id}`),

  getMaintenanceRecordPage: (params) =>
    request.get('/maintenance/record/page', { params }),
  getMaintenanceRecordByDevice: (deviceCode, limit = 10) =>
    request.get(`/maintenance/record/device/${deviceCode}`, { params: { limit } }),
  addMaintenanceRecord: (data) =>
    request.post('/maintenance/record', data),

  getFaultRecordPage: (params) =>
    request.get('/fault-record/page', { params }),
  getFaultRecord: (id) =>
    request.get(`/fault-record/${id}`),
  getFaultByDevice: (deviceCode, limit = 10) =>
    request.get(`/fault-record/device/${deviceCode}`, { params: { limit } }),
  addFaultRecord: (data) =>
    request.post('/fault-record', data),
  updateFaultRecord: (id, data) =>
    request.put(`/fault-record/${id}`, data),
  handleFaultRecord: (id, data) =>
    request.put(`/fault-record/${id}/handle`, data),
  getFaultOverview: () =>
    request.get('/fault-record/overview'),
  getFaultTypeStats: (startTime, endTime) =>
    request.get('/fault-record/stats/fault-type', { params: { startTime, endTime } }),
  getFaultGreenhouseStats: (startTime, endTime) =>
    request.get('/fault-record/stats/greenhouse', { params: { startTime, endTime } }),
  getFaultDailyTrend: (startTime, endTime) =>
    request.get('/fault-record/stats/daily-trend', { params: { startTime, endTime } }),
  getHighFrequencyFaults: (startTime, endTime) =>
    request.get('/fault-record/stats/high-frequency', { params: { startTime, endTime } })
}

export default request
