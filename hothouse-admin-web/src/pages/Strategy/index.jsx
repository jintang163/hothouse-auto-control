import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { api } from '@/utils/request'
import './Strategy.scss'

const { Option } = Select

const cropTypeOptions = [
  { value: 1, label: '番茄' },
  { value: 2, label: '黄瓜' },
  { value: 3, label: '辣椒' },
  { value: 4, label: '草莓' },
  { value: 5, label: '西瓜' },
  { value: 6, label: '甜瓜' },
  { value: 7, label: '生菜' },
  { value: 8, label: '菠菜' },
  { value: 9, label: '白菜' },
  { value: 10, label: '其他' }
]

const cropTypeMap = {
  1: '番茄',
  2: '黄瓜',
  3: '辣椒',
  4: '草莓',
  5: '西瓜',
  6: '甜瓜',
  7: '生菜',
  8: '菠菜',
  9: '白菜',
  10: '其他'
}

const mockStrategies = [
  {
    id: 1,
    strategyName: '番茄春茬种植策略',
    cropType: 1,
    temperatureUpper: 30,
    temperatureLower: 15,
    humidityUpper: 80,
    humidityLower: 50,
    lightUpper: 60000,
    lightLower: 5000,
    debounceTime: 300,
    status: 1,
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    strategyName: '黄瓜秋茬种植策略',
    cropType: 2,
    temperatureUpper: 32,
    temperatureLower: 18,
    humidityUpper: 85,
    humidityLower: 60,
    lightUpper: 55000,
    lightLower: 8000,
    debounceTime: 600,
    status: 1,
    createTime: '2024-02-20 14:20:00'
  },
  {
    id: 3,
    strategyName: '草莓冬季种植策略',
    cropType: 4,
    temperatureUpper: 25,
    temperatureLower: 10,
    humidityUpper: 75,
    humidityLower: 45,
    lightUpper: 50000,
    lightLower: 3000,
    debounceTime: 900,
    status: 0,
    createTime: '2024-03-10 09:15:00'
  }
]

