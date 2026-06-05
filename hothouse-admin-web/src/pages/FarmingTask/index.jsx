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
  Divider,
  Descriptions,
  DatePicker,
  Input,
  InputNumber
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
  FormOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { api } from '@/utils/request'
import {
  taskStatusMap,
  taskPriorityMap,
  taskTypeMap,
  triggerSourceMap,
  executionMethodMap,
  greenhouseList
} from '@/config'
import useStore from '@/store'
import './index.scss'

const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

function FarmingTask() {
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)

  const [form] = Form.useForm()
  const [createForm] = Form.useForm()
  const [feedbackForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [taskList, setTaskList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [greenhouseOptions, setGreenhouseOptions] = useState([])

  useEffect(() => {
    loadGreenhouseOptions()
    loadTaskList()
  }, [currentGreenhouseId, pagination.current, pagination.pageSize])

  const loadGreenhouseOptions = async () => {
    try {
      const data = await api.getGreenhouseList()
      setGreenhouseOptions(data || greenhouseList)
    } catch (e) {
      console.error(e)
      setGreenhouseOptions(greenhouseList)
    }
  }

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
      const data = await api.getTaskList(params)
      setTaskList(data?.records || generateMockData())
      setPagination(prev => ({ ...prev, total: data?.total || 12 }))
    } catch (e) {
      console.error(e)
      setTaskList(generateMockData())
      setPagination(prev => ({ ...prev, total: 12 }))
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => [
    {
      id: 1,
      taskCode: 'TASK20240601001',
      taskName: '温度过高降温处理',
      taskType: 'ENV_ADJUST',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      triggerSource: 'AUTO_THRESHOLD',
      triggerReason: '温度超过35℃，需启动风机降温',
      executor: 'admin',
      executionMethod: 'AUTO',
      deviceCodes: 'FAN001,FAN002',
      status: 1,
      priority: 3,
      planStartTime: '2024-06-01T10:00:00',
      planEndTime: '2024-06-01T11:00:00',
      actualStartTime: '2024-06-01T10:05:00',
      actualEndTime: null,
      actualDuration: null,
      actualUsage: null,
      feedbackContent: null
    },
    {
      id: 2,
      taskCode: 'TASK20240601002',
      taskName: '定期浇水施肥',
      taskType: 'FERTIGATION',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      triggerSource: 'AUTO_TIMED',
      triggerReason: '每日定时水肥一体化作业',
      executor: 'admin',
      executionMethod: 'AUTO',
      deviceCodes: 'PUMP001,VALVE001',
      status: 0,
      priority: 2,
      planStartTime: '2024-06-01T14:00:00',
      planEndTime: '2024-06-01T14:30:00',
      actualStartTime: null,
      actualEndTime: null,
      actualDuration: null,
      actualUsage: null,
      feedbackContent: null
    },
    {
      id: 3,
      taskCode: 'TASK20240531003',
      taskName: '番茄整枝打杈',
      taskType: 'OPERATION',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      triggerSource: 'MANUAL',
      triggerReason: '番茄进入结果期，需整枝打杈',
      executor: 'worker1',
      executionMethod: 'MANUAL',
      deviceCodes: null,
      status: 2,
      priority: 2,
      planStartTime: '2024-05-31T08:00:00',
      planEndTime: '2024-05-31T11:00:00',
      actualStartTime: '2024-05-31T08:15:00',
      actualEndTime: '2024-05-31T10:45:00',
      actualDuration: 150,
      actualUsage: null,
      feedbackContent: '已完成整枝打杈，植株长势良好'
    },
    {
      id: 4,
      taskCode: 'TASK20240530004',
      taskName: '湿帘降温系统启动',
      taskType: 'ENV_ADJUST',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      triggerSource: 'AUTO_THRESHOLD',
      triggerReason: '温度超过38℃，启动湿帘降温',
      executor: 'admin',
      executionMethod: 'AUTO',
      deviceCodes: 'WET001,FAN001,FAN002',
      status: 4,
      priority: 4,
      planStartTime: '2024-05-30T12:00:00',
      planEndTime: '2024-05-30T14:00:00',
      actualStartTime: '2024-05-30T12:00:00',
      actualEndTime: '2024-05-30T12:15:00',
      actualDuration: 15,
      actualUsage: null,
      feedbackContent: '湿帘水泵故障，无法正常供水'
    },
    {
      id: 5,
      taskCode: 'TASK20240529005',
      taskName: '叶面喷施营养液',
      taskType: 'FERTIGATION',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      triggerSource: 'MANUAL',
      triggerReason: '根据生长周期，需补充叶面肥',
      executor: 'worker2',
      executionMethod: 'MANUAL',
      deviceCodes: null,
      status: 3,
      priority: 1,
      planStartTime: '2024-05-29T09:00:00',
      planEndTime: '2024-05-29T10:00:00',
      actualStartTime: null,
      actualEndTime: null,
      actualDuration: null,
      actualUsage: null,
      feedbackContent: '因降雨取消'
    },
    {
      id: 6,
      taskCode: 'TASK20240528006',
      taskName: '夜间通风降温',
      taskType: 'ENV_ADJUST',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      triggerSource: 'AUTO_TIMED',
      triggerReason: '夜间温度过高，定时通风',
      executor: 'admin',
      executionMethod: 'AUTO',
      deviceCodes: 'FAN001,FAN002',
      status: 2,
      priority: 1,
      planStartTime: '2024-05-28T22:00:00',
      planEndTime: '2024-05-29T05:00:00',
      actualStartTime: '2024-05-28T22:00:00',
      actualEndTime: '2024-05-29T04:30:00',
      actualDuration: 390,
      actualUsage: null,
      feedbackContent: '夜间温度下降较快，提前结束'
    },
    {
      id: 7,
      taskCode: 'TASK20240601007',
      taskName: '紧急降温处理',
      taskType: 'ENV_ADJUST',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      triggerSource: 'AUTO_THRESHOLD',
      triggerReason: '温度超过40℃，紧急降温',
      executor: 'admin',
      executionMethod: 'AUTO',
      deviceCodes: 'FAN003,FAN004,WET002',
      status: 1,
      priority: 4,
      planStartTime: '2024-06-01T11:30:00',
      planEndTime: '2024-06-01T13:00:00',
      actualStartTime: '2024-06-01T11:30:00',
      actualEndTime: null,
      actualDuration: null,
      actualUsage: null,
      feedbackContent: null
    },
    {
      id: 8,
      taskCode: 'TASK20240601008',
      taskName: '草莓采摘',
      taskType: 'OPERATION',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      triggerSource: 'MANUAL',
      triggerReason: '草莓成熟，进行采摘',
      executor: 'worker3',
      executionMethod: 'MANUAL',
      deviceCodes: null,
      status: 0,
      priority: 3,
      planStartTime: '2024-06-02T07:00:00',
      planEndTime: '2024-06-02T11:00:00',
      actualStartTime: null,
      actualEndTime: null,
      actualDuration: null,
      actualUsage: null,
      feedbackContent: null
    },
    {
      id: 9,
      taskCode: 'TASK20240531009',
      taskName: '灌溉施肥',
      taskType: 'FERTIGATION',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      triggerSource: 'AUTO_TIMED',
      triggerReason: '每两日一次灌溉施肥',
      executor: 'admin',
      executionMethod: 'AUTO',
      deviceCodes: 'PUMP002,VALVE002',
      status: 2,
      priority: 2,
      planStartTime: '2024-05-31T06:00:00',
      planEndTime: '2024-05-31T06:30:00',
      actualStartTime: '2024-05-31T06:00:00',
      actualEndTime: '2024-05-31T06:28:00',
      actualDuration: 28,
      actualUsage: 120.5,
      usageUnit: 'L',
      feedbackContent: '用水量120.5升，施肥量正常'
    },
    {
      id: 10,
      taskCode: 'TASK20240530010',
      taskName: '病虫害检查',
      taskType: 'OPERATION',
      greenhouseId: 3,
      greenhouseName: '3号大棚',
      triggerSource: 'MANUAL',
      triggerReason: '定期病虫害巡检',
      executor: 'worker1',
      executionMethod: 'MANUAL',
      deviceCodes: null,
      status: 2,
      priority: 2,
      planStartTime: '2024-05-30T09:00:00',
      planEndTime: '2024-05-30T11:00:00',
      actualStartTime: '2024-05-30T09:05:00',
      actualEndTime: '2024-05-30T10:40:00',
      actualDuration: 95,
      actualUsage: null,
      feedbackContent: '发现少量蚜虫，已喷施杀虫剂'
    },
    {
      id: 11,
      taskCode: 'TASK20240601011',
      taskName: '遮阳网展开',
      taskType: 'ENV_ADJUST',
      greenhouseId: 3,
      greenhouseName: '3号大棚',
      triggerSource: 'AUTO_THRESHOLD',
      triggerReason: '光照强度超过80000lux',
      executor: 'admin',
      executionMethod: 'AUTO',
      deviceCodes: 'SHD002',
      status: 0,
      priority: 2,
      planStartTime: '2024-06-01T12:00:00',
      planEndTime: '2024-06-01T16:00:00',
      actualStartTime: null,
      actualEndTime: null,
      actualDuration: null,
      actualUsage: null,
      feedbackContent: null
    },
    {
      id: 12,
      taskCode: 'TASK20240529012',
      taskName: '土壤湿度检测',
      taskType: 'OPERATION',
      greenhouseId: 3,
      greenhouseName: '3号大棚',
      triggerSource: 'MANUAL',
      triggerReason: '土壤湿度检测与记录',
      executor: 'worker2',
      executionMethod: 'MANUAL',
      deviceCodes: null,
      status: 4,
      priority: 1,
      planStartTime: '2024-05-29T14:00:00',
      planEndTime: '2024-05-29T15:00:00',
      actualStartTime: '2024-05-29T14:00:00',
      actualEndTime: '2024-05-29T14:20:00',
      actualDuration: 20,
      actualUsage: null,
      feedbackContent: '检测设备故障，无法获取准确数据'
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
    setDetailModalVisible(true)
  }

  const handleStartTask = async (task) => {
    setActionLoading(true)
    try {
      await api.startTask(task.id, 'admin')
      message.success('任务已开始执行')
      setTimeout(loadTaskList, 1000)
    } catch (e) {
      message.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleExecuteByDevice = async (task) => {
    setActionLoading(true)
    try {
      await api.executeTaskByDevice(task.id)
      message.success('设备联动执行已触发')
      setTimeout(loadTaskList, 1000)
    } catch (e) {
      message.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenFeedback = (task) => {
    setCurrentTask(task)
    feedbackForm.setFieldsValue({
      actualDuration: task.actualDuration,
      actualUsage: task.actualUsage,
      feedbackContent: task.feedbackContent
    })
    setFeedbackModalVisible(true)
  }

  const handleSubmitFeedback = async () => {
    try {
      const values = await feedbackForm.validateFields()
      setActionLoading(true)
      await api.submitTaskFeedback({
        taskId: currentTask.id,
        ...values
      })
      message.success('反馈提交成功')
      setFeedbackModalVisible(false)
      setTimeout(loadTaskList, 1000)
    } catch (e) {
      if (e.errorFields) return
      message.error('提交失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelTask = async (task) => {
    setActionLoading(true)
    try {
      await api.cancelTask(task.id, 'admin')
      message.success('任务已取消')
      setTimeout(loadTaskList, 1000)
    } catch (e) {
      message.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteTask = async (task) => {
    setActionLoading(true)
    try {
      await api.deleteTask(task.id)
      message.success('任务已删除')
      setTimeout(loadTaskList, 1000)
    } catch (e) {
      message.error('删除失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenCreate = () => {
    createForm.resetFields()
    createForm.setFieldsValue({
      greenhouseId: currentGreenhouseId,
      priority: 2,
      triggerSource: 'MANUAL',
      executionMethod: 'MANUAL'
    })
    setCreateModalVisible(true)
  }

  const handleCreateTask = async () => {
    try {
      const values = await createForm.validateFields()
      setActionLoading(true)
      const taskCode = `TASK${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
      await api.createTask({
        ...values,
        taskCode,
        planStartTime: values.planTime[0].toISOString(),
        planEndTime: values.planTime[1].toISOString()
      })
      message.success('任务创建成功')
      setCreateModalVisible(false)
      setTimeout(loadTaskList, 1000)
    } catch (e) {
      if (e.errorFields) return
      message.error('创建失败')
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

  const columns = [
    {
      title: '任务编码',
      dataIndex: 'taskCode',
      key: 'taskCode',
      width: 140,
      render: text => <span className="task-code">{text}</span>
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 160,
      ellipsis: true
    },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 100,
      render: type => (
        <Tag color={taskTypeMap[type]?.color}>
          {taskTypeMap[type]?.text || '未知'}
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
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: priority => (
        <Tag color={taskPriorityMap[priority]?.color}>
          {taskPriorityMap[priority]?.text || '未知'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: status => (
        <Badge
          status={taskStatusMap[status]?.color}
          text={taskStatusMap[status]?.text || '未知'}
        />
      )
    },
    {
      title: '执行人',
      dataIndex: 'executor',
      key: 'executor',
      width: 100
    },
    {
      title: '计划时间',
      dataIndex: 'planStartTime',
      key: 'planStartTime',
      width: 160,
      render: (_, record) => (
        <div className="plan-time">
          <div>{record.planStartTime ? new Date(record.planStartTime).toLocaleString('zh-CN') : '--'}</div>
          <div className="time-range">至 {record.planEndTime ? new Date(record.planEndTime).toLocaleString('zh-CN') : '--'}</div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
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
                开始执行
              </Button>
              {record.executionMethod === 'AUTO' && record.deviceCodes && (
                <Button
                  type="link"
                  size="small"
                  icon={<ThunderboltOutlined />}
                  onClick={() => handleExecuteByDevice(record)}
                  disabled={actionLoading}
                >
                  设备联动
                </Button>
              )}
            </>
          )}
          {(record.status === 1 || record.status === 0) && (
            <Button
              type="link"
              size="small"
              icon={<FormOutlined />}
              onClick={() => handleOpenFeedback(record)}
            >
              提交反馈
            </Button>
          )}
          {record.status === 0 && (
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
          {(record.status === 2 || record.status === 3 || record.status === 4) && (
            <Popconfirm
              title="确定要删除该任务吗？"
              onConfirm={() => handleDeleteTask(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={actionLoading}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="task-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">任务管理</h2>
          <span className="subtitle">农事任务监控与执行</span>
        </div>
        <div className="header-right">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            创建任务
          </Button>
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
              {greenhouseOptions.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="taskType" label="任务类型">
            <Select placeholder="请选择类型" allowClear style={{ width: 150 }}>
              {Object.entries(taskTypeMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
              {Object.entries(taskStatusMap).map(([key, value]) => (
                <Option key={key} value={Number(key)}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select placeholder="请选择优先级" allowClear style={{ width: 120 }}>
              {Object.entries(taskPriorityMap).map(([key, value]) => (
                <Option key={key} value={Number(key)}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="executor" label="执行人">
            <Input placeholder="请输入执行人" style={{ width: 120 }} allowClear />
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
          scroll={{ x: 1200 }}
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
                <Tag color={taskTypeMap[currentTask.taskType]?.color}>
                  {taskTypeMap[currentTask.taskType]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="大棚">{currentTask.greenhouseName}</Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={taskPriorityMap[currentTask.priority]?.color}>
                  {taskPriorityMap[currentTask.priority]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge
                  status={taskStatusMap[currentTask.status]?.color}
                  text={taskStatusMap[currentTask.status]?.text}
                />
              </Descriptions.Item>
              <Descriptions.Item label="触发来源">
                <Tag color={triggerSourceMap[currentTask.triggerSource]?.color}>
                  {triggerSourceMap[currentTask.triggerSource]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="执行方式">
                <Tag color={executionMethodMap[currentTask.executionMethod]?.color}>
                  {executionMethodMap[currentTask.executionMethod]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="执行人">{currentTask.executor}</Descriptions.Item>
              <Descriptions.Item label="关联设备">
                {currentTask.deviceCodes || '--'}
              </Descriptions.Item>
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
              {currentTask.actualDuration && (
                <Descriptions.Item label="实际耗时">
                  {currentTask.actualDuration} 分钟
                </Descriptions.Item>
              )}
              {currentTask.actualUsage && (
                <Descriptions.Item label="实际用量">
                  {currentTask.actualUsage} {currentTask.usageUnit || ''}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="触发原因" span={2}>
                {currentTask.triggerReason || '--'}
              </Descriptions.Item>
              {currentTask.feedbackContent && (
                <Descriptions.Item label="反馈内容" span={2}>
                  {currentTask.feedbackContent}
                </Descriptions.Item>
              )}
            </Descriptions>

            {currentTask.deviceCodes && (
              <>
                <Divider orientation="left">设备列表</Divider>
                <div className="device-list">
                  {currentTask.deviceCodes.split(',').map((code, index) => (
                    <Tag key={index} color="blue" className="device-tag">
                      {code}
                    </Tag>
                  ))}
                </div>
              </>
            )}

            <Divider orientation="left">执行记录</Divider>
            <Table
              size="small"
              pagination={false}
              dataSource={[
                { time: currentTask.planStartTime, action: '任务创建', operator: currentTask.triggerSource === 'MANUAL' ? currentTask.executor : 'system' },
                ...(currentTask.actualStartTime ? [{ time: currentTask.actualStartTime, action: '开始执行', operator: currentTask.executor }] : []),
                ...(currentTask.actualEndTime ? [{ time: currentTask.actualEndTime, action: '执行结束', operator: currentTask.executor }] : [])
              ].filter(item => item.time)}
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

      <Modal
        title={
          <Space>
            <FormOutlined />
            <span>提交反馈</span>
          </Space>
        }
        open={feedbackModalVisible}
        onCancel={() => setFeedbackModalVisible(false)}
        onOk={handleSubmitFeedback}
        confirmLoading={actionLoading}
        width={600}
      >
        <Form
          form={feedbackForm}
          layout="vertical"
          className="feedback-form"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="actualDuration"
                label="实际耗时（分钟）"
                rules={[{ required: true, message: '请输入实际耗时' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入实际耗时" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="actualUsage"
                label="实际用量"
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入实际用量" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="feedbackContent"
            label="反馈内容"
            rules={[{ required: true, message: '请输入反馈内容' }]}
          >
            <TextArea rows={4} placeholder="请详细描述执行情况和结果" showCount maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <PlusOutlined />
            <span>创建任务</span>
          </Space>
        }
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={handleCreateTask}
        confirmLoading={actionLoading}
        width={700}
      >
        <Form
          form={createForm}
          layout="vertical"
          className="create-form"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="taskName"
                label="任务名称"
                rules={[{ required: true, message: '请输入任务名称' }]}
              >
                <Input placeholder="请输入任务名称" maxLength={50} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="taskType"
                label="任务类型"
                rules={[{ required: true, message: '请选择任务类型' }]}
              >
                <Select placeholder="请选择任务类型">
                  {Object.entries(taskTypeMap).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="greenhouseId"
                label="大棚"
                rules={[{ required: true, message: '请选择大棚' }]}
              >
                <Select placeholder="请选择大棚">
                  {greenhouseOptions.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  {Object.entries(taskPriorityMap).map(([key, value]) => (
                    <Option key={key} value={Number(key)}>
                      <Tag color={value.color}>{value.text}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="executor"
                label="执行人"
                rules={[{ required: true, message: '请输入执行人' }]}
              >
                <Input placeholder="请输入执行人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="executionMethod"
                label="执行方式"
                rules={[{ required: true, message: '请选择执行方式' }]}
              >
                <Select placeholder="请选择执行方式">
                  {Object.entries(executionMethodMap).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="planTime"
            label="计划时间"
            rules={[{ required: true, message: '请选择计划时间' }]}
          >
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="triggerReason"
            label="触发原因"
            rules={[{ required: true, message: '请输入触发原因' }]}
          >
            <TextArea rows={3} placeholder="请输入任务触发原因或说明" maxLength={200} showCount />
          </Form.Item>
          <Form.Item
            name="deviceCodes"
            label="关联设备编码"
          >
            <Input placeholder="多个设备用逗号分隔，如：FAN001,FAN002" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default FarmingTask
