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

export const taskStatusMap = {
  0: { text: '待执行', color: '#faad14' },
  1: { text: '执行中', color: '#1890ff' },
  2: { text: '已完成', color: '#52c41a' },
  3: { text: '已取消', color: '#999' },
  4: { text: '执行失败', color: '#ff4d4f' }
}

export const taskTypeMap = {
  ENV_ADJUST: { text: '环境调节', color: '#1890ff' },
  FERTIGATION: { text: '水肥作业', color: '#52c41a' },
  OPERATION: { text: '农事操作', color: '#722ed1' }
}

export const triggerSourceMap = {
  AUTO_THRESHOLD: { text: '阈值触发', color: '#fa8c16' },
  AUTO_TIMED: { text: '定时触发', color: '#13c2c2' },
  MANUAL: { text: '人工创建', color: '#722ed1' }
}

export const pestTypeMap = {
  PEST: { text: '虫害', color: '#fa8c16' },
  DISEASE: { text: '病害', color: '#f5222d' }
}

export const severityLevelMap = {
  1: { text: '轻微', color: '#52c41a' },
  2: { text: '中等', color: '#faad14' },
  3: { text: '严重', color: '#fa8c16' },
  4: { text: '极严重', color: '#ff4d4f' }
}

export const qualityLevelMap = {
  1: { text: '特级', color: '#ffd700' },
  2: { text: '一级', color: '#c0c0c0' },
  3: { text: '二级', color: '#cd7f32' },
  4: { text: '三级', color: '#999' }
}

export const logTypeMap = {
  TASK: { text: '任务日志', color: '#1890ff' },
  ENV: { text: '环境日志', color: '#52c41a' },
  OPERATION: { text: '操作日志', color: '#722ed1' },
  YIELD: { text: '产量日志', color: '#fa8c16' }
}

export const handleStatusMap = {
  0: { text: '未处理', color: '#ff4d4f' },
  1: { text: '处理中', color: '#1890ff' },
  2: { text: '已处理', color: '#52c41a' }
}

export const irrigationTaskTypeMap = {
  WATER: { text: '清水灌溉', color: '#1890ff', icon: '💧' },
  FERTIGATION: { text: '水肥一体', color: '#52c41a', icon: '🌱' },
  FLUSH: { text: '管道冲洗', color: '#fa8c16', icon: '🚿' },
  ACID_CLEAN: { text: '酸洗消毒', color: '#722ed1', icon: '🧪' }
}

export const irrigationTaskStatusMap = {
  0: { text: '待执行', color: '#faad14' },
  1: { text: '执行中', color: '#1890ff' },
  2: { text: '已完成', color: '#52c41a' },
  3: { text: '已取消', color: '#999' },
  4: { text: '执行失败', color: '#ff4d4f' }
}

export const irrigationTriggerSourceMap = {
  AUTO_THRESHOLD: { text: '阈值触发', color: '#fa8c16' },
  AUTO_TIMED: { text: '定时触发', color: '#13c2c2' },
  MANUAL: { text: '人工创建', color: '#722ed1' },
  FORMULA: { text: '处方触发', color: '#52c41a' }
}

export const irrigationAlarmTypeMap = {
  SOIL_HUMIDITY_LOW: { text: '土壤湿度过低', color: '#fa8c16' },
  SOIL_HUMIDITY_HIGH: { text: '土壤湿度过高', color: '#1890ff' },
  EC_LOW: { text: 'EC值过低', color: '#faad14' },
  EC_HIGH: { text: 'EC值过高', color: '#ff4d4f' },
  PH_LOW: { text: 'pH值过低', color: '#faad14' },
  PH_HIGH: { text: 'pH值过高', color: '#ff4d4f' },
  WATER_PRESSURE_LOW: { text: '水压过低', color: '#ff4d4f' },
  TANK_EMPTY: { text: '储罐液位过低', color: '#ff4d4f' },
  DEVICE_FAULT: { text: '设备故障', color: '#ff4d4f' },
  TASK_FAILED: { text: '任务执行失败', color: '#ff4d4f' }
}

export const irrigationAlarmLevelMap = {
  1: { text: '提示', color: '#1890ff', icon: 'ℹ️' },
  2: { text: '警告', color: '#faad14', icon: '⚠️' },
  3: { text: '错误', color: '#ff4d4f', icon: '❌' },
  4: { text: '严重', color: '#722ed1', icon: '🔥' }
}

export const tankTypeMap = {
  WATER: { text: '清水罐', color: '#1890ff', icon: '💧' },
  NUTRIENT_A: { text: 'A液罐', color: '#52c41a', icon: '🧪' },
  NUTRIENT_B: { text: 'B液罐', color: '#fa8c16', icon: '🧪' },
  ACID: { text: '酸液罐', color: '#ff4d4f', icon: '🧴' }
}

export const irrigationAreaMap = {
  ZONE_A: { text: 'A区-东区', color: '#1890ff' },
  ZONE_B: { text: 'B区-西区', color: '#52c41a' },
  ZONE_C: { text: 'C区-南区', color: '#fa8c16' },
  ZONE_D: { text: 'D区-北区', color: '#722ed1' }
}
