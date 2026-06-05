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
    request.get('/fault-record/stats/high-frequency', { params: { startTime, endTime } }),

  getPrescriptionList: (params) =>
    request.get('/farming/prescription', { params }),
  getPrescriptionDetail: (id) =>
    request.get(`/farming/prescription/${id}`),
  savePrescription: (data) =>
    request.post('/farming/prescription', data),
  updatePrescription: (data) =>
    request.put('/farming/prescription', data),
  copyPrescription: (data) =>
    request.post('/farming/prescription/copy', data),
  publishPrescription: (id) =>
    request.post(`/farming/prescription/${id}/publish`),
  archivePrescription: (id) =>
    request.post(`/farming/prescription/${id}/archive`),
  createNewVersion: (id) =>
    request.post(`/farming/prescription/${id}/new-version`),
  deletePrescription: (id) =>
    request.delete(`/farming/prescription/${id}`),
  getCropVarietyList: () =>
    request.get('/crop-variety/list'),
  getGrowthStages: (varietyId) =>
    request.get(`/crop-variety/${varietyId}/stages`),

  getFarmingLogList: (params) =>
    request.get('/farming/log', { params }),
  getFarmingLog: (id) =>
    request.get(`/farming/log/${id}`),
  getFarmingLogRecent: (greenhouseId, limit) =>
    request.get(`/farming/log/recent/${greenhouseId}`, { params: { limit } }),
  addFarmingLog: (data) =>
    request.post('/farming/log', data),
  deleteFarmingLog: (id) =>
    request.delete(`/farming/log/${id}`),

  getPestDiseaseList: (params) =>
    request.get('/farming/pest', { params }),
  getPestDisease: (id) =>
    request.get(`/farming/pest/${id}`),
  getPestDiseaseByType: (pestType) =>
    request.get(`/farming/pest/type/${pestType}`),
  getPestDiseaseByCrop: (cropName) =>
    request.get(`/farming/pest/crop/${cropName}`),
  getPestDiseaseAll: () =>
    request.get('/farming/pest/list'),
  addPestDisease: (data) =>
    request.post('/farming/pest', data),
  updatePestDisease: (data) =>
    request.put('/farming/pest', data),
  deletePestDisease: (id) =>
    request.delete(`/farming/pest/${id}`),

  getPestIdentifyList: (params) =>
    request.get('/farming/identify', { params }),
  getPestIdentify: (id) =>
    request.get(`/farming/identify/${id}`),
  getPestIdentifyRecent: (greenhouseId, limit) =>
    request.get(`/farming/identify/recent/${greenhouseId}`, { params: { limit } }),
  getPestIdentifyPending: () =>
    request.get('/farming/identify/pending'),
  handlePestIdentify: (id, data) =>
    request.put(`/farming/identify/${id}/handle`, null, { params: data }),
  deletePestIdentify: (id) =>
    request.delete(`/farming/identify/${id}`),

  getYieldRecordList: (params) =>
    request.get('/farming/yield', { params }),
  getYieldRecord: (id) =>
    request.get(`/farming/yield/${id}`),
  getYieldRecordByGreenhouse: (greenhouseId) =>
    request.get(`/farming/yield/greenhouse/${greenhouseId}`),
  getYieldAnalysis: (greenhouseId, varietyId) =>
    request.get(`/farming/yield/analysis/${greenhouseId}/${varietyId}`),
  addYieldRecord: (data) =>
    request.post('/farming/yield', data),
  updateYieldRecord: (data) =>
    request.put('/farming/yield', data),
  deleteYieldRecord: (id) =>
    request.delete(`/farming/yield/${id}`),

  getTaskList: (params) =>
    request.get('/farming/task', { params }),
  getTaskDetail: (id) =>
    request.get(`/farming/task/${id}`),
  getTaskListByGreenhouse: (greenhouseId) =>
    request.get(`/farming/task/greenhouse/${greenhouseId}`),
  getTaskListByGreenhouseAndStatus: (greenhouseId, status) =>
    request.get(`/farming/task/greenhouse/${greenhouseId}/status/${status}`),
  getPendingTaskListByExecutor: (executor) =>
    request.get(`/farming/task/pending/${executor}`),
  createTask: (data) =>
    request.post('/farming/task', data),
  updateTask: (data) =>
    request.put('/farming/task', data),
  startTask: (id, executor) =>
    request.post(`/farming/task/start/${id}`, null, { params: { executor } }),
  executeTaskByDevice: (id) =>
    request.post(`/farming/task/device/${id}`),
  submitTaskFeedback: (data) =>
    request.post('/farming/task/feedback', data),
  cancelTask: (id, operator) =>
    request.post(`/farming/task/cancel/${id}`, null, { params: { operator } }),
  deleteTask: (id) =>
    request.delete(`/farming/task/${id}`)
}

export default request
