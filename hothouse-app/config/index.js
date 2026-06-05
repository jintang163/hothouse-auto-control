export const baseUrl = 'http://localhost:8080/api'

export const wsUrl = 'ws://localhost:8080/api/ws/realtime'

export const timeout = 10000

export const greenhouseList = [
  { id: 1, name: '1号大棚', code: 'GH001' },
  { id: 2, name: '2号大棚', code: 'GH002' },
  { id: 3, name: '3号大棚', code: 'GH003' }
]

export const deviceTypeMap = {
  1: { name: '风机', icon: 'wind' },
  2: { name: '湿帘', icon: 'water' },
  3: { name: '遮阳网', icon: 'sun' },
  10: { name: '温度传感器', icon: 'thermometer' },
  11: { name: '湿度传感器', icon: 'drop' },
  99: { name: '网关', icon: 'wifi' }
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
