import axios from 'axios'
import { baseUrl, timeout } from '@/config'

const service = axios.create({
  baseURL: baseUrl,
  timeout: timeout
})

service.interceptors.request.use(
  config => {
    uni.showLoading({ title: '加载中...' })
    const token = uni.getStorageSync('token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    uni.hideLoading()
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    uni.hideLoading()
    const res = response.data
    if (res.code !== 200) {
      uni.showToast({
        title: res.message || '请求失败',
        icon: 'none'
      })
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res.data
    }
  },
  error => {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '网络错误',
      icon: 'none'
    })
    return Promise.reject(error)
  }
)

export const request = service

export const api = {
  getOverview: () => request.get('/overview'),
  getGreenhouseList: () => request.get('/greenhouse'),
  getGreenhouse: (id) => request.get(`/greenhouse/${id}`),
  
  getDeviceList: () => request.get('/device'),
  getDeviceByGreenhouse: (greenhouseId) => request.get(`/device/greenhouse/${greenhouseId}`),
  getDevice: (id) => request.get(`/device/${id}`),
  
  getRealTimeData: (greenhouseId) => request.get(`/control/realtime/${greenhouseId}`),
  getSensorHistory: (greenhouseId, startTime, endTime) => 
    request.get(`/sensor-data/history/${greenhouseId}`, { params: { startTime, endTime } }),
  
  manualControl: (data) => request.post('/control/manual', data),
  switchMode: (data) => request.post('/control/mode', data),
  
  getStrategyList: () => request.get('/strategy'),
  getActiveStrategies: (greenhouseId) => request.get(`/strategy/active/${greenhouseId}`),
  
  getActiveAlarms: (greenhouseId) => request.get(`/alarm/active/${greenhouseId}`),
  getAlarmHistory: (greenhouseId, startTime, endTime) =>
    request.get(`/alarm/history/${greenhouseId}`, { params: { startTime, endTime } }),
  handleAlarm: (data) => request.post('/alarm/handle', data),
  getAlarmCount: () => request.get('/alarm/count'),
  
  getControlHistory: (greenhouseId, startTime, endTime) =>
    request.get(`/control-log/history/${greenhouseId}`, { params: { startTime, endTime } }),
  getDeviceLogs: (deviceCode, limit = 20) =>
    request.get(`/control-log/device/${deviceCode}`, { params: { limit } }),

  getNeedMaintenance: () =>
    request.get('/device-ledger/need-maintenance'),
  getDeviceLedger: (deviceCode) =>
    request.get(`/device-ledger/${deviceCode}`),
  getDeviceLedgerPage: (params) =>
    request.get('/device-ledger/page', { params }),

  getMaintenancePlanList: () =>
    request.get('/maintenance/plan/list'),
  getMaintenanceRecordByDevice: (deviceCode, limit = 10) =>
    request.get(`/maintenance/record/device/${deviceCode}`, { params: { limit } }),
  addMaintenanceRecord: (data) =>
    request.post('/maintenance/record', data),

  getFaultRecordPage: (params) =>
    request.get('/fault-record/page', { params }),
  getFaultByDevice: (deviceCode, limit = 10) =>
    request.get(`/fault-record/device/${deviceCode}`, { params: { limit } }),
  handleFaultRecord: (id, data) =>
    request.put(`/fault-record/${id}/handle`, data),
  getFaultOverview: () =>
    request.get('/fault-record/overview'),

  getFarmingHome: (greenhouseId) =>
    request.get(`/mobile/farming/home/${greenhouseId}`),
  getCurrentPrescription: (greenhouseId) =>
    request.get(`/mobile/farming/prescriptions/current/${greenhouseId}`),

  getTaskList: (params) =>
    request.get('/mobile/farming/tasks', { params }),
  getTask: (id) =>
    request.get(`/mobile/farming/tasks/${id}`),
  startTask: (id, executor) =>
    request.post(`/mobile/farming/tasks/${id}/start`, null, { params: { executor } }),
  executeTaskByDevice: (id) =>
    request.post(`/mobile/farming/tasks/${id}/execute`),
  submitTaskFeedback: (id, data) =>
    request.post(`/mobile/farming/tasks/${id}/feedback`, data),
  cancelTask: (id, operator) =>
    request.post(`/mobile/farming/tasks/${id}/cancel`, null, { params: { operator } }),

  getPestList: (params) =>
    request.get('/mobile/farming/pests', { params }),
  getPest: (id) =>
    request.get(`/mobile/farming/pests/${id}`),
  identifyPest: (data) =>
    request.post('/mobile/farming/pests/identify', data),
  getIdentifyRecords: (params) =>
    request.get('/mobile/farming/pests/records', { params }),

  getYieldTrend: (greenhouseId, days) =>
    request.get(`/mobile/farming/yield/trend/${greenhouseId}`, { params: { days } }),
  getYieldList: (params) =>
    request.get('/mobile/farming/yield', { params }),
  saveYield: (data) =>
    request.post('/mobile/farming/yield', data),

  getLogList: (params) =>
    request.get('/mobile/farming/logs', { params }),
  getLogByTask: (taskId) =>
    request.get(`/mobile/farming/logs/task/${taskId}`),
  saveLog: (data) =>
    request.post('/mobile/farming/logs', data)
}

export default api