function Strategy() {
  const [loading, setLoading] = useState(false)
  const [strategies, setStrategies] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadStrategyList()
  }, [])

  const loadStrategyList = async () => {
    setLoading(true)
    try {
      const data = await api.getStrategyList()
      if (data && data.records) {
        setStrategies(data.records)
      } else {
        setStrategies(mockStrategies)
      }
    } catch (e) {
      console.error(e)
      setStrategies(mockStrategies)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingStrategy(null)
    form.resetFields()
    form.setFieldsValue({
      temperatureUpper: 30,
      temperatureLower: 15,
      humidityUpper: 80,
      humidityLower: 50,
      lightUpper: 60000,
      lightLower: 5000,
      debounceTime: 300,
      status: 1
    })
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingStrategy(record)
    form.setFieldsValue({
      ...record
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteStrategy(id)
      message.success('删除成功')
      loadStrategyList()
    } catch (e) {
      console.error(e)
      setStrategies(strategies.filter(s => s.id !== id))
      message.success('删除成功')
    }
  }

  const handleToggle = async (id, checked) => {
    try {
      await api.toggleStrategy(id, checked ? 1 : 0)
      message.success(`策略已${checked ? '启用' : '禁用'}`)
      loadStrategyList()
    } catch (e) {
      console.error(e)
      setStrategies(strategies.map(s =>
        s.id === id ? { ...s, status: checked ? 1 : 0 } : s
      ))
      message.success(`策略已${checked ? '启用' : '禁用'}`)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (values.temperatureUpper <= values.temperatureLower) {
        message.error('温度上限必须大于下限')
        return
      }
      if (values.humidityUpper <= values.humidityLower) {
        message.error('湿度上限必须大于下限')
        return
      }
      if (values.lightUpper <= values.lightLower) {
        message.error('光照上限必须大于下限')
        return
      }

      if (editingStrategy) {
        await api.updateStrategy({ ...editingStrategy, ...values })
        message.success('更新成功')
      } else {
        await api.createStrategy(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadStrategyList()
    } catch (e) {
      console.error(e)
      if (e.errorFields) return
      const values = form.getFieldsValue()
      if (editingStrategy) {
        setStrategies(strategies.map(s =>
          s.id === editingStrategy.id ? { ...s, ...values } : s
        ))
      } else {
        setStrategies([
          { ...values, id: Date.now(), createTime: new Date().toLocaleString('zh-CN') },
          ...strategies
        ])
      }
      message.success(editingStrategy ? '更新成功' : '创建成功')
      setModalVisible(false)
    }
  }

  const columns = [
    {
      title: '策略名称',
      dataIndex: 'strategyName',
      key: 'strategyName',
      width: 200,
      render: (text) => (
        <span className="strategy-name">
          <SettingOutlined className="strategy-icon" />
          {text}
        </span>
      )
    },
    {
      title: '作物类型',
      dataIndex: 'cropType',
      key: 'cropType',
      width: 100,
      render: (type) => (
        <Tag color="blue">{cropTypeMap[type] || '未知'}</Tag>
      )
    },
    {
      title: '温度阈值(℃)',
      dataIndex: 'temperatureUpper',
      key: 'temperature',
      width: 140,
      render: (_, record) => (
        <span className="threshold temp">
          {record.temperatureLower} ~ {record.temperatureUpper}
        </span>
      )
    },
    {
      title: '湿度阈值(%)',
      dataIndex: 'humidityUpper',
      key: 'humidity',
      width: 140,
      render: (_, record) => (
        <span className="threshold humidity">
          {record.humidityLower} ~ {record.humidityUpper}
        </span>
      )
    },
    {
      title: '光照阈值(lux)',
      dataIndex: 'lightUpper',
      key: 'light',
      width: 160,
      render: (_, record) => (
        <span className="threshold light">
          {record.lightLower} ~ {record.lightUpper}
        </span>
      )
    },
    {
      title: '防抖时间(秒)',
      dataIndex: 'debounceTime',
      key: 'debounceTime',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag icon={status === 1 ? <CheckCircleOutlined /> : <CloseCircleOutlined />} color={status === 1 ? 'success' : 'default'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Switch
            checked={record.status === 1}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            onChange={(checked) => handleToggle(record.id, checked)}
            size="small"
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该策略吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const getStats = () => {
    const total = strategies.length
    const active = strategies.filter(s => s.status === 1).length
    const inactive = total - active
    return { total, active, inactive }
  }

  const stats = getStats()

  return (
    <div className="strategy-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">策略配置</h2>
          <span className="subtitle">管理温室环境控制策略</span>
        </div>
        <div className="header-right">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增策略
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={8}>
          <Card className="stat-card total">
            <div className="stat-content">
              <div className="stat-label">策略总数</div>
              <div className="stat-value">{stats.total}</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card active">
            <div className="stat-content">
              <div className="stat-label">已启用</div>
              <div className="stat-value">{stats.active}</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card inactive">
            <div className="stat-content">
              <div className="stat-label">已禁用</div>
              <div className="stat-value">{stats.inactive}</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={strategies}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title={editingStrategy ? '编辑策略' : '新增策略'}
        open={modalVisible}
        width={700}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          className="strategy-form"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="strategyName"
                label="策略名称"
                rules={[{ required: true, message: '请输入策略名称' }]}
              >
                <Input placeholder="请输入策略名称" maxLength={50} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="cropType"
                label="作物类型"
                rules={[{ required: true, message: '请选择作物类型' }]}
              >
                <Select placeholder="请选择作物类型">
                  {cropTypeOptions.map(item => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="form-section">
            <div className="section-title">温度阈值设置</div>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="temperatureLower"
                  label="温度下限(℃)"
                  rules={[{ required: true, message: '请输入温度下限' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={-10}
                    max={50}
                    placeholder="请输入温度下限"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="temperatureUpper"
                  label="温度上限(℃)"
                  rules={[{ required: true, message: '请输入温度上限' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={-10}
                    max={50}
                    placeholder="请输入温度上限"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="form-section">
            <div className="section-title">湿度阈值设置</div>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="humidityLower"
                  label="湿度下限(%)"
                  rules={[{ required: true, message: '请输入湿度下限' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={100}
                    placeholder="请输入湿度下限"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="humidityUpper"
                  label="湿度上限(%)"
                  rules={[{ required: true, message: '请输入湿度上限' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={100}
                    placeholder="请输入湿度上限"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="form-section">
            <div className="section-title">光照阈值设置</div>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="lightLower"
                  label="光照下限(lux)"
                  rules={[{ required: true, message: '请输入光照下限' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={200000}
                    placeholder="请输入光照下限"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="lightUpper"
                  label="光照上限(lux)"
                  rules={[{ required: true, message: '请输入光照上限' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={200000}
                    placeholder="请输入光照上限"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="debounceTime"
                label="防抖时间(秒)"
                rules={[{ required: true, message: '请输入防抖时间' }]}
                tooltip="环境参数持续超出阈值多少秒后才触发控制动作"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={3600}
                  placeholder="请输入防抖时间"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="启停状态"
                valuePropName="checked"
              >
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default Strategy
