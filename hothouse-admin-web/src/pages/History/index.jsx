import { useState, useEffect, useMemo } from 'react'
import { Card, Row, Col, Select, DatePicker, Table, Statistic, message, Space, Tag } from 'antd'
import {
  ThermometerOutlined,
  DropOutlined,
  SunOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import { api } from '@/utils/request'
import './History.scss'

const { RangePicker } = DatePicker
const { Option } = Select

const timeRanges = [
  { label: '1小时', value: '1h', hours: 1 },
  { label: '6小时', value: '6h', hours: 6 },
  { label: '24小时', value: '24h', hours: 24 },
  { label: '7天', value: '7d', hours: 168 },
  { label: '自定义', value: 'custom', hours: 0 }
]

function History() {
  const [greenhouseId, setGreenhouseId] = useState(1)
  const [timeRange, setTimeRange] = useState('24h')
  const [customTime, setCustomTime] = useState(null)
  const [loading, setLoading] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const [greenhouseList, setGreenhouseList] = useState([])

  useEffect(() => {
    loadGreenhouseList()
    loadHistoryData()
  }, [greenhouseId, timeRange, customTime])

  const loadGreenhouseList = async () => {
    try {
      const data = await api.getGreenhouseList()
      setGreenhouseList(data || [])
      if (data && data.length > 0 && greenhouseId === 1) {
        setGreenhouseId(data[0].id)
      }
    } catch (e) {
      console.error(e)
      setGreenhouseList([
        { id: 1, name: '1号大棚', code: 'GH001' },
        { id: 2, name: '2号大棚', code: 'GH002' },
        { id: 3, name: '3号大棚', code: 'GH003' }
      ])
    }
  }

  const getTimeRange = () => {
    const now = dayjs()
    if (timeRange === 'custom' && customTime && customTime.length === 2) {
      return {
        startTime: customTime[0].toISOString(),
        endTime: customTime[1].toISOString()
      }
    }
    const range = timeRanges.find(r => r.value === timeRange)
    return {
      startTime: now.subtract(range.hours, 'hour').toISOString(),
      endTime: now.toISOString()
    }
  }

  const loadHistoryData = async () => {
    setLoading(true)
    try {
      const { startTime, endTime } = getTimeRange()
      const data = await api.getSensorHistory(greenhouseId, startTime, endTime)
      if (Array.isArray(data)) {
        setHistoryData(data)
      } else {
        generateMockData()
      }
    } catch (e) {
      console.error(e)
      generateMockData()
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => {
    const range = timeRanges.find(r => r.value === timeRange)
    const hours = timeRange === 'custom' ? 24 : range.hours
    const now = Date.now()
    const data = []
    const interval = hours <= 6 ? 5 * 60000 : hours <= 24 ? 15 * 60000 : 60 * 60000
    const count = Math.min(Math.floor((hours * 3600000) / interval), 200)

    for (let i = count; i >= 0; i--) {
      const time = new Date(now - i * interval)
      data.push({
        id: count - i + 1,
        collectTime: time.toISOString(),
        temperature: Number((25 + Math.sin(i / 3) * 4 + Math.random() * 2).toFixed(1)),
        humidity: Number((60 + Math.sin(i / 4) * 12 + Math.random() * 4).toFixed(1)),
        light: Math.floor(35000 + Math.sin(i / 2) * 18000 + Math.random() * 6000)
      })
    }
    setHistoryData(data)
  }

  const statistics = useMemo(() => {
    if (historyData.length === 0) {
      return {
        temp: { max: 0, min: 0, avg: 0 },
        humidity: { max: 0, min: 0, avg: 0 },
        light: { max: 0, min: 0, avg: 0 },
        count: 0
      }
    }

    const temps = historyData.map(d => d.temperature)
    const humidity = historyData.map(d => d.humidity)
    const light = historyData.map(d => d.light)

    return {
      temp: {
        max: Math.max(...temps),
        min: Math.min(...temps),
        avg: Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1))
      },
      humidity: {
        max: Math.max(...humidity),
        min: Math.min(...humidity),
        avg: Number((humidity.reduce((a, b) => a + b, 0) / humidity.length).toFixed(1))
      },
      light: {
        max: Math.max(...light),
        min: Math.min(...light),
        avg: Math.floor(light.reduce((a, b) => a + b, 0) / light.length)
      },
      count: historyData.length
    }
  }, [historyData])

  const chartOption = useMemo(() => ({
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
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: 20,
        bottom: 5
      }
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: historyData.map(d => dayjs(d.collectTime).format('MM-DD HH:mm'))
    },
    yAxis: [
      {
        type: 'value',
        name: '温度/湿度',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}'
        }
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
        data: historyData.map(d => d.temperature),
        lineStyle: { color: '#ff4d4f', width: 2 },
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
        data: historyData.map(d => d.humidity),
        lineStyle: { color: '#1890ff', width: 2 },
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
        data: historyData.map(d => (d.light / 1000).toFixed(1)),
        lineStyle: { color: '#faad14', width: 2 },
        itemStyle: { color: '#faad14' }
      }
    ]
  }), [historyData])

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '采集时间',
      dataIndex: 'collectTime',
      key: 'collectTime',
      width: 180,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '温度(℃)',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (val) => (
        <span style={{ color: '#ff4d4f', fontWeight: 500 }}>{val}</span>
      )
    },
    {
      title: '湿度(%)',
      dataIndex: 'humidity',
      key: 'humidity',
      render: (val) => (
        <span style={{ color: '#1890ff', fontWeight: 500 }}>{val}</span>
      )
    },
    {
      title: '光照(lux)',
      dataIndex: 'light',
      key: 'light',
      render: (val) => (
        <span style={{ color: '#faad14', fontWeight: 500 }}>{val.toLocaleString()}</span>
      )
    }
  ]

  const handleTimeRangeChange = (value) => {
    setTimeRange(value)
    if (value !== 'custom') {
      setCustomTime(null)
    }
  }

  const handleGreenhouseChange = (value) => {
    setGreenhouseId(value)
  }

  return (
    <div className="history-page">
      <div className="page-header">
        <h2 className="title">
          <BarChartOutlined /> 历史数据
        </h2>
      </div>

      <Card className="filter-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label"><ClockCircleOutlined /> 时间范围</span>
              <Select
                value={timeRange}
                onChange={handleTimeRangeChange}
                style={{ width: '100%' }}
                size="large"
              >
                {timeRanges.map(range => (
                  <Option key={range.value} value={range.value}>{range.label}</Option>
                ))}
              </Select>
            </div>
          </Col>
          {timeRange === 'custom' && (
            <Col xs={24} sm={12} md={10} lg={8}>
              <div className="filter-item">
                <span className="filter-label">自定义时间</span>
                <RangePicker
                  showTime
                  value={customTime}
                  onChange={setCustomTime}
                  style={{ width: '100%' }}
                  size="large"
                  format="YYYY-MM-DD HH:mm"
                />
              </div>
            </Col>
          )}
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="filter-item">
              <span className="filter-label">大棚选择</span>
              <Select
                value={greenhouseId}
                onChange={handleGreenhouseChange}
                style={{ width: '100%' }}
                size="large"
              >
                {greenhouseList.map(gh => (
                  <Option key={gh.id} value={gh.id}>{gh.name}</Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="filter-item">
              <span className="filter-label">数据点数</span>
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                {statistics.count} 条
              </Tag>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card temp-stat">
            <Statistic
              title={<span className="stat-title"><ThermometerOutlined /> 温度</span>}
              value={statistics.temp.avg}
              suffix="℃"
              precision={1}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <div className="stat-details">
              <span className="stat-item">
                <ArrowUpOutlined style={{ color: '#ff4d4f' }} /> 最高: {statistics.temp.max}℃
              </span>
              <span className="stat-item">
                <ArrowDownOutlined style={{ color: '#1890ff' }} /> 最低: {statistics.temp.min}℃
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card humidity-stat">
            <Statistic
              title={<span className="stat-title"><DropOutlined /> 湿度</span>}
              value={statistics.humidity.avg}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="stat-details">
              <span className="stat-item">
                <ArrowUpOutlined style={{ color: '#ff4d4f' }} /> 最高: {statistics.humidity.max}%
              </span>
              <span className="stat-item">
                <ArrowDownOutlined style={{ color: '#1890ff' }} /> 最低: {statistics.humidity.min}%
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card light-stat">
            <Statistic
              title={<span className="stat-title"><SunOutlined /> 光照</span>}
              value={statistics.light.avg}
              suffix="lux"
              valueStyle={{ color: '#faad14' }}
            />
            <div className="stat-details">
              <span className="stat-item">
                <ArrowUpOutlined style={{ color: '#ff4d4f' }} /> 最高: {statistics.light.max.toLocaleString()}
              </span>
              <span className="stat-item">
                <ArrowDownOutlined style={{ color: '#1890ff' }} /> 最低: {statistics.light.min.toLocaleString()}
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card count-stat">
            <Statistic
              title={<span className="stat-title"><BarChartOutlined /> 数据统计</span>}
              value={statistics.count}
              suffix="条"
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="stat-details">
              <span className="stat-item">
                时间跨度: {statistics.count > 0 ? dayjs(historyData[historyData.length - 1].collectTime).diff(dayjs(historyData[0].collectTime), 'hour') : 0} 小时
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="环境趋势图" className="chart-card">
        <ReactECharts
          option={chartOption}
          style={{ height: 400 }}
          notMerge={true}
          loading={loading}
        />
      </Card>

      <Card title="详细数据" className="table-card">
        <Table
          columns={columns}
          dataSource={historyData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条数据`
          }}
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  )
}

export default History
