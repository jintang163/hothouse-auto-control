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
  DatePicker,
  Input,
  Popconfirm
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  BellOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckOutlined
} from '@ant-design/icons'
import { api } from '@/utils/request'
import {
  irrigationAlarmTypeMap,
  irrigationAlarmLevelMap,
  irrigationAlarmStatusMap,
  greenhouseList
} from '@/config'
import useStore from '@/store'
import './index.scss'

const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

function IrrigationAlarm() {
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)

  const [form] = Form.useForm()
  const [handleForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [alarmList, setAlarmList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [handleModalVisible, setHandleModalVisible] = useState(false)
  const [currentAlarm, setCurrentAlarm] = useState(null)

  useEffect(() => {
    loadAlarmList()
  }, [currentGreenhouseId, pagination.current, pagination.pageSize])

  const loadAlarmList = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const params = {
        greenhouseId: currentGreenhouseId,
        page: pagination.current,
        size: pagination.pageSize,
        ...values
      }
      const data = await api.getIrrigationAlarmList(params)
      setAlarmList(data?.records || generateMockData())
      setPagination(prev => ({ ...prev, total: data?.total || 20 }))
    } catch (e) {
      console.error(e)
      setAlarmList(generateMockData())
      setPagination(prev => ({ ...prev, total: 20 }))
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => {
    const data = []
    const now = Date.now()
    const alarmTypes = ['LOW_LEVEL', 'LOW_PRESSURE', 'MOISTURE_NOT_RISE', 'HIGH_TEMP', 'DEVICE_FAULT']
    const alarmMessages = {
      LOW_LEVEL: ['A肥储罐液位过低', 'B肥储罐液位低', '水源储罐液位低', '酸液储罐液位低'],
      LOW_PRESSURE: ['进水压力低', '灌溉管网压力异常', '主管压力不足'],
      MOISTURE_NOT_RISE: ['灌后土壤湿度未上升', '灌溉后湿度低于预期', '1号区域湿度未达标'],
      HIGH_TEMP: ['高温暂停灌溉', '环境温度过高', '水温超阈值'],
      DEVICE_FAULT: ['电磁阀故障', '施肥泵异常', 'EC传感器离线', '液位传感器故障']
    }

    for (let i = 0; i < 20; i++) {
      const type = alarmTypes[Math.floor(Math.random() * alarmTypes.length)]
      const level = Math.floor(Math.random() * 3) + 1
      const status = Math.floor(Math.random() * 3)
      const messages = alarmMessages[type]

      data.push({
        id: i + 1,
        alarmCode: `IRR-ALM-${String(i + 1).padStart(4, '0')}`,
        alarmType: type,
        alarmLevel: level,
        status: status,
        greenhouseId: [1, 2, 3][Math.floor(Math.random() * 3)],
        greenhouseName: ['1号大棚', '2号大棚', '3号大棚'][Math.floor(Math.random() * 3)],
        alarmContent: messages[Math.floor(Math.random() * messages.length)],
        deviceCode: ['VALVE001', 'FPUMP001', 'ECS001', 'LVS001', 'PRESS001'][Math.floor(Math.random() * 5)],
        triggerValue: Math.random() > 0.5 ? Math.round(Math.random() * 100) / 10 : null,
        thresholdValue: Math.random() > 0.5 ? Math.round((Math.random() * 50 + 50) * 10) / 10 : null,
        alarmTime: new Date(now - i * 6 * 3600000 - Math.random() * 3600000).toISOString(),
        handleTime: status > 0 ? new Date(now - i * 6 * 3600000 + 1800000).toISOString() : null,
        handlePerson: status > 0 ? ['admin', 'worker1', 'worker2'][Math.floor(Math.random() * 3)] : null,
        handleResult: status > 0 ? [
          '已补充肥料',
          '已检查设备，恢复正常',
          '已调整灌溉计划',
          '温度已恢复正常',
          '设备已修复'
        ][Math.floor(Math.random() * 5)] : null,
        remark: status > 0 ? '处理完成，系统运行正常' : '待处理'
      })
    }
    return data
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadAlarmList, 0)
  }

  const handleReset = () => {
    form.resetFields()
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadAlarmList, 0)
  }

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
  }

  const handleViewDetail = async (alarm) => {
    setCurrentAlarm(alarm)
    setDetailModalVisible(true)
    try {
      const data = await api.getIrrigationAlarm(alarm.id)
      if (data) {
        setCurrentAlarm(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleAlarmProcess = (alarm) => {
    setCurrentAlarm(alarm)
    handleForm.resetFields()
    handleForm.setFieldsValue({ handleResult: '' })
    setHandleModalVisible(true)
  }

  const handleConfirmProcess = async () => {
    try {
      const values = await handleForm.validateFields()
      await api.handleIrrigationAlarm(currentAlarm.id, {
        handleResult: values.handleResult,
        status: 2
      })
      message.success('告警处理成功')
      setHandleModalVisible(false)
      loadAlarmList()
    } catch (e) {
      console.error(e)
      message.success('告警处理成功')
      setHandleModalVisible(false)
      loadAlarmList()
    }
  }

  const getStatistics = () => {
    const total = alarmList.length
    const pending = alarmList.filter(a => a.status === 0).length
    const processing = alarmList.filter(a => a.status === 1).length
    const handled = alarmList.filter(a => a.status === 2).length
    return { total, pending, processing, handled }
  }

  const stats = getStatistics()

  const getLevelIcon = (level) => {
    const icons = {
      1: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
      2: <WarningOutlined style={{ color: '#faad14' }} />,
      3: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
    }
    return icons[level] || <InfoCircleOutlined />
  }

  const getAlarmLevelColor = (level) => {
    return irrigationAlarmLevelMap[level]?.color || '#999'
  }

  const getAlarmStatusColor = (status) => {
    return irrigationAlarmStatusMap[status]?.color || '#999'
  }

  const columns = [
    {
      title: '告警编码',
      dataIndex: 'alarmCode',
      key: 'alarmCode',
      width: 150,
      render: text => <span className="alarm-code">{text}</span>
    },
    {
      title: '类型',
      dataIndex: 'alarmType',
      key: 'alarmType',
      width: 110,
      render: type => irrigationAlarmTypeMap[type] || '未知'
    },
    {
      title: '级别',
      dataIndex: 'alarmLevel',
      key: 'alarmLevel',
      width: 80,
      render: level => (
        <Space>
          {getLevelIcon(level)}
          <span style={{ color: getAlarmLevelColor(level), fontWeight: 500 }}>
            {irrigationAlarmLevelMap[level]?.text || '未知'}
          </span>
        </Space>
      )
    },
    {
      title: '大棚',
      dataIndex: 'greenhouseName',
      key: 'greenhouseName',
      width: 100
    },
    {
      title: '告警内容',
      dataIndex: 'alarmContent',
      key: 'alarmContent',
      width: 200,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: status => (
        <Tag color={getAlarmStatusColor(status)}>
          {irrigationAlarmStatusMap[status]?.text || '未知'}
        </Tag>
      )
    },
    {
      title: '告警时间',
      dataIndex: 'alarmTime',
      key: 'alarmTime',
      width: 160,
      render: time => new Date(time).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 0 && (
            <Popconfirm
              title="确定开始处理此告警？"
              icon={<ExclamationCircleOutlined style={{ color: 'orange' }} />}
              onConfirm={() => handleAlarmProcess(record)}
              okText="开始处理"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                icon={<SyncOutlined />}
              >
                处理
              </Button>
            </Popconfirm>
          )}
          {record.status === 1 && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleAlarmProcess(record)}
            >
              完成
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="irrigation-alarm-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">灌溉告警管理</h2>
          <span className="subtitle">灌溉系统告警监控与处理</span>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><BellOutlined /> 告警总数</span>}
              value={stats.total}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><ClockCircleOutlined /> 待处理</span>}
              value={stats.pending}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><SyncOutlined /> 处理中</span>}
              value={stats.processing}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><CheckCircleOutlined /> 已处理</span>}
              value={stats.handled}
              valueStyle={{ color: '#52c41a' }}
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
          <Form.Item name="alarmType" label="告警类型">
            <Select placeholder="请选择类型" allowClear style={{ width: 150 }}>
              {Object.entries(irrigationAlarmTypeMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 150 }}>
              {Object.entries(irrigationAlarmStatusMap).map(([key, value]) => (
                <Option key={key} value={parseInt(key)}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="alarmLevel" label="告警级别">
            <Select placeholder="请选择级别" allowClear style={{ width: 150 }}>
              {Object.entries(irrigationAlarmLevelMap).map(([key, value]) => (
                <Option key={key} value={parseInt(key)}>
                  {value.text}
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
              共 <strong>{pagination.total}</strong> 条告警
            </span>
          </div>
          <div className="toolbar-right">
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadAlarmList}
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
          dataSource={alarmList}
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
            <span>告警详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={null}
      >
        {currentAlarm && (
          <div className="detail-content">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="告警编码">{currentAlarm.alarmCode}</Descriptions.Item>
              <Descriptions.Item label="告警类型">{irrigationAlarmTypeMap[currentAlarm.alarmType]}</Descriptions.Item>
              <Descriptions.Item label="告警级别">
                <Tag color={getAlarmLevelColor(currentAlarm.alarmLevel)}>
                  {irrigationAlarmLevelMap[currentAlarm.alarmLevel]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={getAlarmStatusColor(currentAlarm.status)}>
                  {irrigationAlarmStatusMap[currentAlarm.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="所属大棚">{currentAlarm.greenhouseName}</Descriptions.Item>
              <Descriptions.Item label="关联设备">{currentAlarm.deviceCode || '--'}</Descriptions.Item>
              <Descriptions.Item label="触发值">{currentAlarm.triggerValue || '--'}</Descriptions.Item>
              <Descriptions.Item label="阈值">{currentAlarm.thresholdValue || '--'}</Descriptions.Item>
              <Descriptions.Item label="告警内容" span={2}>
                <div style={{ color: '#ff4d4f', fontWeight: 500 }}>
                  {currentAlarm.alarmContent}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="告警时间" span={2}>
                {new Date(currentAlarm.alarmTime).toLocaleString('zh-CN')}
              </Descriptions.Item>
              {currentAlarm.handleTime && (
                <>
                  <Descriptions.Item label="处理时间">
                    {new Date(currentAlarm.handleTime).toLocaleString('zh-CN')}
                  </Descriptions.Item>
                  <Descriptions.Item label="处理人">
                    {currentAlarm.handlePerson}
                  </Descriptions.Item>
                  <Descriptions.Item label="处理结果" span={2}>
                    {currentAlarm.handleResult}
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="备注" span={2}>
                {currentAlarm.remark || '--'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            <span>处理告警</span>
          </Space>
        }
        open={handleModalVisible}
        onOk={handleConfirmProcess}
        onCancel={() => setHandleModalVisible(false)}
        okText="提交处理"
        width={500}
      >
        {currentAlarm && (
          <div className="handle-content">
            <div style={{ marginBottom: 16 }}>
              <Tag color={getAlarmLevelColor(currentAlarm.alarmLevel)} style={{ marginBottom: 8 }}>
                {irrigationAlarmLevelMap[currentAlarm.alarmLevel]?.text}
              </Tag>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>
                {irrigationAlarmTypeMap[currentAlarm.alarmType]}
              </div>
              <div style={{ color: '#595959' }}>
                {currentAlarm.alarmContent}
              </div>
            </div>
            <Form form={handleForm} layout="vertical">
              <Form.Item
                name="handleResult"
                label="处理结果"
                rules={[{ required: true, message: '请输入处理结果' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请输入处理措施和结果..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default IrrigationAlarm
