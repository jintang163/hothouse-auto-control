import { useState, useEffect } from 'react'
import {
  Table,
  Form,
  Select,
  Modal,
  Button,
  Tag,
  Badge,
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Descriptions,
  DatePicker,
  Divider
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { api } from '@/utils/request'
import {
  irrigationTaskTypeMap,
  irrigationTaskStatusMap,
  irrigationTriggerSourceMap,
  greenhouseList
} from '@/config'
import useStore from '@/store'
import './index.scss'

const { Option } = Select
const { RangePicker } = DatePicker

function IrrigationTask() {
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [taskList, setTaskList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [taskRecords, setTaskRecords] = useState([])
  const [taskDevices, setTaskDevices] = useState([])

  useEffect(() => {
    loadTaskList()
  }, [currentGreenhouseId, pagination.current, pagination.pageSize])

  const loadTaskList = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const params = {
        greenhouseId: currentGreenhouseId,
        page: pagination.current,
        size: pagination.pageSize,
        ...values
      }
      const data = await api.getIrrigationTaskList(params)
      setTaskList(data?.records || generateMockData())
      setPagination(prev => ({ ...prev, total: data?.total || 10 }))
    } catch (e) {
      console.error(e)
      setTaskList(generateMockData())
      setPagination(prev => ({ ...prev, total: 10 }))
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => [
    {
      id: 1,
      taskCode: 'IRR-TASK-20240605001',
      taskName: '1号棚番茄生长期灌溉',
      taskType: 'FERTIGATION',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      triggerSource: 'AUTO_TIMED',
      formulaCode: 'FORM-TOM-001',
      formulaName: '番茄生长期灌溉配方',
      status: 1,
      planDuration: 30,
      actualDuration: 15,
      planStartTime: '2024-06-05T06:00:00',
      planEndTime: '2024-06-05T06:30:00',
      actualStartTime: '2024-06-05T06:00:00',
      actualEndTime: null,
      waterUsage: 120.5,
      fertilizerUsage: 8.5,
      avgEc: 1.78,
      avgPh: 6.05,
      deviceCodes: ['VALVE001', 'VALVE002', 'FPUMP001', 'FPUMP002'],
      createTime: '2024-06-05T05:00:00',
      operator: 'system',
      remark: '每日定时灌溉任务'
    },
    {
      id: 2,
      taskCode: 'IRR-TASK-20240605002',
      taskName: '2号棚黄瓜开花期水肥',
      taskType: 'FERTIGATION',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      triggerSource: 'AUTO_MOISTURE',
      formulaCode: 'FORM-CUC-002',
      formulaName: '黄瓜开花期水肥配方',
      status: 0,
      planDuration: 35,
      actualDuration: null,
      planStartTime: '2024-06-05T08:00:00',
      planEndTime: '2024-06-05T08:35:00',
      actualStartTime: null,
      actualEndTime: null,
      waterUsage: null,
      fertilizerUsage: null,
      avgEc: null,
      avgPh: null,
      deviceCodes: ['VALVE004', 'VALVE005', 'VALVE006', 'FPUMP001'],
      createTime: '2024-06-05T07:30:00',
      operator: 'system',
      remark: '湿度触发，当前湿度62%低于阈值65%'
    },
    {
      id: 3,
      taskCode: 'IRR-TASK-20240604003',
      taskName: '1号棚清水灌溉',
      taskType: 'IRRIGATION',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      triggerSource: 'MANUAL',
      formulaCode: null,
      formulaName: null,
      status: 2,
      planDuration: 20,
      actualDuration: 20,
      planStartTime: '2024-06-04T16:00:00',
      planEndTime: '2024-06-04T16:20:00',
      actualStartTime: '2024-06-04T16:00:00',
      actualEndTime: '2024-06-04T16:20:00',
      waterUsage: 85.2,
      fertilizerUsage: 0,
      avgEc: 0.8,
      avgPh: 7.2,
      deviceCodes: ['VALVE001', 'VALVE002', 'VALVE003'],
      createTime: '2024-06-04T15:30:00',
      operator: 'admin',
      remark: '手动执行清水冲洗'
    },
    {
      id: 4,
      taskCode: 'IRR-TASK-20240604004',
      taskName: '3号棚pH调节',
      taskType: 'ACID_ADJUST',
      greenhouseId: 3,
      greenhouseName: '3号大棚',
      triggerSource: 'AUTO_MOISTURE',
      formulaCode: null,
      formulaName: null,
      status: 4,
      planDuration: 10,
      actualDuration: 5,
      planStartTime: '2024-06-04T10:00:00',
      planEndTime: '2024-06-04T10:10:00',
      actualStartTime: '2024-06-04T10:00:00',
      actualEndTime: '2024-06-04T10:05:00',
      waterUsage: 15.5,
      fertilizerUsage: 2.1,
      avgEc: 2.1,
      avgPh: 6.2,
      deviceCodes: ['APUMP001', 'VALVE007'],
      createTime: '2024-06-04T09:30:00',
      operator: 'system',
      remark: '酸泵故障，任务中断'
    },
    {
      id: 5,
      taskCode: 'IRR-TASK-20240604005',
      taskName: '2号棚清水灌溉',
      taskType: 'IRRIGATION',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      triggerSource: 'AUTO_TIMED',
      formulaCode: null,
      formulaName: null,
      status: 3,
      planDuration: 25,
      actualDuration: null,
      planStartTime: '2024-06-04T14:00:00',
      planEndTime: '2024-06-04T14:25:00',
      actualStartTime: null,
      actualEndTime: null,
      waterUsage: null,
      fertilizerUsage: null,
      avgEc: null,
      avgPh: null,
      deviceCodes: ['VALVE004', 'VALVE005'],
      createTime: '2024-06-04T13:00:00',
      operator: 'admin',
      remark: '人工取消，因降雨无需灌溉'
    },
    {
      id: 6,
      taskCode: 'IRR-TASK-20240603006',
      taskName: '3号棚草莓成熟期灌溉',
      taskType: 'FERTIGATION',
      greenhouseId: 3,
      greenhouseName: '3号大棚',
      triggerSource: 'AUTO_TIMED',
      formulaCode: 'FORM-STR-001',
      formulaName: '草莓成熟期灌溉配方',
      status: 2,
      planDuration: 25,
      actualDuration: 25,
      planStartTime: '2024-06-03T07:00:00',
      planEndTime: '2024-06-03T07:25:00',
      actualStartTime: '2024-06-03T07:00:00',
      actualEndTime: '2024-06-03T07:25:00',
      waterUsage: 75.8,
      fertilizerUsage: 5.2,
      avgEc: 1.52,
      avgPh: 5.55,
      deviceCodes: ['VALVE007', 'VALVE008', 'FPUMP001'],
      createTime: '2024-06-03T06:00:00',
      operator: 'system',
      remark: '定时任务执行完成'
    },
    {
      id: 7,
      taskCode: 'IRR-TASK-20240605007',
      taskName: '1号棚番茄结果期水肥',
      taskType: 'FERTIGATION',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      triggerSource: 'AUTO_TIMED',
      formulaCode: 'FORM-TOM-002',
      formulaName: '番茄结果期水肥配方',
      status: 0,
      planDuration: 45,
      actualDuration: null,
      planStartTime: '2024-06-05T10:00:00',
      planEndTime: '2024-06-05T10:45:00',
      actualStartTime: null,
      actualEndTime: null,
      waterUsage: null,
      fertilizerUsage: null,
      avgEc: null,
      avgPh: null,
      deviceCodes: ['VALVE001', 'VALVE002', 'VALVE003', 'FPUMP001', 'FPUMP002'],
      createTime: '2024-06-05T09:00:00',
      operator: 'system',
      remark: '等待执行'
    },
    {
      id: 8,
      taskCode: 'IRR-TASK-20240603008',
      taskName: '2号棚西瓜膨大期灌溉',
      taskType: 'FERTIGATION',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      triggerSource: 'MANUAL',
      formulaCode: 'FORM-WAT-001',
      formulaName: '西瓜膨大期水肥配方',
      status: 2,
      planDuration: 50,
      actualDuration: 52,
      planStartTime: '2024-06-03T08:00:00',
      planEndTime: '2024-06-03T08:50:00',
      actualStartTime: '2024-06-03T08:00:00',
      actualEndTime: '2024-06-03T08:52:00',
      waterUsage: 150.2,
      fertilizerUsage: 12.5,
      avgEc: 1.95,
      avgPh: 5.98,
      deviceCodes: ['VALVE004', 'VALVE005', 'VALVE006', 'FPUMP001', 'FPUMP002'],
      createTime: '2024-06-03T07:30:00',
      operator: 'admin',
      remark: '手动触发，执行正常'
    },
    {
      id: 9,
      taskCode: 'IRR-TASK-20240605009',
      taskName: '3号棚辣椒生长期灌溉',
      taskType: 'FERTIGATION',
      greenhouseId: 3,
      greenhouseName: '3号大棚',
      triggerSource: 'AUTO_MOISTURE',
      formulaCode: 'FORM-PEP-001',
      formulaName: '辣椒生长期灌溉配方',
      status: 0,
      planDuration: 28,
      actualDuration: null,
      planStartTime: '2024-06-05T12:00:00',
      planEndTime: '2024-06-05T12:28:00',
      actualStartTime: null,
      actualEndTime: null,
      waterUsage: null,
      fertilizerUsage: null,
      avgEc: null,
      avgPh: null,
      deviceCodes: ['VALVE009', 'VALVE010', 'FPUMP001'],
      createTime: '2024-06-05T11:30:00',
      operator: 'system',
      remark: '湿度触发待执行'
    },
    {
      id: 10,
      taskCode: 'IRR-TASK-20240602010',
      taskName: '1号棚茄子结果期水肥',
      taskType: 'FERTIGATION',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      triggerSource: 'AUTO_TIMED',
      formulaCode: 'FORM-EGG-001',
      formulaName: '茄子结果期水肥配方',
      status: 2,
      planDuration: 40,
      actualDuration: 40,
      planStartTime: '2024-06-02T09:00:00',
      planEndTime: '2024-06-02T09:40:00',
      actualStartTime: '2024-06-02T09:00:00',
      actualEndTime: '2024-06-02T09:40:00',
      waterUsage: 110.5,
      fertilizerUsage: 9.2,
      avgEc: 2.05,
      avgPh: 5.95,
      deviceCodes: ['VALVE001', 'VALVE002', 'FPUMP001', 'FPUMP002'],
      createTime: '2024-06-02T08:00:00',
      operator: 'system',
      remark: '执行完成，数据正常'
    }
  ]

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadTaskList, 0)
  }

  const handleReset = () => {
    form.resetFields()
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadTaskList, 0)
  }

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
  }

  const handleViewDetail = async (task) => {
    setCurrentTask(task)
    setTaskDevices(task.deviceCodes || [])
    setTaskRecords([
      { time: task.createTime, action: '任务创建', operator: task.operator },
      ...(task.actualStartTime ? [{ time: task.actualStartTime, action: '开始执行', operator: task.operator }] : []),
      ...(task.actualEndTime ? [{ time: task.actualEndTime, action: '执行结束', operator: task.operator }] : [])
    ].filter(item => item.time))
    setDetailModalVisible(true)
    try {
      const data = await api.getIrrigationTask(task.id)
      if (data) {
        setTaskDevices(data.deviceCodes || task.deviceCodes || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleStartTask = async (task) => {
    setActionLoading(true)
    try {
      await api.startIrrigationTask(task.id)
      message.success('任务已开始执行')
      setTimeout(loadTaskList, 1000)
    } catch (e) {
      message.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleExecuteTask = async (task) => {
    setActionLoading(true)
    try {
      await api.executeIrrigationTask(task.id)
      message.success('设备联动执行已触发')
      setTimeout(loadTaskList, 1000)
    } catch (e) {
      message.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCompleteTask = async (task) => {
    setActionLoading(true)
    try {
      await api.completeIrrigationTask(task.id)
      message.success('任务已标记完成')
      setTimeout(loadTaskList, 1000)
    } catch (e) {
      message.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelTask = async (task) => {
    setActionLoading(true)
    try {
      await api.cancelIrrigationTask(task.id)
      message.success('任务已取消')
      setTimeout(loadTaskList, 1000)
    } catch (e) {
      message.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatistics = () => {
    const pending = taskList.filter(t => t.status === 0).length
    const executing = taskList.filter(t => t.status === 1).length
    const completed = taskList.filter(t => t.status === 2).length
    const failed = taskList.filter(t => t.status === 4).length
    return { pending, executing, completed, failed }
  }

  const stats = getStatistics()

  const getTaskTypeColor = (type) => {
    const map = {
      IRRIGATION: '#1890ff',
      FERTIGATION: '#52c41a',
      ACID_ADJUST: '#722ed1'
    }
    return map[type] || '#999'
  }

  const columns = [
    {
      title: '任务编码',
      dataIndex: 'taskCode',
      key: 'taskCode',
      width: 160,
      render: text => <span className="task-code">{text}</span>
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 180,
      ellipsis: true
    },
    {
      title: '类型',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 100,
      render: type => (
        <Tag color={getTaskTypeColor(type)}>
          {irrigationTaskTypeMap[type] || '未知'}
        </Tag>
      )
    },
    {
      title: '触发来源',
      dataIndex: 'triggerSource',
      key: 'triggerSource',
      width: 100,
      render: source => (
        <Tag color="blue">
          {irrigationTriggerSourceMap[source] || '未知'}
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: status => (
        <Badge
          status={irrigationTaskStatusMap[status]?.status}
          text={irrigationTaskStatusMap[status]?.text}
        />
      )
    },
    {
      title: '计划时长',
      dataIndex: 'planDuration',
      key: 'planDuration',
      width: 100,
      render: val => `${val} 分钟`
    },
    {
      title: '计划时间',
      dataIndex: 'planStartTime',
      key: 'planTime',
      width: 160,
      render: (_, record) => (
        <div className="plan-time">
          <div>{record.planStartTime ? new Date(record.planStartTime).toLocaleString('zh-CN') : '--'}</div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 0 && (
            <>
              <Button
                type="link"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartTask(record)}
                disabled={actionLoading}
              >
                开始
              </Button>
              <Button
                type="link"
                size="small"
                icon={<ThunderboltOutlined />}
                onClick={() => handleExecuteTask(record)}
                disabled={actionLoading}
              >
                执行
              </Button>
            </>
          )}
          {record.status === 1 && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleCompleteTask(record)}
              disabled={actionLoading}
            >
              完成
            </Button>
          )}
          {(record.status === 0 || record.status === 1) && (
            <Popconfirm
              title="确定要取消该任务吗？"
              onConfirm={() => handleCancelTask(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                disabled={actionLoading}
              >
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="irrigation-task-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">灌溉任务管理</h2>
          <span className="subtitle">灌溉任务监控与执行</span>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><ClockCircleOutlined /> 待执行</span>}
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><PlayCircleOutlined /> 执行中</span>}
              value={stats.executing}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><CheckCircleOutlined /> 已完成</span>}
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><ExclamationCircleOutlined /> 执行失败</span>}
              value={stats.failed}
              valueStyle={{ color: '#ff4d4f' }}
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
          <Form.Item name="taskType" label="任务类型">
            <Select placeholder="请选择类型" allowClear style={{ width: 150 }}>
              {Object.entries(irrigationTaskTypeMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
              {Object.entries(irrigationTaskStatusMap).map(([key, value]) => (
                <Option key={key} value={Number(key)}>
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
              共 <strong>{pagination.total}</strong> 条记录
            </span>
          </div>
          <div className="toolbar-right">
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadTaskList}
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
          dataSource={taskList}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1300 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <InfoCircleOutlined />
            <span>任务详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={900}
        footer={null}
      >
        {currentTask && (
          <div className="detail-content">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="任务编码">{currentTask.taskCode}</Descriptions.Item>
              <Descriptions.Item label="任务名称">{currentTask.taskName}</Descriptions.Item>
              <Descriptions.Item label="任务类型">
                <Tag color={getTaskTypeColor(currentTask.taskType)}>
                  {irrigationTaskTypeMap[currentTask.taskType]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="大棚">{currentTask.greenhouseName}</Descriptions.Item>
              <Descriptions.Item label="触发来源">
                <Tag color="blue">
                  {irrigationTriggerSourceMap[currentTask.triggerSource]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge
                  status={irrigationTaskStatusMap[currentTask.status]?.status}
                  text={irrigationTaskStatusMap[currentTask.status]?.text}
                />
              </Descriptions.Item>
              <Descriptions.Item label="关联配方">
                {currentTask.formulaName || '--'}
              </Descriptions.Item>
              <Descriptions.Item label="计划时长">
                {currentTask.planDuration} 分钟
              </Descriptions.Item>
              {currentTask.actualDuration && (
                <Descriptions.Item label="实际时长">
                  {currentTask.actualDuration} 分钟
                </Descriptions.Item>
              )}
              {currentTask.waterUsage !== null && (
                <Descriptions.Item label="用水量">
                  {currentTask.waterUsage} L
                </Descriptions.Item>
              )}
              {currentTask.fertilizerUsage !== null && (
                <Descriptions.Item label="用肥量">
                  {currentTask.fertilizerUsage} kg
                </Descriptions.Item>
              )}
              {currentTask.avgEc !== null && (
                <Descriptions.Item label="平均EC">
                  {currentTask.avgEc} mS/cm
                </Descriptions.Item>
              )}
              {currentTask.avgPh !== null && (
                <Descriptions.Item label="平均pH">
                  {currentTask.avgPh}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="计划开始时间">
                {currentTask.planStartTime ? new Date(currentTask.planStartTime).toLocaleString('zh-CN') : '--'}
              </Descriptions.Item>
              <Descriptions.Item label="计划结束时间">
                {currentTask.planEndTime ? new Date(currentTask.planEndTime).toLocaleString('zh-CN') : '--'}
              </Descriptions.Item>
              <Descriptions.Item label="实际开始时间">
                {currentTask.actualStartTime ? new Date(currentTask.actualStartTime).toLocaleString('zh-CN') : '--'}
              </Descriptions.Item>
              <Descriptions.Item label="实际结束时间">
                {currentTask.actualEndTime ? new Date(currentTask.actualEndTime).toLocaleString('zh-CN') : '--'}
              </Descriptions.Item>
              <Descriptions.Item label="创建人">{currentTask.operator}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(currentTask.createTime).toLocaleString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="备注说明" span={2}>
                {currentTask.remark || '--'}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">设备列表</Divider>
            <div className="device-list">
              {taskDevices.map((code, index) => (
                <Tag key={index} color="blue" className="device-tag">
                  {code}
                </Tag>
              ))}
            </div>

            <Divider orientation="left">执行记录</Divider>
            <Table
              size="small"
              pagination={false}
              dataSource={taskRecords}
              columns={[
                {
                  title: '时间',
                  dataIndex: 'time',
                  key: 'time',
                  width: 160,
                  render: time => new Date(time).toLocaleString('zh-CN')
                },
                { title: '操作', dataIndex: 'action', key: 'action', width: 120 },
                { title: '操作人', dataIndex: 'operator', key: 'operator' }
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default IrrigationTask
