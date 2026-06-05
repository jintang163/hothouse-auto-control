import { useState, useEffect, useRef } from 'react'
import { Row, Col, Card, Statistic, Button, Switch, Tag, List, Badge, message } from 'antd'
import {
  ThermometerOutlined,
  DropOutlined,
  SunOutlined,
  FanOutlined,
  CloudOutlined,
  SafetyOutlined,
  PoweroffOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import useStore from '@/store'
import { api } from '@/utils/request'
import { deviceStatusMap, alarmLevelMap, controlModeMap } from '@/config'
import './Dashboard.scss'

function Dashboard() {
  const realtimeData = useStore(state => state.realtimeData)
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)
  const controlMode = useStore(state => state.controlMode)
  const setControlMode = useStore(state => state.setControlMode)
  const activeAlarms = useStore(state => state.activeAlarms)

  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState({ times: [], temps: [], humidity: [], light: [] })
  const chartRef = useRef(null)

  useEffect(() => {
    if (!realtimeData) {
      loadRealtimeData()
    }
    const timer = setInterval(() => {
      loadHistoryChartData()
    }, 5000)
    return () => clearInterval(timer)
  }, [currentGreenhouseId])

  const loadRealtimeData = async () => {
    try {
      const data = await api.getRealTimeData(currentGreenhouseId)
      useStore.getState().setRealtimeData(data)
    } catch (e) {
      console.error(e)
      generateMockData()
    }
  }

  const loadHistoryChartData = async () => {
    try {
      const endTime = new Date()
      const startTime = new Date(endTime.getTime() - 2 * 3600000)
      const data = await api.getSensorHistory(currentGreenhouseId, startTime.toISOString(), endTime.toISOString())
      processChartData(data)
    } catch (e) {
      generateMockChartData()
    }
  }

  const generateMockData = () => {
    const mockData = {
      temperature: 26.5,
      humidity: 65,
      light: 45000,
      co2: 800,
      fanStatus: 2,
      wetCurtainStatus: 1,
      sunshadeStatus: 0,
      controlMode: controlMode,
      temperatureUpper: 30,
      temperatureLower: 18,
      humidityUpper: 85,
      humidityLower: 50,
      lightUpper: 60000,
      lightLower: 5000,
      collectTime: new Date().toISOString(),
      devices: [
        { id: 1, deviceCode: 'FAN001', deviceName: '1号风机', deviceType: 1, status: 2 },
        { id: 2, deviceCode: 'FAN002', deviceName: '2号风机', deviceType: 1, status: 2 },
        { id: 3, deviceCode: 'WET001', deviceName: '湿帘水泵', deviceType: 2, status: 1 },
        { id: 4, deviceCode: 'SHD001', deviceName: '遮阳网电机', deviceType: 3, status: 0 },
        { id: 5, deviceCode: 'THS001', deviceName: '温湿度传感器', deviceType: 10, status: 1 },
        { id: 6, deviceCode: 'LIS001', deviceName: '光照传感器', deviceType: 12, status: 1 }
      ],
      alarms: activeAlarms.length > 0 ? activeAlarms : [
        { id: 1, alarmName: '温度偏高', alarmLevel: 2, alarmContent: '当前温度28.5℃，超过上限阈值28℃', deviceCode: 'THS001', alarmTime: new Date().toISOString() },
        { id: 2, alarmName: '风机运行异常', alarmLevel: 3, alarmContent: '2号风机运行电流异常', deviceCode: 'FAN002', alarmTime: new Date(Date.now() - 300000).toISOString() }
      ]
    }
    useStore.getState().setRealtimeData(mockData)
    generateMockChartData()
  }

  const generateMockChartData = () => {
    const now = Date.now()
    const times = []
    const temps = []
    const humidity = []
    const light = []
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now - i * 5 * 60000)
      times.push(`${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`)
      temps.push(25 + Math.sin(i / 3) * 3 + Math.random() * 1)
      humidity.push(60 + Math.sin(i / 4) * 10 + Math.random() * 3)
      light.push(35000 + Math.sin(i / 2) * 15000 + Math.random() * 5000)
    }
    setChartData({ times, temps, humidity, light })
  }

  const processChartData = (data) => {
    const times = data.map(d => {
      const t = new Date(d.collectTime)
      return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
    })
    const temps = data.map(d => d.temperature)
    const humidity = data.map(d => d.humidity)
    const light = data.map(d => d.light)
    setChartData({ times, temps, humidity, light })
  }

  const handleControlDevice = async (deviceCode, action) => {
    setLoading(true)
    try {
      await api.manualControl({
        greenhouseId: currentGreenhouseId,
        deviceCode,
        action,
        operator: 'admin'
      })
      message.success(`设备${action === 1 ? '启动' : '停止'}成功`)
      setTimeout(loadRealtimeData, 1000)
    } catch (e) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleModeChange = async (mode) => {
    try {
      await api.switchMode({
        greenhouseId: currentGreenhouseId,
        mode,
        operator: 'admin'
      })
      setControlMode(mode)
      message.success(`已切换为${controlModeMap[mode].text}模式`)
    } catch (e) {
      message.error('切换失败')
    }
  }

  const getChartOption = () => ({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['温度(℃)', '湿度(%)', '光照(×1000lux)'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.times
    },
    yAxis: [
      {
        type: 'value',
        name: '温度/湿度',
        min: 0,
        max: 100
      },
      {
        type: 'value',
        name: '光照',
        min: 0,
        max: 80,
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '温度(℃)',
        type: 'line',
        smooth: true,
        data: chartData.temps,
        lineStyle: { color: '#ff4d4f' },
        itemStyle: { color: '#ff4d4f' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255,77,79,0.3)' },
              { offset: 1, color: 'rgba(255,77,79,0.05)' }
            ]
          }
        }
      },
      {
        name: '湿度(%)',
        type: 'line',
        smooth: true,
        data: chartData.humidity,
        lineStyle: { color: '#1890ff' },
        itemStyle: { color: '#1890ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24,144,255,0.3)' },
              { offset: 1, color: 'rgba(24,144,255,0.05)' }
            ]
          }
        }
      },
      {
        name: '光照(×1000lux)',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: chartData.light.map(v => v / 1000),
        lineStyle: { color: '#faad14' },
        itemStyle: { color: '#faad14' }
      }
    ]
  })

  const temp = realtimeData?.temperature || '--'
  const humidity = realtimeData?.humidity || '--'
  const light = realtimeData?.light || '--'

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h2 className="title">实时监控</h2>
          <span className="update-time">
            最后更新: {realtimeData?.collectTime ? new Date(realtimeData.collectTime).toLocaleString('zh-CN') : '--'}
          </span>
        </div>
        <div className="header-right">
          <div className="mode-switch">
            <span className="label">控制模式:</span>
            <Button.Group>
              <Button
                type={controlMode === 0 ? 'primary' : 'default'}
                onClick={() => handleModeChange(0)}
                icon={<PoweroffOutlined />}
              >
                手动
              </Button>
              <Button
                type={controlMode === 1 ? 'primary' : 'default'}
                onClick={() => handleModeChange(1)}
                icon={<PlayCircleOutlined />}
              >
                自动
              </Button>
              <Button
                type={controlMode === 2 ? 'primary' : 'default'}
                onClick={() => handleModeChange(2)}
                icon={<PauseCircleOutlined />}
              >
                定时
              </Button>
            </Button.Group>
          </div>
          <Tag color={controlModeMap[controlMode].color}>
            当前: {controlModeMap[controlMode].text}
          </Tag>
        </div>
      </div>

      <Row gutter={[16, 16]} className="data-cards">
        <Col xs={24} sm={12} lg={6}>
          <Card className="env-card temp-card">
            <Statistic
              title={<span className="stat-title"><ThermometerOutlined /> 温度</span>}
              value={temp}
              suffix="℃"
              valueStyle={{ color: '#ff4d4f' }}
            />
            <div className="env-range">
              阈值: {realtimeData?.temperatureLower || 18} - {realtimeData?.temperatureUpper || 30}℃
            </div>
            <div className={`env-status ${temp > 30 ? 'danger' : temp < 18 ? 'warning' : 'normal'}`}>
              {temp > 30 ? '偏高' : temp < 18 ? '偏低' : '正常'}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="env-card humidity-card">
            <Statistic
              title={<span className="stat-title"><DropOutlined /> 湿度</span>}
              value={humidity}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="env-range">
              阈值: {realtimeData?.humidityLower || 50} - {realtimeData?.humidityUpper || 85}%
            </div>
            <div className={`env-status ${humidity > 85 ? 'danger' : humidity < 50 ? 'warning' : 'normal'}`}>
              {humidity > 85 ? '偏高' : humidity < 50 ? '偏低' : '正常'}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="env-card light-card">
            <Statistic
              title={<span className="stat-title"><SunOutlined /> 光照</span>}
              value={light}
              suffix="lux"
              valueStyle={{ color: '#faad14' }}
            />
            <div className="env-range">
              阈值: {realtimeData?.lightLower || 5000} - {realtimeData?.lightUpper || 60000}lux
            </div>
            <div className={`env-status ${light > 60000 ? 'danger' : light < 5000 ? 'warning' : 'normal'}`}>
              {light > 60000 ? '过强' : light < 5000 ? '偏弱' : '正常'}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="env-card co2-card">
            <Statistic
              title={<span className="stat-title"><CloudOutlined /> CO₂</span>}
              value={realtimeData?.co2 || '--'}
              suffix="ppm"
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="env-range">
              阈值: 400 - 1000ppm
            </div>
            <div className="env-status normal">
              正常
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card title="环境趋势（近2小时）" className="chart-card">
            <ReactECharts
              ref={chartRef}
              option={getChartOption()}
              style={{ height: 350 }}
              notMerge={true}
            />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="设备状态" className="device-card">
            <List
              dataSource={realtimeData?.devices || []}
              renderItem={device => (
                <List.Item className="device-item">
                  <div className="device-info">
                    <Badge
                      status={device.status === 0 ? 'default' : device.status === 1 ? 'success' : device.status === 2 ? 'processing' : 'error'}
                      text={device.deviceName}
                    />
                    <Tag color={deviceStatusMap[device.status].color} size="small">
                      {deviceStatusMap[device.status].text}
                    </Tag>
                  </div>
                  <div className="device-actions">
                    {device.deviceType <= 3 && (
                      <Switch
                        checked={device.status === 2}
                        checkedChildren="开"
                        unCheckedChildren="关"
                        onChange={checked => handleControlDevice(device.deviceCode, checked ? 1 : 0)}
                        disabled={controlMode === 1 || loading}
                      />
                    )}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="bottom-row">
        <Col xs={24} xl={12}>
          <Card title="设备控制" className="control-card">
            <div className="control-grid">
              <div className="control-item">
                <div className="control-icon fan">
                  <FanOutlined />
                </div>
                <div className="control-info">
                  <div className="control-name">风机系统</div>
                  <div className="control-status">
                    <Tag color={realtimeData?.fanStatus === 2 ? '#52c41a' : '#999'}>
                      {realtimeData?.fanStatus === 2 ? '运行中' : realtimeData?.fanStatus === 1 ? '待机' : '关闭'}
                    </Tag>
                  </div>
                </div>
                <div className="control-btns">
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlayCircleOutlined />}
                    disabled={realtimeData?.fanStatus === 2 || controlMode === 1}
                    onClick={() => handleControlDevice('FAN001', 1)}
                  >
                    启动
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<PauseCircleOutlined />}
                    disabled={realtimeData?.fanStatus !== 2 || controlMode === 1}
                    onClick={() => handleControlDevice('FAN001', 0)}
                  >
                    停止
                  </Button>
                </div>
              </div>

              <div className="control-item">
                <div className="control-icon wet">
                  <SafetyOutlined />
                </div>
                <div className="control-info">
                  <div className="control-name">湿帘系统</div>
                  <div className="control-status">
                    <Tag color={realtimeData?.wetCurtainStatus === 2 ? '#52c41a' : '#999'}>
                      {realtimeData?.wetCurtainStatus === 2 ? '运行中' : realtimeData?.wetCurtainStatus === 1 ? '待机' : '关闭'}
                    </Tag>
                  </div>
                </div>
                <div className="control-btns">
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlayCircleOutlined />}
                    disabled={realtimeData?.wetCurtainStatus === 2 || controlMode === 1}
                    onClick={() => handleControlDevice('WET001', 1)}
                  >
                    启动
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<PauseCircleOutlined />}
                    disabled={realtimeData?.wetCurtainStatus !== 2 || controlMode === 1}
                    onClick={() => handleControlDevice('WET001', 0)}
                  >
                    停止
                  </Button>
                </div>
              </div>

              <div className="control-item">
                <div className="control-icon shade">
                  <SunOutlined />
                </div>
                <div className="control-info">
                  <div className="control-name">遮阳网</div>
                  <div className="control-status">
                    <Tag color={realtimeData?.sunshadeStatus === 2 ? '#52c41a' : '#999'}>
                      {realtimeData?.sunshadeStatus === 2 ? '展开中' : realtimeData?.sunshadeStatus === 1 ? '半开' : '收起'}
                    </Tag>
                  </div>
                </div>
                <div className="control-btns">
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlayCircleOutlined />}
                    disabled={realtimeData?.sunshadeStatus === 2 || controlMode === 1}
                    onClick={() => handleControlDevice('SHD001', 1)}
                  >
                    展开
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<PauseCircleOutlined />}
                    disabled={realtimeData?.sunshadeStatus === 0 || controlMode === 1}
                    onClick={() => handleControlDevice('SHD001', 0)}
                  >
                    收起
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            title={<span><SafetyOutlined /> 活跃告警</span>}
            className="alarm-card"
            extra={<Badge count={activeAlarms.length} />}
          >
            <List
              dataSource={activeAlarms}
              locale={{ emptyText: '暂无告警' }}
              renderItem={alarm => (
                <List.Item className="alarm-item">
                  <div className="alarm-level" style={{ background: alarmLevelMap[alarm.alarmLevel].color }} />
                  <div className="alarm-content">
                    <div className="alarm-header">
                      <span className="alarm-name">{alarm.alarmName}</span>
                      <Tag color={alarmLevelMap[alarm.alarmLevel].color} size="small">
                        {alarmLevelMap[alarm.alarmLevel].text}
                      </Tag>
                    </div>
                    <div className="alarm-desc">{alarm.alarmContent}</div>
                    <div className="alarm-meta">
                      <span>设备: {alarm.deviceCode}</span>
                      <span>{new Date(alarm.alarmTime).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
