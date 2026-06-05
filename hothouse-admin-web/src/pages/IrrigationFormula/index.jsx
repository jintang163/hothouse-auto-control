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
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Descriptions,
  Input,
  InputNumber,
  Divider
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StopOutlined,
  InfoCircleOutlined,
  DropOutlined
} from '@ant-design/icons'
import { api } from '@/utils/request'
import {
  irrigationFormulaStatusMap,
  cropList,
  growthStageList,
  greenhouseList
} from '@/config'
import useStore from '@/store'
import './index.scss'

const { Option } = Select
const { TextArea } = Input

function IrrigationFormula() {
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)

  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [formulaList, setFormulaList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentFormula, setCurrentFormula] = useState(null)
  const [editMode, setEditMode] = useState('add')

  useEffect(() => {
    loadFormulaList()
  }, [currentGreenhouseId, pagination.current, pagination.pageSize])

  const loadFormulaList = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const params = {
        greenhouseId: currentGreenhouseId,
        page: pagination.current,
        size: pagination.pageSize,
        ...values
      }
      const data = await api.getIrrigationFormulaList(params)
      setFormulaList(data?.records || generateMockData())
      setPagination(prev => ({ ...prev, total: data?.total || 8 }))
    } catch (e) {
      console.error(e)
      setFormulaList(generateMockData())
      setPagination(prev => ({ ...prev, total: 8 }))
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => [
    {
      id: 1,
      formulaCode: 'FORM-TOM-001',
      formulaName: '番茄生长期灌溉配方',
      cropVariety: '番茄',
      growthStage: '生长期',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      minHumidity: 60,
      maxHumidity: 80,
      irrigationDuration: 30,
      rotationOrder: 'VALVE001,VALVE002,VALVE003',
      targetEc: 1.8,
      targetPh: 6.0,
      nitrogenRatio: 1.0,
      phosphorusRatio: 0.5,
      potassiumRatio: 1.2,
      status: 1,
      createTime: '2024-01-15T10:30:00',
      updateTime: '2024-01-20T14:20:00',
      remark: '适用于番茄生长期，保证充足的水分和营养供应'
    },
    {
      id: 2,
      formulaCode: 'FORM-TOM-002',
      formulaName: '番茄结果期水肥配方',
      cropVariety: '番茄',
      growthStage: '结果期',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      minHumidity: 70,
      maxHumidity: 85,
      irrigationDuration: 45,
      rotationOrder: 'VALVE001,VALVE002,VALVE003',
      targetEc: 2.2,
      targetPh: 5.8,
      nitrogenRatio: 0.8,
      phosphorusRatio: 1.0,
      potassiumRatio: 1.5,
      status: 1,
      createTime: '2024-01-18T09:15:00',
      updateTime: '2024-01-22T11:30:00',
      remark: '结果期需增加磷钾肥比例，促进果实发育'
    },
    {
      id: 3,
      formulaCode: 'FORM-CUC-001',
      formulaName: '黄瓜幼苗期灌溉配方',
      cropVariety: '黄瓜',
      growthStage: '幼苗期',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      minHumidity: 65,
      maxHumidity: 75,
      irrigationDuration: 20,
      rotationOrder: 'VALVE004,VALVE005',
      targetEc: 1.2,
      targetPh: 6.2,
      nitrogenRatio: 1.2,
      phosphorusRatio: 0.6,
      potassiumRatio: 0.8,
      status: 0,
      createTime: '2024-02-01T16:45:00',
      updateTime: '2024-02-05T08:20:00',
      remark: '幼苗期配方，EC值较低，避免烧苗'
    },
    {
      id: 4,
      formulaCode: 'FORM-CUC-002',
      formulaName: '黄瓜开花期水肥配方',
      cropVariety: '黄瓜',
      growthStage: '开花期',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      minHumidity: 70,
      maxHumidity: 80,
      irrigationDuration: 35,
      rotationOrder: 'VALVE004,VALVE005,VALVE006',
      targetEc: 1.8,
      targetPh: 6.0,
      nitrogenRatio: 1.0,
      phosphorusRatio: 0.8,
      potassiumRatio: 1.2,
      status: 1,
      createTime: '2024-02-10T10:00:00',
      updateTime: '2024-02-12T15:30:00',
      remark: '开花期配方，促进花芽分化'
    },
    {
      id: 5,
      formulaCode: 'FORM-STR-001',
      formulaName: '草莓成熟期灌溉配方',
      cropVariety: '草莓',
      growthStage: '成熟期',
      greenhouseId: 3,
      greenhouseName: '3号大棚',
      minHumidity: 55,
      maxHumidity: 70,
      irrigationDuration: 25,
      rotationOrder: 'VALVE007,VALVE008',
      targetEc: 1.5,
      targetPh: 5.5,
      nitrogenRatio: 0.5,
      phosphorusRatio: 0.6,
      potassiumRatio: 1.8,
      status: 1,
      createTime: '2024-02-15T11:20:00',
      updateTime: '2024-02-18T09:10:00',
      remark: '成熟期高钾配方，增加果实甜度'
    },
    {
      id: 6,
      formulaCode: 'FORM-PEP-001',
      formulaName: '辣椒生长期灌溉配方',
      cropVariety: '辣椒',
      growthStage: '生长期',
      greenhouseId: 3,
      greenhouseName: '3号大棚',
      minHumidity: 60,
      maxHumidity: 75,
      irrigationDuration: 28,
      rotationOrder: 'VALVE009,VALVE010',
      targetEc: 1.6,
      targetPh: 6.0,
      nitrogenRatio: 1.0,
      phosphorusRatio: 0.5,
      potassiumRatio: 1.0,
      status: 0,
      createTime: '2024-02-20T14:30:00',
      updateTime: '2024-02-22T10:15:00',
      remark: '辣椒生长期标准配方'
    },
    {
      id: 7,
      formulaCode: 'FORM-EGG-001',
      formulaName: '茄子结果期水肥配方',
      cropVariety: '茄子',
      growthStage: '结果期',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      minHumidity: 65,
      maxHumidity: 80,
      irrigationDuration: 40,
      rotationOrder: 'VALVE001,VALVE002',
      targetEc: 2.0,
      targetPh: 6.0,
      nitrogenRatio: 0.9,
      phosphorusRatio: 0.7,
      potassiumRatio: 1.4,
      status: 1,
      createTime: '2024-02-25T09:45:00',
      updateTime: '2024-02-28T16:20:00',
      remark: '茄子结果期配方，需水量大'
    },
    {
      id: 8,
      formulaCode: 'FORM-WAT-001',
      formulaName: '西瓜膨大期水肥配方',
      cropVariety: '西瓜',
      growthStage: '结果期',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      minHumidity: 70,
      maxHumidity: 85,
      irrigationDuration: 50,
      rotationOrder: 'VALVE004,VALVE005,VALVE006',
      targetEc: 1.9,
      targetPh: 6.0,
      nitrogenRatio: 0.7,
      phosphorusRatio: 0.6,
      potassiumRatio: 2.0,
      status: 1,
      createTime: '2024-03-01T13:10:00',
      updateTime: '2024-03-05T11:40:00',
      remark: '西瓜膨大期高钾配方，促进糖分积累'
    }
  ]

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadFormulaList, 0)
  }

  const handleReset = () => {
    form.resetFields()
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadFormulaList, 0)
  }

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
  }

  const handleAdd = () => {
    setEditMode('add')
    setCurrentFormula(null)
    editForm.resetFields()
    editForm.setFieldsValue({
      greenhouseId: currentGreenhouseId,
      minHumidity: 60,
      maxHumidity: 80,
      irrigationDuration: 30,
      targetEc: 1.8,
      targetPh: 6.0,
      nitrogenRatio: 1.0,
      phosphorusRatio: 0.5,
      potassiumRatio: 1.0
    })
    setEditModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditMode('edit')
    setCurrentFormula(record)
    editForm.setFieldsValue({
      ...record
    })
    setEditModalVisible(true)
  }

  const handleViewDetail = (record) => {
    setCurrentFormula(record)
    setDetailModalVisible(true)
  }

  const handleDelete = async (id) => {
    setActionLoading(true)
    try {
      await api.deleteIrrigationFormula(id)
      message.success('删除成功')
      setTimeout(loadFormulaList, 1000)
    } catch (e) {
      message.error('删除失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEnable = async (id) => {
    setActionLoading(true)
    try {
      await api.enableIrrigationFormula(id)
      message.success('已启用')
      setTimeout(loadFormulaList, 1000)
    } catch (e) {
      message.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDisable = async (id) => {
    setActionLoading(true)
    try {
      await api.disableIrrigationFormula(id)
      message.success('已停用')
      setTimeout(loadFormulaList, 1000)
    } catch (e) {
      message.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await editForm.validateFields()
      setActionLoading(true)
      if (editMode === 'add') {
        await api.saveIrrigationFormula({
          ...values,
          formulaCode: `FORM-${values.cropVariety?.substring(0, 3).toUpperCase() || 'NEW'}-${String(Date.now()).slice(-4)}`
        })
        message.success('创建成功')
      } else {
        await api.updateIrrigationFormula({
          ...values,
          id: currentFormula.id
        })
        message.success('更新成功')
      }
      setEditModalVisible(false)
      setTimeout(loadFormulaList, 1000)
    } catch (e) {
      if (e.errorFields) return
      message.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatistics = () => {
    const total = formulaList.length
    const enabled = formulaList.filter(f => f.status === 1).length
    const disabled = formulaList.filter(f => f.status === 0).length
    return { total, enabled, disabled }
  }

  const stats = getStatistics()

  const columns = [
    {
      title: '配方编码',
      dataIndex: 'formulaCode',
      key: 'formulaCode',
      width: 140,
      render: text => <span className="formula-code">{text}</span>
    },
    {
      title: '配方名称',
      dataIndex: 'formulaName',
      key: 'formulaName',
      width: 180,
      ellipsis: true
    },
    {
      title: '作物品种',
      dataIndex: 'cropVariety',
      key: 'cropVariety',
      width: 100
    },
    {
      title: '生育期',
      dataIndex: 'growthStage',
      key: 'growthStage',
      width: 100
    },
    {
      title: '湿度范围(%)',
      dataIndex: 'minHumidity',
      key: 'humidityRange',
      width: 120,
      render: (_, record) => (
        <span>{record.minHumidity} ~ {record.maxHumidity}</span>
      )
    },
    {
      title: '灌溉时长(分钟)',
      dataIndex: 'irrigationDuration',
      key: 'irrigationDuration',
      width: 130
    },
    {
      title: 'EC/pH目标',
      dataIndex: 'targetEc',
      key: 'ecPh',
      width: 120,
      render: (_, record) => (
        <span>EC:{record.targetEc} / pH:{record.targetPh}</span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: status => (
        <Tag color={irrigationFormulaStatusMap[status]?.color}>
          {irrigationFormulaStatusMap[status]?.text}
        </Tag>
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
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === 0 ? (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleEnable(record.id)}
              disabled={actionLoading}
            >
              启用
            </Button>
          ) : (
            <Button
              type="link"
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => handleDisable(record.id)}
              disabled={actionLoading}
            >
              停用
            </Button>
          )}
          <Popconfirm
            title="确定要删除该配方吗？"
            onConfirm={() => handleDelete(record.id)}
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
        </Space>
      )
    }
  ]

  return (
    <div className="irrigation-formula-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">灌溉配方管理</h2>
          <span className="subtitle">智能灌溉配方配置与管理</span>
        </div>
        <div className="header-right">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增配方
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={8}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><InfoCircleOutlined /> 配方总数</span>}
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><CheckCircleOutlined /> 已启用</span>}
              value={stats.enabled}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><StopOutlined /> 已停用</span>}
              value={stats.disabled}
              valueStyle={{ color: '#999' }}
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
          <Form.Item name="cropVariety" label="作物品种">
            <Select placeholder="请选择作物" allowClear style={{ width: 150 }}>
              {cropList.map(item => (
                <Option key={item.id} value={item.name}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="growthStage" label="生育期">
            <Select placeholder="请选择生育期" allowClear style={{ width: 150 }}>
              {growthStageList.map(item => (
                <Option key={item.id} value={item.name}>
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
              {Object.entries(irrigationFormulaStatusMap).map(([key, value]) => (
                <Option key={key} value={Number(key)}>
                  {value.text}
                </Option>
              ))}
            </Select>
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
                onClick={loadFormulaList}
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
          dataSource={formulaList}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>{editMode === 'add' ? '新增配方' : '编辑配方'}</span>
          </Space>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={actionLoading}
        width={800}
        maskClosable={false}
      >
        <Form
          form={editForm}
          layout="vertical"
          className="edit-form"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="formulaName"
                label="配方名称"
                rules={[{ required: true, message: '请输入配方名称' }]}
              >
                <Input placeholder="请输入配方名称" maxLength={50} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="greenhouseId"
                label="所属大棚"
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
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cropVariety"
                label="作物品种"
                rules={[{ required: true, message: '请选择作物品种' }]}
              >
                <Select placeholder="请选择作物品种">
                  {cropList.map(item => (
                    <Option key={item.id} value={item.name}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="growthStage"
                label="生育期"
                rules={[{ required: true, message: '请选择生育期' }]}
              >
                <Select placeholder="请选择生育期">
                  {growthStageList.map(item => (
                    <Option key={item.id} value={item.name}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">灌溉参数</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="minHumidity"
                label="最低湿度(%)"
                rules={[{ required: true, message: '请输入最低湿度' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxHumidity"
                label="最高湿度(%)"
                rules={[{ required: true, message: '请输入最高湿度' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="irrigationDuration"
                label="灌溉时长(分钟)"
                rules={[{ required: true, message: '请输入灌溉时长' }]}
              >
                <InputNumber min={1} max={300} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="rotationOrder"
            label="轮灌顺序(设备编码)"
            rules={[{ required: true, message: '请输入轮灌顺序' }]}
          >
            <Input placeholder="多个设备用逗号分隔，如：VALVE001,VALVE002" />
          </Form.Item>

          <Divider orientation="left">水肥参数</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="targetEc"
                label="EC目标值(mS/cm)"
                rules={[{ required: true, message: '请输入EC目标值' }]}
              >
                <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="targetPh"
                label="pH目标值"
                rules={[{ required: true, message: '请输入pH目标值' }]}
              >
                <InputNumber min={4} max={9} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
            </Col>
          </Row>

          <Divider orientation="left">N/P/K比例</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="nitrogenRatio"
                label="氮(N)比例"
                rules={[{ required: true, message: '请输入氮比例' }]}
              >
                <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="phosphorusRatio"
                label="磷(P)比例"
                rules={[{ required: true, message: '请输入磷比例' }]}
              >
                <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="potassiumRatio"
                label="钾(K)比例"
                rules={[{ required: true, message: '请输入钾比例' }]}
              >
                <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remark"
            label="备注说明"
          >
            <TextArea rows={3} placeholder="请输入配方说明" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <InfoCircleOutlined />
            <span>配方详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={null}
      >
        {currentFormula && (
          <div className="detail-content">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="配方编码">{currentFormula.formulaCode}</Descriptions.Item>
              <Descriptions.Item label="配方名称">{currentFormula.formulaName}</Descriptions.Item>
              <Descriptions.Item label="作物品种">{currentFormula.cropVariety}</Descriptions.Item>
              <Descriptions.Item label="生育期">{currentFormula.growthStage}</Descriptions.Item>
              <Descriptions.Item label="所属大棚">{currentFormula.greenhouseName}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={irrigationFormulaStatusMap[currentFormula.status]?.color}>
                  {irrigationFormulaStatusMap[currentFormula.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="湿度范围">
                {currentFormula.minHumidity} ~ {currentFormula.maxHumidity}%
              </Descriptions.Item>
              <Descriptions.Item label="灌溉时长">
                {currentFormula.irrigationDuration} 分钟
              </Descriptions.Item>
              <Descriptions.Item label="轮灌顺序">{currentFormula.rotationOrder}</Descriptions.Item>
              <Descriptions.Item label="EC目标">
                <DropOutlined style={{ color: '#52c41a' }} /> {currentFormula.targetEc} mS/cm
              </Descriptions.Item>
              <Descriptions.Item label="pH目标">{currentFormula.targetPh}</Descriptions.Item>
              <Descriptions.Item label="N/P/K比例">
                {currentFormula.nitrogenRatio} : {currentFormula.phosphorusRatio} : {currentFormula.potassiumRatio}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(currentFormula.createTime).toLocaleString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(currentFormula.updateTime).toLocaleString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="备注说明" span={2}>
                {currentFormula.remark || '--'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default IrrigationFormula
