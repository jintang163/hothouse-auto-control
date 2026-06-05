import { useState, useEffect } from 'react'
import {
  Table,
  Form,
  Select,
  Modal,
  Input,
  InputNumber,
  Button,
  Tag,
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Divider,
  Descriptions,
  Tabs,
  Empty
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CopyOutlined,
  CloudUploadOutlined,
  InboxOutlined,
  FileAddOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  EditFilled,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { api } from '@/utils/request'
import {
  prescriptionStatusMap,
  taskStatusMap,
  environmentIndicatorMap,
  fertilizerTypeMap,
  operationTypeMap
} from '@/config'
import useStore from '@/store'
import './index.scss'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

function Prescription() {
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)

  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [prescriptionList, setPrescriptionList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [currentPrescription, setCurrentPrescription] = useState(null)
  const [modalTitle, setModalTitle] = useState('')
  const [greenhouseList, setGreenhouseList] = useState([])
  const [cropVarietyList, setCropVarietyList] = useState([])
  const [growthStageList, setGrowthStageList] = useState([])
  const [environmentConfig, setEnvironmentConfig] = useState([])
  const [fertilizerConfig, setFertilizerConfig] = useState([])
  const [operationConfig, setOperationConfig] = useState([])

  useEffect(() => {
    loadGreenhouseList()
    loadCropVarietyList()
    loadPrescriptionList()
  }, [currentGreenhouseId, pagination.current, pagination.pageSize])

  const loadGreenhouseList = async () => {
    try {
      const data = await api.getGreenhouseList()
      setGreenhouseList(data || [])
    } catch (e) {
      console.error(e)
      setGreenhouseList([
        { id: 1, name: '1号大棚', code: 'GH001' },
        { id: 2, name: '2号大棚', code: 'GH002' },
        { id: 3, name: '3号大棚', code: 'GH003' }
      ])
    }
  }

  const loadCropVarietyList = async () => {
    try {
      const data = await api.getCropVarietyList()
      setCropVarietyList(data || [])
    } catch (e) {
      console.error(e)
      setCropVarietyList([
        { id: 1, name: '番茄', code: 'TOM001' },
        { id: 2, name: '黄瓜', code: 'CUC001' },
        { id: 3, name: '辣椒', code: 'PEP001' },
        { id: 4, name: '草莓', code: 'STR001' }
      ])
    }
  }

  const loadGrowthStages = async (varietyId) => {
    if (!varietyId) {
      setGrowthStageList([])
      return
    }
    try {
      const data = await api.getGrowthStages(varietyId)
      setGrowthStageList(data || [])
    } catch (e) {
      console.error(e)
      setGrowthStageList([
        { id: 1, name: '育苗期', days: 30 },
        { id: 2, name: '定植期', days: 15 },
        { id: 3, name: '生长期', days: 45 },
        { id: 4, name: '开花结果期', days: 60 },
        { id: 5, name: '采收期', days: 90 }
      ])
    }
  }

  const loadPrescriptionList = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const params = {
        greenhouseId: currentGreenhouseId,
        page: pagination.current,
        size: pagination.pageSize,
        ...values
      }
      const data = await api.getPrescriptionList(params)
      setPrescriptionList(data?.records || generateMockData())
      setPagination(prev => ({ ...prev, total: data?.total || 8 }))
    } catch (e) {
      console.error(e)
      setPrescriptionList(generateMockData())
      setPagination(prev => ({ ...prev, total: 8 }))
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => [
    {
      id: 1,
      prescriptionCode: 'PRE20240601001',
      prescriptionName: '番茄春季高产栽培方案',
      cropVarietyId: 1,
      cropVarietyName: '番茄',
      growthStageId: 4,
      growthStageName: '开花结果期',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      version: '1.0',
      status: 1,
      createTime: '2024-06-01 10:30:00',
      description: '针对番茄开花结果期的综合管理方案',
      environmentIndicators: [
        { id: 1, indicatorType: 'temperature', minValue: 22, maxValue: 28, unit: '℃' },
        { id: 2, indicatorType: 'humidity', minValue: 60, maxValue: 80, unit: '%' },
        { id: 3, indicatorType: 'light', minValue: 30000, maxValue: 80000, unit: 'lux' }
      ],
      fertilizerConfigs: [
        { id: 1, fertilizerType: 'nitrogen', dosage: 15, unit: 'kg/亩', frequency: '每10天' },
        { id: 2, fertilizerType: 'phosphorus', dosage: 10, unit: 'kg/亩', frequency: '每15天' }
      ],
      farmOperations: [
        { id: 1, operationType: 'pruning', description: '整枝打杈，保留主茎', frequency: '每周1次' },
        { id: 2, operationType: 'pollination', description: '人工辅助授粉', frequency: '每天上午' }
      ]
    },
    {
      id: 2,
      prescriptionCode: 'PRE20240602002',
      prescriptionName: '黄瓜秋季定植方案',
      cropVarietyId: 2,
      cropVarietyName: '黄瓜',
      growthStageId: 2,
      growthStageName: '定植期',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      version: '1.2',
      status: 1,
      createTime: '2024-06-02 14:20:00',
      description: '黄瓜定植后的管理方案',
      environmentIndicators: [
        { id: 1, indicatorType: 'temperature', minValue: 25, maxValue: 30, unit: '℃' },
        { id: 2, indicatorType: 'humidity', minValue: 70, maxValue: 85, unit: '%' }
      ],
      fertilizerConfigs: [],
      farmOperations: []
    },
    {
      id: 3,
      prescriptionCode: 'PRE20240515003',
      prescriptionName: '辣椒育苗期管理',
      cropVarietyId: 3,
      cropVarietyName: '辣椒',
      growthStageId: 1,
      growthStageName: '育苗期',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      version: '1.0',
      status: 0,
      createTime: '2024-05-15 09:00:00',
      description: '辣椒育苗期温湿度控制及水肥管理',
      environmentIndicators: [],
      fertilizerConfigs: [],
      farmOperations: []
    },
    {
      id: 4,
      prescriptionCode: 'PRE20240420004',
      prescriptionName: '草莓冬季保温方案',
      cropVarietyId: 4,
      cropVarietyName: '草莓',
      growthStageId: 3,
      growthStageName: '生长期',
      greenhouseId: 3,
      greenhouseName: '3号大棚',
      version: '2.1',
      status: 2,
      createTime: '2024-04-20 16:45:00',
      description: '草莓冬季生长温度控制方案',
      environmentIndicators: [],
      fertilizerConfigs: [],
      farmOperations: []
    },
    {
      id: 5,
      prescriptionCode: 'PRE20240310005',
      prescriptionName: '番茄生长期施肥方案',
      cropVarietyId: 1,
      cropVarietyName: '番茄',
      growthStageId: 3,
      growthStageName: '生长期',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      version: '1.5',
      status: 1,
      createTime: '2024-03-10 11:30:00',
      description: '',
      environmentIndicators: [],
      fertilizerConfigs: [],
      farmOperations: []
    },
    {
      id: 6,
      prescriptionCode: 'PRE20240228006',
      prescriptionName: '黄瓜病虫害防治',
      cropVarietyId: 2,
      cropVarietyName: '黄瓜',
      growthStageId: 4,
      growthStageName: '开花结果期',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      version: '1.0',
      status: 0,
      createTime: '2024-02-28 08:15:00',
      description: '黄瓜常见病虫害防治方案',
      environmentIndicators: [],
      fertilizerConfigs: [],
      farmOperations: []
    },
    {
      id: 7,
      prescriptionCode: 'PRE20240115007',
      prescriptionName: '辣椒采收期管理',
      cropVarietyId: 3,
      cropVarietyName: '辣椒',
      growthStageId: 5,
      growthStageName: '采收期',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      version: '1.0',
      status: 2,
      createTime: '2024-01-15 13:20:00',
      description: '辣椒采收期间的水肥管理',
      environmentIndicators: [],
      fertilizerConfigs: [],
      farmOperations: []
    },
    {
      id: 8,
      prescriptionCode: 'PRE20231220008',
      prescriptionName: '草莓开花期管理',
      cropVarietyId: 4,
      cropVarietyName: '草莓',
      growthStageId: 4,
      growthStageName: '开花结果期',
      greenhouseId: 3,
      greenhouseName: '3号大棚',
      version: '1.0',
      status: 2,
      createTime: '2023-12-20 10:00:00',
      description: '草莓开花期温湿度及授粉管理',
      environmentIndicators: [],
      fertilizerConfigs: [],
      farmOperations: []
    }
  ]

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadPrescriptionList, 0)
  }

  const handleReset = () => {
    form.resetFields()
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadPrescriptionList, 0)
  }

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
  }

  const handleAdd = () => {
    setModalTitle('新增处方')
    setCurrentPrescription(null)
    editForm.resetFields()
    setEnvironmentConfig([{ indicatorType: 'temperature', minValue: null, maxValue: null, unit: '℃' }])
    setFertilizerConfig([{ fertilizerType: 'nitrogen', dosage: null, unit: 'kg/亩', frequency: '' }])
    setOperationConfig([{ operationType: 'pruning', description: '', frequency: '' }])
    setEditModalVisible(true)
  }

  const handleEdit = (record) => {
    setModalTitle('编辑处方')
    setCurrentPrescription(record)
    editForm.setFieldsValue({
      ...record
    })
    setEnvironmentConfig(record.environmentIndicators?.length ? [...record.environmentIndicators] : [{ indicatorType: 'temperature', minValue: null, maxValue: null, unit: '℃' }])
    setFertilizerConfig(record.fertilizerConfigs?.length ? [...record.fertilizerConfigs] : [{ fertilizerType: 'nitrogen', dosage: null, unit: 'kg/亩', frequency: '' }])
    setOperationConfig(record.farmOperations?.length ? [...record.farmOperations] : [{ operationType: 'pruning', description: '', frequency: '' }])
    if (record.cropVarietyId) {
      loadGrowthStages(record.cropVarietyId)
    }
    setEditModalVisible(true)
  }

  const handleViewDetail = async (record) => {
    setCurrentPrescription(record)
    setDetailModalVisible(true)
    try {
      const data = await api.getPrescriptionDetail(record.id)
      if (data) {
        setCurrentPrescription(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCopy = async (record) => {
    try {
      await api.copyPrescription({ id: record.id })
      message.success('复制成功')
      loadPrescriptionList()
    } catch (e) {
      message.error('复制失败')
    }
  }

  const handlePublish = async (record) => {
    try {
      await api.publishPrescription(record.id)
      message.success('发布成功')
      loadPrescriptionList()
    } catch (e) {
      message.error('发布失败')
    }
  }

  const handleArchive = async (record) => {
    try {
      await api.archivePrescription(record.id)
      message.success('归档成功')
      loadPrescriptionList()
    } catch (e) {
      message.error('归档失败')
    }
  }

  const handleCreateNewVersion = async (record) => {
    try {
      await api.createNewVersion(record.id)
      message.success('创建新版本成功')
      loadPrescriptionList()
    } catch (e) {
      message.error('创建新版本失败')
    }
  }

  const handleDelete = async (record) => {
    try {
      await api.deletePrescription(record.id)
      message.success('删除成功')
      loadPrescriptionList()
    } catch (e) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await editForm.validateFields()
      setSubmitting(true)
      const data = {
        ...values,
        environmentIndicators: environmentConfig.filter(item => item.indicatorType),
        fertilizerConfigs: fertilizerConfig.filter(item => item.fertilizerType),
        farmOperations: operationConfig.filter(item => item.operationType)
      }
      if (currentPrescription) {
        await api.updatePrescription({ ...data, id: currentPrescription.id })
        message.success('更新成功')
      } else {
        await api.savePrescription(data)
        message.success('保存成功')
      }
      setEditModalVisible(false)
      loadPrescriptionList()
    } catch (e) {
      if (e.errorFields) return
      message.error('保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatistics = () => {
    const total = prescriptionList.length
    const published = prescriptionList.filter(d => d.status === 1).length
    const draft = prescriptionList.filter(d => d.status === 0).length
    const archived = prescriptionList.filter(d => d.status === 2).length
    return { total, published, draft, archived }
  }

  const stats = getStatistics()

  const addEnvironmentRow = () => {
    setEnvironmentConfig([...environmentConfig, { indicatorType: '', minValue: null, maxValue: null, unit: '' }])
  }

  const removeEnvironmentRow = (index) => {
    const newConfig = [...environmentConfig]
    newConfig.splice(index, 1)
    setEnvironmentConfig(newConfig)
  }

  const updateEnvironmentRow = (index, field, value) => {
    const newConfig = [...environmentConfig]
    newConfig[index][field] = value
    if (field === 'indicatorType') {
      newConfig[index].unit = environmentIndicatorMap[value]?.unit || ''
    }
    setEnvironmentConfig(newConfig)
  }

  const addFertilizerRow = () => {
    setFertilizerConfig([...fertilizerConfig, { fertilizerType: '', dosage: null, unit: '', frequency: '' }])
  }

  const removeFertilizerRow = (index) => {
    const newConfig = [...fertilizerConfig]
    newConfig.splice(index, 1)
    setFertilizerConfig(newConfig)
  }

  const updateFertilizerRow = (index, field, value) => {
    const newConfig = [...fertilizerConfig]
    newConfig[index][field] = value
    if (field === 'fertilizerType') {
      newConfig[index].unit = fertilizerTypeMap[value]?.unit || ''
    }
    setFertilizerConfig(newConfig)
  }

  const addOperationRow = () => {
    setOperationConfig([...operationConfig, { operationType: '', description: '', frequency: '' }])
  }

  const removeOperationRow = (index) => {
    const newConfig = [...operationConfig]
    newConfig.splice(index, 1)
    setOperationConfig(newConfig)
  }

  const updateOperationRow = (index, field, value) => {
    const newConfig = [...operationConfig]
    newConfig[index][field] = value
    setOperationConfig(newConfig)
  }

  const columns = [
    {
      title: '处方编码',
      dataIndex: 'prescriptionCode',
      key: 'prescriptionCode',
      width: 160,
      render: text => <span className="prescription-code">{text}</span>
    },
    {
      title: '处方名称',
      dataIndex: 'prescriptionName',
      key: 'prescriptionName',
      width: 200
    },
    {
      title: '作物品种',
      dataIndex: 'cropVarietyName',
      key: 'cropVarietyName',
      width: 100
    },
    {
      title: '生育期',
      dataIndex: 'growthStageName',
      key: 'growthStageName',
      width: 120
    },
    {
      title: '大棚',
      dataIndex: 'greenhouseName',
      key: 'greenhouseName',
      width: 100
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: status => (
        <Tag color={prescriptionStatusMap[status]?.color}>
          {prescriptionStatusMap[status]?.text || '未知'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160
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
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.status === 2}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record)}
          >
            复制
          </Button>
          {record.status === 0 && (
            <Button
              type="link"
              size="small"
              icon={<CloudUploadOutlined />}
              onClick={() => handlePublish(record)}
            >
              发布
            </Button>
          )}
          {record.status === 1 && (
            <Button
              type="link"
              size="small"
              icon={<InboxOutlined />}
              onClick={() => handleArchive(record)}
            >
              归档
            </Button>
          )}
          {record.status === 1 && (
            <Button
              type="link"
              size="small"
              icon={<FileAddOutlined />}
              onClick={() => handleCreateNewVersion(record)}
            >
              新版本
            </Button>
          )}
          <Popconfirm
            title="确定要删除该处方吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  }

  return (
    <div className="prescription-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">处方库管理</h2>
          <span className="subtitle">农业生产处方配置与管理</span>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><FileTextOutlined /> 处方总数</span>}
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><CheckCircleOutlined /> 已发布</span>}
              value={stats.published}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><EditFilled /> 草稿</span>}
              value={stats.draft}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><SafetyCertificateOutlined /> 已归档</span>}
              value={stats.archived}
              valueStyle={{ color: '#722ed1' }}
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
          <Form.Item name="cropVarietyId" label="作物品种">
            <Select placeholder="请选择作物品种" allowClear style={{ width: 150 }}>
              {cropVarietyList.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="growthStageId" label="生育期">
            <Select placeholder="请选择生育期" allowClear style={{ width: 150 }}>
              {growthStageList.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="greenhouseId" label="大棚">
            <Select placeholder="请选择大棚" allowClear style={{ width: 150 }}>
              {greenhouseList.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
              {Object.entries(prescriptionStatusMap).map(([key, value]) => (
                <Option key={key} value={Number(key)}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="处方名称/编码" style={{ width: 180 }} />
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
              已选择 <strong>{selectedRowKeys.length}</strong> 项
            </span>
          </div>
          <div className="toolbar-right">
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增处方
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadPrescriptionList}
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
          dataSource={prescriptionList}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowSelection={rowSelection}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>{modalTitle}</span>
          </Space>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={submitting}>
            保存
          </Button>
        ]}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          className="edit-form"
        >
          <Divider orientation="left">基本信息</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="prescriptionName"
                label="处方名称"
                rules={[{ required: true, message: '请输入处方名称' }]}
              >
                <Input placeholder="请输入处方名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="greenhouseId"
                label="适用大棚"
                rules={[{ required: true, message: '请选择大棚' }]}
              >
                <Select placeholder="请选择大棚">
                  {greenhouseList.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cropVarietyId"
                label="作物品种"
                rules={[{ required: true, message: '请选择作物品种' }]}
              >
                <Select
                  placeholder="请选择作物品种"
                  onChange={(value) => {
                    loadGrowthStages(value)
                    editForm.setFieldsValue({ growthStageId: undefined })
                  }}
                >
                  {cropVarietyList.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="growthStageId"
                label="生育期"
                rules={[{ required: true, message: '请选择生育期' }]}
              >
                <Select placeholder="请选择生育期">
                  {growthStageList.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.name} ({item.days}天)
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label="处方描述"
              >
                <TextArea rows={3} placeholder="请输入处方描述" maxLength={500} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">环境指标配置</Divider>
          <div className="config-table">
            <div className="config-header">
              <div className="col" style={{ width: '30%' }}>指标类型</div>
              <div className="col" style={{ width: '20%' }}>最小值</div>
              <div className="col" style={{ width: '20%' }}>最大值</div>
              <div className="col" style={{ width: '20%' }}>单位</div>
              <div className="col" style={{ width: '10%' }}>操作</div>
            </div>
            {environmentConfig.map((item, index) => (
              <div key={index} className="config-row">
                <div className="col" style={{ width: '30%' }}>
                  <Select
                    value={item.indicatorType}
                    onChange={(value) => updateEnvironmentRow(index, 'indicatorType', value)}
                    style={{ width: '100%' }}
                    placeholder="请选择"
                  >
                    {Object.entries(environmentIndicatorMap).map(([key, value]) => (
                      <Option key={key} value={key}>
                        {value.name}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="col" style={{ width: '20%' }}>
                  <InputNumber
                    value={item.minValue}
                    onChange={(value) => updateEnvironmentRow(index, 'minValue', value)}
                    style={{ width: '100%' }}
                    placeholder="最小值"
                  />
                </div>
                <div className="col" style={{ width: '20%' }}>
                  <InputNumber
                    value={item.maxValue}
                    onChange={(value) => updateEnvironmentRow(index, 'maxValue', value)}
                    style={{ width: '100%' }}
                    placeholder="最大值"
                  />
                </div>
                <div className="col" style={{ width: '20%' }}>
                  <Input value={item.unit} disabled style={{ width: '100%' }} />
                </div>
                <div className="col" style={{ width: '10%' }}>
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => removeEnvironmentRow(index)}
                    disabled={environmentConfig.length === 1}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
            <Button type="dashed" block icon={<PlusOutlined />} onClick={addEnvironmentRow}>
              添加指标
            </Button>
          </div>

          <Divider orientation="left">水肥配置</Divider>
          <div className="config-table">
            <div className="config-header">
              <div className="col" style={{ width: '25%' }}>肥料类型</div>
              <div className="col" style={{ width: '20%' }}>用量</div>
              <div className="col" style={{ width: '15%' }}>单位</div>
              <div className="col" style={{ width: '30%' }}>施用频率</div>
              <div className="col" style={{ width: '10%' }}>操作</div>
            </div>
            {fertilizerConfig.map((item, index) => (
              <div key={index} className="config-row">
                <div className="col" style={{ width: '25%' }}>
                  <Select
                    value={item.fertilizerType}
                    onChange={(value) => updateFertilizerRow(index, 'fertilizerType', value)}
                    style={{ width: '100%' }}
                    placeholder="请选择"
                  >
                    {Object.entries(fertilizerTypeMap).map(([key, value]) => (
                      <Option key={key} value={key}>
                        {value.name}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="col" style={{ width: '20%' }}>
                  <InputNumber
                    value={item.dosage}
                    onChange={(value) => updateFertilizerRow(index, 'dosage', value)}
                    style={{ width: '100%' }}
                    placeholder="用量"
                  />
                </div>
                <div className="col" style={{ width: '15%' }}>
                  <Input value={item.unit} disabled style={{ width: '100%' }} />
                </div>
                <div className="col" style={{ width: '30%' }}>
                  <Input
                    value={item.frequency}
                    onChange={(e) => updateFertilizerRow(index, 'frequency', e.target.value)}
                    style={{ width: '100%' }}
                    placeholder="如：每10天"
                  />
                </div>
                <div className="col" style={{ width: '10%' }}>
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => removeFertilizerRow(index)}
                    disabled={fertilizerConfig.length === 1}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
            <Button type="dashed" block icon={<PlusOutlined />} onClick={addFertilizerRow}>
              添加肥料
            </Button>
          </div>

          <Divider orientation="left">农事操作配置</Divider>
          <div className="config-table">
            <div className="config-header">
              <div className="col" style={{ width: '25%' }}>操作类型</div>
              <div className="col" style={{ width: '50%' }}>操作说明</div>
              <div className="col" style={{ width: '15%' }}>操作频率</div>
              <div className="col" style={{ width: '10%' }}>操作</div>
            </div>
            {operationConfig.map((item, index) => (
              <div key={index} className="config-row">
                <div className="col" style={{ width: '25%' }}>
                  <Select
                    value={item.operationType}
                    onChange={(value) => updateOperationRow(index, 'operationType', value)}
                    style={{ width: '100%' }}
                    placeholder="请选择"
                  >
                    {Object.entries(operationTypeMap).map(([key, value]) => (
                      <Option key={key} value={key}>
                        {value.name}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="col" style={{ width: '50%' }}>
                  <Input
                    value={item.description}
                    onChange={(e) => updateOperationRow(index, 'description', e.target.value)}
                    style={{ width: '100%' }}
                    placeholder="操作说明"
                  />
                </div>
                <div className="col" style={{ width: '15%' }}>
                  <Input
                    value={item.frequency}
                    onChange={(e) => updateOperationRow(index, 'frequency', e.target.value)}
                    style={{ width: '100%' }}
                    placeholder="频率"
                  />
                </div>
                <div className="col" style={{ width: '10%' }}>
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => removeOperationRow(index)}
                    disabled={operationConfig.length === 1}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
            <Button type="dashed" block icon={<PlusOutlined />} onClick={addOperationRow}>
              添加操作
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>处方详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={900}
        footer={null}
      >
        {currentPrescription && (
          <div className="detail-content">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="处方编码">{currentPrescription.prescriptionCode}</Descriptions.Item>
              <Descriptions.Item label="版本">{currentPrescription.version}</Descriptions.Item>
              <Descriptions.Item label="处方名称">{currentPrescription.prescriptionName}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={prescriptionStatusMap[currentPrescription.status]?.color}>
                  {prescriptionStatusMap[currentPrescription.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="作物品种">{currentPrescription.cropVarietyName}</Descriptions.Item>
              <Descriptions.Item label="生育期">{currentPrescription.growthStageName}</Descriptions.Item>
              <Descriptions.Item label="适用大棚">{currentPrescription.greenhouseName}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{currentPrescription.createTime}</Descriptions.Item>
              <Descriptions.Item label="处方描述" span={2}>{currentPrescription.description || '--'}</Descriptions.Item>
            </Descriptions>

            <Tabs defaultActiveKey="1" className="detail-tabs">
              <TabPane tab={<span><EnvironmentOutlined /> 环境指标配置</span>} key="1">
                {currentPrescription.environmentIndicators?.length > 0 ? (
                  <Table
                    rowKey="id"
                    size="small"
                    pagination={false}
                    dataSource={currentPrescription.environmentIndicators}
                    columns={[
                      {
                        title: '指标类型',
                        dataIndex: 'indicatorType',
                        key: 'indicatorType',
                        render: type => environmentIndicatorMap[type]?.name || type
                      },
                      { title: '最小值', dataIndex: 'minValue', key: 'minValue' },
                      { title: '最大值', dataIndex: 'maxValue', key: 'maxValue' },
                      { title: '单位', dataIndex: 'unit', key: 'unit' }
                    ]}
                  />
                ) : (
                  <Empty description="暂无环境指标配置" />
                )}
              </TabPane>
              <TabPane tab={<span><ThunderboltOutlined /> 水肥配置</span>} key="2">
                {currentPrescription.fertilizerConfigs?.length > 0 ? (
                  <Table
                    rowKey="id"
                    size="small"
                    pagination={false}
                    dataSource={currentPrescription.fertilizerConfigs}
                    columns={[
                      {
                        title: '肥料类型',
                        dataIndex: 'fertilizerType',
                        key: 'fertilizerType',
                        render: type => fertilizerTypeMap[type]?.name || type
                      },
                      { title: '用量', dataIndex: 'dosage', key: 'dosage' },
                      { title: '单位', dataIndex: 'unit', key: 'unit' },
                      { title: '施用频率', dataIndex: 'frequency', key: 'frequency' }
                    ]}
                  />
                ) : (
                  <Empty description="暂无水肥配置" />
                )}
              </TabPane>
              <TabPane tab={<span><EditOutlined /> 农事操作配置</span>} key="3">
                {currentPrescription.farmOperations?.length > 0 ? (
                  <Table
                    rowKey="id"
                    size="small"
                    pagination={false}
                    dataSource={currentPrescription.farmOperations}
                    columns={[
                      {
                        title: '操作类型',
                        dataIndex: 'operationType',
                        key: 'operationType',
                        render: type => operationTypeMap[type]?.name || type
                      },
                      { title: '操作说明', dataIndex: 'description', key: 'description' },
                      { title: '操作频率', dataIndex: 'frequency', key: 'frequency' }
                    ]}
                  />
                ) : (
                  <Empty description="暂无农事操作配置" />
                )}
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Prescription
