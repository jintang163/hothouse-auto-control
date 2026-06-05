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
