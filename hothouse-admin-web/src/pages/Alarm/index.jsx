import { useState, useEffect } from 'react'
import {
  Table,
  Tabs,
  Form,
  Select,
  DatePicker,
  Modal,
  Tag,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  Space,
  message
} from 'antd'
import {
  WarningOutlined,
  BugOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  EditOutlined
} from '@ant-design/icons'
import useStore from '@/store'
import { api } from '@/utils/request'
import { alarmLevelMap } from '@/config'
import './Alarm.scss'

const { RangePicker } = DatePicker
const { TextArea } = Input
const { Option } = Select

function Alarm() {
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)

  const [activeTab, setActiveTab] = useState('active')
  const [loading, setLoading] = useState(false)
  const [alarmList, setAlarmList] = useState([])
  const [alarmCount, setAlarmCount] = useState({ critical: 0, error: 0, warning: 0 })
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const [searchForm] = Form.useForm()
  const [handleForm] = Form.useForm()
  const [handleModalVisible, setHandleModalVisible] = useState(false)
  const [currentAlarm, setCurrentAlarm] = useState(null)

  useEffect(() => {
    loadAlarmCount()
    loadAlarmList()
  }, [currentGreenhouseId, activeTab])

  const loadAlarmCount = async () => {
    try {
      const data = await api.getAlarmCount()
      setAlarmCount({
        critical: data?.critical || 0,
        error: data?.error || 0,
        warning: data?.warning || 0
      })
    } catch (e) {
      const mockData = generateMockData()
      setAlarmCount({
        critical: mockData.filter(a => a.alarmLevel === 4 && a.status === 0).length,
        error: mockData.filter(a => a.alarmLevel === 3 && a.status === 0).length,
        warning: mockData.filter(a => a.alarmLevel === 2 && a.status === 0).length
      })
    }
  }

  const loadAlarmList = async () => {
    setLoading(true)
    try {
      let data
      if (activeTab === 'active') {
        data = await api.getActiveAlarms(currentGreenhouseId)
      } else {
        const { rangeTime } = searchForm.getFieldsValue()
        const startTime = rangeTime ? rangeTime[0].toISOString() : null
        const endTime = rangeTime ? rangeTime[1].toISOString() : null
        data = await api.getAlarmHistory(currentGreenhouseId, startTime, endTime)
      }
      setAlarmList(Array.isArray(data) ? data : [])
      setPagination(p => ({ ...p, total: Array.isArray(data) ? data.length : 0 }))
    } catch (e) {
      const mockData = generateMockData()
      const filtered = activeTab === 'active'
        ? mockData.filter(a => a.status === 0)
        : mockData
      setAlarmList(filtered)
      setPagination(p => ({ ...p, total: filtered.length }))
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => {
    const now = Date.now()
    const devices = ['THS001', 'THS002', 'FAN001', 'FAN002', 'WET001', 'SHD001', 'LIS001']
    const alarmNames = [
      '温度偏高告警', '温度偏低告警', '湿度偏高告警', '湿度偏低告警',
      '光照过强告警', '光照偏弱告警', '风机运行异常', '设备离线告警',
      '湿帘水泵故障', '遮阳网电机异常', 'CO2浓度过高'
    ]
    const contents = [
      '当前温度28.5℃，超过上限阈值28℃，请及时通风降温',
      '当前温度15.2℃，低于下限阈值18℃，请开启加热设备',
      '当前湿度92%，超过上限阈值85%，请开启除湿设备',
      '当前湿度42%，低于下限阈值50%，请开启加湿设备',
      '当前光照65000lux，超过上限阈值60000lux，请展开遮阳网',
      '风机运行电流异常，实际电流12.5A，额定电流8A',
      '设备心跳超时，已离线超过5分钟',
      '湿帘水泵启动失败，请检查设备电源和线路'
    ]

    const data = []
    for (let i = 0; i < 25; i++) {
      const level = [2, 2, 3, 3, 4][Math.floor(Math.random() * 5)]
      const status = i < 8 ? 0 : 1
      data.push({
        id: i + 1,
        alarmName: alarmNames[Math.floor(Math.random() * alarmNames.length)],
        alarmLevel: level,
        alarmContent: contents[Math.floor(Math.random() * contents.length)],
        deviceCode: devices[Math.floor(Math.random() * devices.length)],
        alarmTime: new Date(now - i * 1800000 - Math.random() * 3600000).toISOString(),
        status: status,
        handleRemark: status === 1 ? '已通知运维人员处理，设备已恢复正常' : null,
        handleTime: status === 1 ? new Date(now - i * 1800000 + 600000).toISOString() : null,
        operator: status === 1 ? 'admin' : null
      })
    }
    return data
  }

  const handleSearch = () => {
    loadAlarmList()
  }

  const handleReset = () => {
    searchForm.resetFields()
    loadAlarmList()
  }

  const handleRefresh = () => {
    loadAlarmCount()
    loadAlarmList()
  }

  const openHandleModal = (record) => {
    setCurrentAlarm(record)
    handleForm.resetFields()
    setHandleModalVisible(true)
  }

  const handleAlarmSubmit = async () => {
    try {
      const values = await handleForm.validateFields()
      await api.handleAlarm({
        alarmId: currentAlarm.id,
        handleRemark: values.handleRemark,
        operator: 'admin'
      })
      message.success('告警处理成功')
      setHandleModalVisible(false)
      loadAlarmCount()
      loadAlarmList()
    } catch (e) {
      message.error('处理失败')
    }
  }

  const getLevelIcon = (level) => {
    switch (level) {
      case 4:
        return <ExclamationCircleOutlined style={{ color: '#722ed1' }} />
      case 3:
        return <BugOutlined style={{ color: '#ff4d4f' }} />
      case 2:
        return <WarningOutlined style={{ color: '#faad14' }} />
      default:
        return <WarningOutlined style={{ color: '#1890ff' }} />
    }
  }

  const columns = [
    {
      title: '告警名称',
      dataIndex: 'alarmName',
      key: 'alarmName',
      width: 160,
      render: (text, record) => (
        <Space>
          {getLevelIcon(record.alarmLevel)}
          <span className="alarm-name">{text}</span>
        </Space>
      )
    },
    {
      title: '级别',
      dataIndex: 'alarmLevel',
      key: 'alarmLevel',
      width: 100,
      render: (level) => (
        <Tag color={alarmLevelMap[level]?.color}>
          {alarmLevelMap[level]?.text}
        </Tag>
      )
    },
    {
      title: '告警内容',
      dataIndex: 'alarmContent',
      key: 'alarmContent',
      ellipsis: true,
      render: (text) => <span className="alarm-content">{text}</span>
    },
    {
      title: '设备',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      width: 100
    },
    {
      title: '告警时间',
      dataIndex: 'alarmTime',
      key: 'alarmTime',
      width: 170,
      render: (time) => new Date(time).toLocaleString('zh-CN')
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 0 ? '#ff4d4f' : '#52c41a'}>
          {status === 0 ? '待处理' : '已处理'}
        </Tag>
      )
    },
    {
      title: '处理人',
      dataIndex: 'operator',
      key: 'operator',
      width: 90,
      render: (text) => text || '--'
    },
    {
      title: '处理时间',
      dataIndex: 'handleTime',
      key: 'handleTime',
      width: 170,
      render: (time) => time ? new Date(time).toLocaleString('zh-CN') : '--'
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        record.status === 0 ? (
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openHandleModal(record)}
          >
            处理
          </Button>
        ) : (
          <Button size="small" disabled>
            已处理
          </Button>
        )
      )
    }
  ]

  const tabBarExtraContent = (
    <Button
      icon={<ReloadOutlined />}
      onClick={handleRefresh}
    >
      刷新
    </Button>
  )

  return (
    <div className="alarm-page">
      <div className="alarm-header">
        <h2 className="title">告警中心</h2>
      </div>

      <Row gutter={[16, 16]} className="stat-cards">
        <Col xs={24} sm={8}>
          <Card className="stat-card critical-card">
            <Statistic
              title={<span className="stat-title"><ExclamationCircleOutlined /> 严重告警</span>}
              value={alarmCount.critical}
              valueStyle={{ color: '#722ed1' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card error-card">
            <Statistic
              title={<span className="stat-title"><BugOutlined /> 错误告警</span>}
              value={alarmCount.error}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<BugOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card warning-card">
            <Statistic
              title={<span className="stat-title"><WarningOutlined /> 警告告警</span>}
              value={alarmCount.warning}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card className="search-card">
        <Form form={searchForm} layout="inline">
          <Form.Item name="alarmLevel" label="告警级别">
            <Select placeholder="请选择级别" allowClear style={{ width: 140 }}>
              {Object.entries(alarmLevelMap).map(([key, value]) => (
                <Option key={key} value={Number(key)}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="rangeTime" label="时间范围">
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: 380 }}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="table-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={tabBarExtraContent}
          items={[
            {
              key: 'active',
              label: '活跃告警',
              children: (
                <Table
                  rowKey="id"
                  columns={columns.filter(col => col.key !== 'operator' && col.key !== 'handleTime')}
                  dataSource={alarmList}
                  loading={loading}
                  pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`
                  }}
                  scroll={{ x: 1000 }}
                />
              )
            },
            {
              key: 'history',
              label: '历史记录',
              children: (
                <Table
                  rowKey="id"
                  columns={columns}
                  dataSource={alarmList}
                  loading={loading}
                  pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`
                  }}
                  scroll={{ x: 1200 }}
                />
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={<span><CheckCircleOutlined /> 告警处理</span>}
        open={handleModalVisible}
        onOk={handleAlarmSubmit}
        onCancel={() => setHandleModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <div className="handle-alarm-info">
          <div className="info-row">
            <span className="label">告警名称：</span>
            <span className="value">{currentAlarm?.alarmName}</span>
          </div>
          <div className="info-row">
            <span className="label">告警级别：</span>
            <Tag color={alarmLevelMap[currentAlarm?.alarmLevel]?.color}>
              {alarmLevelMap[currentAlarm?.alarmLevel]?.text}
            </Tag>
          </div>
          <div className="info-row">
            <span className="label">告警内容：</span>
            <span className="value">{currentAlarm?.alarmContent}</span>
          </div>
          <div className="info-row">
            <span className="label">设备编码：</span>
            <span className="value">{currentAlarm?.deviceCode}</span>
          </div>
          <div className="info-row">
            <span className="label">告警时间：</span>
            <span className="value">
              {currentAlarm?.alarmTime && new Date(currentAlarm.alarmTime).toLocaleString('zh-CN')}
            </span>
          </div>
        </div>
        <Form form={handleForm} layout="vertical" className="handle-form">
          <Form.Item
            name="handleRemark"
            label="处理备注"
            rules={[{ required: true, message: '请填写处理备注' }]}
          >
            <TextArea
              rows={4}
              placeholder="请描述告警处理过程和结果..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Alarm
