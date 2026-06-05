import { useState, useEffect } from 'react'
import {
  Table,
  Form,
  Select,
  Modal,
  Button,
  Tag,
  message,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Descriptions,
  DatePicker
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  DropOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { api } from '@/utils/request'
import {
  irrigationRecordTypeMap,
  greenhouseList
} from '@/config'
import useStore from '@/store'
import './index.scss'

const { Option } = Select
const { RangePicker } = DatePicker

function IrrigationRecord() {
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [recordList, setRecordList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [chartData, setChartData] = useState({ dates: [], waterUsage: [], fertilizerUsage: [] })

  useEffect(() => {
    loadRecordList()
    loadDailyStatistics()
  }, [currentGreenhouseId, pagination.current, pagination.pageSize])

  const loadRecordList = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const params = {
        greenhouseId: currentGreenhouseId,
        page: pagination.current,
        size: pagination.pageSize,
        ...values
      }
      const data = await api.getIrrigationRecordList(params)
      setRecordList(data?.records || generateMockData())
      setPagination(prev => ({ ...prev, total: data?.total || 15 }))
    } catch (e) {
      console.error(e)
      setRecordList(generateMockData())
      setPagination(prev => ({ ...prev, total: 15 }))
    } finally {
      setLoading(false)
    }
  }

  const loadDailyStatistics = async () => {
    try {
      const data = await api.getIrrigationDailyStatistics({
        greenhouseId: currentGreenhouseId,
        days: 7
      })
      if (data && Array.isArray(data)) {
        setChartData({
          dates: data.map(d => d.date),
          waterUsage: data.map(d => d.waterUsage || 0),
          fertilizerUsage: data.map(d => d.fertilizerUsage || 0)
        })
      } else {
        generateMockChartData()
      }
    } catch (e) {
      console.error(e)
      generateMockChartData()
    }
  }

  const generateMockChartData = () => {
    const dates = []
    const waterUsage = []
    const fertilizerUsage = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
      waterUsage.push(Math.round(80 + Math.random() * 120))
      fertilizerUsage.push(Math.round(5 + Math.random() * 15))
    }
    setChartData({ dates, waterUsage, fertilizerUsage })
  }

  const generateMockData = () => {
    const data = []
    const now = Date.now()
    for (let i = 0; i < 15; i++) {
      const type = Math.random() > 0.3 ? 'FERTIGATION' : 'IRRIGATION'
      data.push({
        id: i + 1,
        recordCode: `IRR-REC-${String(i + 1).padStart(4, '0')}`,
        recordType: type,
        greenhouseId: [1, 2, 3][Math.floor(Math.random() * 3)],
        greenhouseName: ['1号大棚', '2号大棚', '3号大棚'][Math.floor(Math.random() * 3)],
        taskCode: `IRR-TASK-2024060${Math.floor(Math.random() * 5) + 1}00${Math.floor(Math.random() * 9) + 1}`,
        formulaCode: `FORM-${['TOM', 'CUC', 'STR', 'PEP', 'EGG'][Math.floor(Math.random() * 5)]}-00${Math.floor(Math.random() * 3) + 1}`,
        duration: Math.round(15 + Math.random() * 45),
        waterUsage: Math.round(50 + Math.random() * 150 * 10) / 10,
        fertilizerUsage: type === 'FERTIGATION' ? Math.round(3 + Math.random() * 15 * 10) / 10 : 0,
        avgEc: type === 'FERTIGATION' ? Math.round((1.2 + Math.random() * 1.2) * 100) / 100 : 0.8,
        avgPh: Math.round((5.5 + Math.random() * 1.0) * 100) / 100,
        startTime: new Date(now - i * 12 * 3600000 - Math.random() * 3600000).toISOString(),
        endTime: new Date(now - i * 12 * 3600000 - Math.random() * 1800000).toISOString(),
        operator: ['system', 'admin', 'worker1'][Math.floor(Math.random() * 3)],
        deviceCodes: ['VALVE001', 'VALVE002', 'VALVE003', 'FPUMP001'].slice(0, Math.floor(Math.random() * 3) + 2),
        remark: type === 'FERTIGATION' ? '水肥一体化灌溉' : '清水灌溉'
      })
    }
    return data
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadRecordList, 0)
    loadDailyStatistics()
  }

  const handleReset = () => {
    form.resetFields()
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadRecordList, 0)
    loadDailyStatistics()
  }

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
  }

  const handleViewDetail = async (record) => {
    setCurrentRecord(record)
    setDetailModalVisible(true)
    try {
      const data = await api.getIrrigationRecord(record.id)
      if (data) {
        setCurrentRecord(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getStatistics = () => {
    const total = recordList.length
    const today = recordList.filter(r => {
      const today = new Date().toDateString()
      return new Date(r.startTime).toDateString() === today
    }).length
    const totalWater = recordList.reduce((sum, r) => sum + (r.waterUsage || 0), 0)
    const totalFertilizer = recordList.reduce((sum, r) => sum + (r.fertilizerUsage || 0), 0)
    return { total, today, totalWater: Math.round(totalWater), totalFertilizer: Math.round(totalFertilizer * 10) / 10 }
  }

  const stats = getStatistics()

  const getRecordTypeColor = (type) => {
    const map = {
      IRRIGATION: '#1890ff',
      FERTIGATION: '#52c41a'
    }
    return map[type] || '#999'
  }

  const getChartOption = () => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['用水量(L)', '用肥量(kg)'],
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
      data: chartData.dates
    },
    yAxis: [
      {
        type: 'value',
        name: '用水量(L)',
        min: 0,
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '用肥量(kg)',
        min: 0,
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '用水量(L)',
        type: 'line',
        smooth: true,
        data: chartData.waterUsage,
        lineStyle: { color: '#1890ff', width: 3 },
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
        name: '用肥量(kg)',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: chartData.fertilizerUsage,
        lineStyle: { color: '#52c41a', width: 3 },
        itemStyle: { color: '#52c41a' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82,196,26,0.3)' },
              { offset: 1, color: 'rgba(82,196,26,0.05)' }
            ]
          }
        }
      }
    ]
  })

  const columns = [
    {
      title: '记录编码',
      dataIndex: 'recordCode',
      key: 'recordCode',
      width: 160,
      render: text => <span className="record-code">{text}</span>
    },
    {
      title: '类型',
      dataIndex: 'recordType',
      key: 'recordType',
      width: 100,
      render: type => (
        <Tag color={getRecordTypeColor(type)}>
          {irrigationRecordTypeMap[type] || '未知'}
        </Tag>
      )
    },
    {
      title: '大棚',
      dataIndex: 'greenhouseName',
      key: 'greenhouseName',
      width: 100
    },
    {
      title: '时长(分钟)',
      dataIndex: 'duration',
      key: 'duration',
      width: 110,
      render: val => `${val} 分钟`
    },
    {
      title: '用水量(L)',
      dataIndex: 'waterUsage',
      key: 'waterUsage',
      width: 100,
      render: val => val.toFixed(1)
    },
    {
      title: '用肥量(kg)',
      dataIndex: 'fertilizerUsage',
      key: 'fertilizerUsage',
      width: 110,
      render: val => val.toFixed(1)
    },
    {
      title: '平均EC/pH',
      dataIndex: 'avgEc',
      key: 'ecPh',
      width: 120,
      render: (_, record) => (
        <span>EC:{record.avgEc.toFixed(2)} / pH:{record.avgPh.toFixed(2)}</span>
      )
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 160,
      render: time => new Date(time).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>
      )
    }
  ]

  return (
    <div className="irrigation-record-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">灌溉记录管理</h2>
          <span className="subtitle">灌溉历史记录查询与统计</span>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><FileTextOutlined /> 记录总数</span>}
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><CalendarOutlined /> 今日记录</span>}
              value={stats.today}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><DropOutlined /> 用水量(L)</span>}
              value={stats.totalWater}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><ThunderboltOutlined /> 用肥量(kg)</span>}
              value={stats.totalFertilizer}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="chart-row">
        <Col xs={24}>
          <Card title="日用水/用肥统计（近7天）" className="chart-card">
            <ReactECharts
              option={getChartOption()}
              style={{ height: 320 }}
              notMerge={true}
            />
          </Card>
        </Col>
      </Row>

      <Card className="filter-card">
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          className="filter-form"
        >
          <Form.Item name="greenhouseId" label="大棚">
            <Select placeholder="请选择大棚" allowClear style={{ width: 150 }}>
              {greenhouseList.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="recordType" label="记录类型">
            <Select placeholder="请选择类型" allowClear style={{ width: 150 }}>
              {Object.entries(irrigationRecordTypeMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="timeRange" label="时间范围">
            <RangePicker showTime style={{ width: 260 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="table-card">
        <div className="table-toolbar">
          <div className="toolbar-left">
            <span className="selected-info">
              共 <strong>{pagination.total}</strong> 条记录
            </span>
          </div>
          <div className="toolbar-right">
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadRecordList}
                loading={loading}
              >
                刷新
              </Button>
            </Space>
          </div>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={recordList}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <InfoCircleOutlined />
            <span>记录详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={null}
      >
        {currentRecord && (
          <div className="detail-content">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="记录编码">{currentRecord.recordCode}</Descriptions.Item>
              <Descriptions.Item label="记录类型">
                <Tag color={getRecordTypeColor(currentRecord.recordType)}>
                  {irrigationRecordTypeMap[currentRecord.recordType]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="所属大棚">{currentRecord.greenhouseName}</Descriptions.Item>
              <Descriptions.Item label="关联任务">{currentRecord.taskCode || '--'}</Descriptions.Item>
              <Descriptions.Item label="关联配方">{currentRecord.formulaCode || '--'}</Descriptions.Item>
              <Descriptions.Item label="操作人">{currentRecord.operator}</Descriptions.Item>
              <Descriptions.Item label="持续时长">{currentRecord.duration} 分钟</Descriptions.Item>
              <Descriptions.Item label="用水量">{currentRecord.waterUsage.toFixed(1)} L</Descriptions.Item>
              <Descriptions.Item label="用肥量">{currentRecord.fertilizerUsage.toFixed(1)} kg</Descriptions.Item>
              <Descriptions.Item label="平均EC">{currentRecord.avgEc.toFixed(2)} mS/cm</Descriptions.Item>
              <Descriptions.Item label="平均pH">{currentRecord.avgPh.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="开始时间">
                {new Date(currentRecord.startTime).toLocaleString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="结束时间">
                {new Date(currentRecord.endTime).toLocaleString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="使用设备" span={2}>
                {currentRecord.deviceCodes?.map((code, i) => (
                  <Tag key={i} color="blue" style={{ marginRight: 4, marginBottom: 4 }}>
                    {code}
                  </Tag>
                )) || '--'}
              </Descriptions.Item>
              <Descriptions.Item label="备注说明" span={2}>
                {currentRecord.remark || '--'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default IrrigationRecord
