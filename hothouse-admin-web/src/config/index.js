export const API_BASE_URL = '/api'

export const WS_URL = 'ws://localhost:8080/api/ws/realtime'

export const greenhouseList = [
  { id: 1, name: '1号大棚', code: 'GH001' },
  { id: 2, name: '2号大棚', code: 'GH002' },
  { id: 3, name: '3号大棚', code: 'GH003' }
]

export const deviceTypeMap = {
  1: { name: '风机', icon: 'fan' },
  2: { name: '湿帘', icon: 'wet' },
  3: { name: '遮阳网', icon: 'shade' },
  10: { name: '温度传感器', icon: 'temp' },
  11: { name: '湿度传感器', icon: 'humidity' },
  12: { name: '光照传感器', icon: 'light' },
  99: { name: '网关', icon: 'gateway' }
}

export const deviceStatusMap = {
  0: { text: '离线', color: '#999' },
  1: { text: '在线', color: '#52c41a' },
  2: { text: '运行中', color: '#1890ff' },
  3: { text: '故障', color: '#ff4d4f' }
}

export const alarmLevelMap = {
  1: { text: '提示', color: '#1890ff' },
  2: { text: '警告', color: '#faad14' },
  3: { text: '错误', color: '#ff4d4f' },
  4: { text: '严重', color: '#722ed1' }
}

export const controlModeMap = {
  0: { text: '手动', color: '#faad14' },
  1: { text: '自动', color: '#52c41a' },
  2: { text: '定时', color: '#1890ff' }
}

export const maintenanceStatusMap = {
  0: { text: '正常', color: '#52c41a' },
  1: { text: '待保养', color: '#faad14' },
  2: { text: '已超期', color: '#ff4d4f' }
}

export const maintenanceTypeMap = {
  '润滑': { text: '润滑', color: '#1890ff' },
  '清洁': { text: '清洁', color: '#52c41a' },
  '检修': { text: '检修', color: '#faad14' },
  '更换': { text: '更换', color: '#ff4d4f' }
}

export const faultLevelMap = {
  1: { text: '轻微', color: '#1890ff' },
  2: { text: '一般', color: '#faad14' },
  3: { text: '严重', color: '#ff4d4f' }
}

export const faultStatusMap = {
  0: { text: '未处理', color: '#ff4d4f' },
  1: { text: '处理中', color: '#faad14' },
  2: { text: '已解决', color: '#52c41a' }
}

export const prescriptionStatusMap = {
  0: { text: '草稿', color: '#faad14' },
  1: { text: '已发布', color: '#52c41a' },
  2: { text: '已归档', color: '#722ed1' }
}

export const taskStatusMap = {
  0: { text: '待执行', color: '#faad14' },
  1: { text: '执行中', color: '#1890ff' },
  2: { text: '已完成', color: '#52c41a' },
  3: { text: '已取消', color: '#999' },
  4: { text: '已逾期', color: '#ff4d4f' }
}

export const environmentIndicatorMap = {
  temperature: { name: '温度', unit: '℃' },
  humidity: { name: '湿度', unit: '%' },
  light: { name: '光照', unit: 'lux' },
  co2: { name: 'CO2浓度', unit: 'ppm' },
  soil_temperature: { name: '土壤温度', unit: '℃' },
  soil_moisture: { name: '土壤湿度', unit: '%' },
  ph: { name: 'pH值', unit: '' },
  ec: { name: 'EC值', unit: 'mS/cm' }
}

export const fertilizerTypeMap = {
  nitrogen: { name: '氮肥', unit: 'kg/亩' },
  phosphorus: { name: '磷肥', unit: 'kg/亩' },
  potassium: { name: '钾肥', unit: 'kg/亩' },
  compound: { name: '复合肥', unit: 'kg/亩' },
  organic: { name: '有机肥', unit: 'kg/亩' },
  microelement: { name: '微量元素肥', unit: 'kg/亩' },
  foliar: { name: '叶面肥', unit: 'g/亩' },
  water: { name: '灌溉用水', unit: 'm³/亩' }
}

export const operationTypeMap = {
  pruning: { name: '整枝打杈' },
  pollination: { name: '授粉' },
  thinning: { name: '间苗定苗' },
  transplanting: { name: '移栽' },
  weeding: { name: '除草' },
  pest_control: { name: '病虫害防治' },
  harvest: { name: '采收' },
  cleaning: { name: '清洁田园' },
  mulching: { name: '覆膜' },
  trellis: { name: '搭架' },
  pruning_leaves: { name: '打叶' },
  bud_picking: { name: '摘心' }
}

export const logTypeMap = {
  TASK: { text: '任务日志', color: '#1890ff' },
  ENV: { text: '环境日志', color: '#52c41a' },
  OPERATION: { text: '操作日志', color: '#faad14' },
  YIELD: { text: '产量日志', color: '#722ed1' }
}

export const pestTypeMap = {
  PEST: { text: '虫害', color: '#fa8c16' },
  DISEASE: { text: '病害', color: '#f5222d' }
}

export const severityLevelMap = {
  1: { text: '轻微', color: '#52c41a' },
  2: { text: '一般', color: '#faad14' },
  3: { text: '严重', color: '#f5222d' }
}

export const handleStatusMap = {
  0: { text: '待处理', color: '#ff4d4f' },
  1: { text: '处理中', color: '#faad14' },
  2: { text: '已处理', color: '#52c41a' }
}

export const identifyMethodMap = {
  AI: { text: '智能识别', color: '#1890ff' },
  MANUAL: { text: '人工判定', color: '#722ed1' }
}

export const qualityLevelMap = {
  1: { text: '特级', color: '#722ed1' },
  2: { text: '一级', color: '#1890ff' },
  3: { text: '二级', color: '#52c41a' },
  4: { text: '三级', color: '#faad14' }
}

export const pestStatusMap = {
  0: { text: '禁用', color: '#ff4d4f' },
  1: { text: '启用', color: '#52c41a' }
}

export const cropList = [
  { id: 1, name: '番茄' },
  { id: 2, name: '黄瓜' },
  { id: 3, name: '茄子' },
  { id: 4, name: '辣椒' },
  { id: 5, name: '草莓' },
  { id: 6, name: '西瓜' },
  { id: 7, name: '甜瓜' },
  { id: 8, name: '生菜' }
]

export const taskStatusMap = {
  0: { text: '待执行', color: 'default' },
  1: { text: '执行中', color: 'processing' },
  2: { text: '已完成', color: 'success' },
  3: { text: '已取消', color: 'warning' },
  4: { text: '执行失败', color: 'error' }
}

export const taskPriorityMap = {
  1: { text: '低', color: 'blue' },
  2: { text: '中', color: 'orange' },
  3: { text: '高', color: 'red' },
  4: { text: '紧急', color: 'magenta' }
}

export const taskTypeMap = {
  ENV_ADJUST: { text: '环境调节', color: '#1890ff' },
  FERTIGATION: { text: '水肥作业', color: '#52c41a' },
  OPERATION: { text: '农事操作', color: '#faad14' }
}

export const triggerSourceMap = {
  AUTO_THRESHOLD: { text: '阈值触发', color: '#722ed1' },
  AUTO_TIMED: { text: '定时触发', color: '#13c2c2' },
  MANUAL: { text: '人工创建', color: '#fa8c16' }
}

export const executionMethodMap = {
  MANUAL: { text: '人工执行', color: '#1890ff' },
  AUTO: { text: '自动执行', color: '#52c41a' }
}
