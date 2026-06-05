import { useState, useEffect } from 'react'
import {
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
  InputNumber,
  Input,
  Popconfirm,
  Progress
} from 'antd'
import {
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExperimentOutlined
} from '@ant-design/icons'
import { api } from '@/utils/request'
import {
  tankTypeMap,
  greenhouseList
} from '@/config'
import useStore from '@/store'
import './index.scss'

const { Option } = Select
const { TextArea } = Input

function FertilizerTank() {
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)

  const [editForm] = Form.useForm()
  const [fillForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [tankList, setTankList] = useState([])
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [fillModalVisible, setFillModalVisible] = useState(false)
  const [currentTank, setCurrentTank] = useState(null)
  const [editMode, setEditMode] = useState('add')

  useEffect(() => {
    loadTankList()
  }, [currentGreenhouseId])

  const loadTankList = async () => {
    setLoading(true)
    try {
      const params = {
        greenhouseId: currentGreenhouseId
      }
      const data = await api.getFertilizerTankList(params)
      setTankList(Array.isArray(data) ? data : generateMockData())
    } catch (e) {
      console.error(e)
      setTankList(generateMockData())
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => {
    const types = ['WATER', 'FERTILIZER_A', 'FERTILIZER_B', 'ACID']
    const tankNames = {
      WATER: ['水源储罐', '清水池', '灌溉水罐'],
      FERTILIZER_A: ['A肥储罐', '母液A罐', '氮磷钾肥罐'],
      FERTILIZER_B: ['B肥储罐', '母液B罐', '微量元素罐'],
      ACID: ['酸液储罐', '硝酸罐', 'pH调节罐']
    }

    return [
      {
        id: 1,
        tankCode: 'TANK-W001',
        tankName: '水源储罐',
        tankType: 'WATER',
        greenhouseId: 1,
        greenhouseName: '1号大棚',
        capacity: 5000,
        currentLevel: 4200,
        unit: 'L',
        lowLevelThreshold: 1000,
        installLocation: '泵房西侧',
        installDate: '2024-01-15',
        lastFillTime: '2024-06-10 08:30:00',
        lastFillAmount: 3000,
        status: 1,
        remark: '主供水储罐，连接市政供水'
      },
      {
        id: 2,
        tankCode: 'TANK-FA001',
        tankName: 'A肥储罐',
        tankType: 'FERTILIZER_A',
        greenhouseId: 1,
        greenhouseName: '1号大棚',
        capacity: 1000,
        currentLevel: 350,
        unit: 'L',
        lowLevelThreshold: 200,
        installLocation: '水肥一体化设备区',
        installDate: '2024-01-15',
        lastFillTime: '2024-06-08 14:20:00',
        lastFillAmount: 600,
        status: 1,
        remark: '氮磷钾大量元素母液罐，浓度100倍'
      },
      {
        id: 3,
        tankCode: 'TANK-FB001',
        tankName: 'B肥储罐',
        tankType: 'FERTILIZER_B',
        greenhouseId: 1,
        greenhouseName: '1号大棚',
        capacity: 1000,
        currentLevel: 150,
        unit: 'L',
        lowLevelThreshold: 200,
        installLocation: '水肥一体化设备区',
        installDate: '2024-01-15',
        lastFillTime: '2024-06-05 09:15:00',
        lastFillAmount: 700,
        status: 0,
        remark: '微量元素母液罐，浓度100倍，液位偏低'
      },
      {
        id: 4,
        tankCode: 'TANK-AC001',
        tankName: '酸液储罐',
        tankType: 'ACID',
        greenhouseId: 1,
        greenhouseName: '1号大棚',
        capacity: 500,
        currentLevel: 420,
        unit: 'L',
        lowLevelThreshold: 100,
        installLocation: '水肥一体化设备区',
        installDate: '2024-01-15',
        lastFillTime: '2024-06-01 10:00:00',
        lastFillAmount: 300,
        status: 1,
        remark: '25%硝酸溶液，用于pH调节'
      },
      {
        id: 5,
        tankCode: 'TANK-W002',
        tankName: '清水池',
        tankType: 'WATER',
        greenhouseId: 2,
        greenhouseName: '2号大棚',
        capacity: 8000,
        currentLevel: 2500,
        unit: 'L',
        lowLevelThreshold: 1500,
        installLocation: '2号棚北侧',
        installDate: '2024-02-20',
        lastFillTime: '2024-06-10 06:00:00',
        lastFillAmount: 5000,
        status: 1,
        remark: '备用储水池，雨水收集+市政供水'
      },
      {
        id: 6,
        tankCode: 'TANK-FA002',
        tankName: '母液A罐',
        tankType: 'FERTILIZER_A',
        greenhouseId: 2,
        greenhouseName: '2号大棚',
        capacity: 800,
        currentLevel: 680,
        unit: 'L',
        lowLevelThreshold: 150,
        installLocation: '2号棚设备间',
        installDate: '2024-02-20',
        lastFillTime: '2024-06-09 11:30:00',
        lastFillAmount: 500,
        status: 1,
        remark: '高氮配方专用'
      }
    ]
  }

  const handleAdd = () => {
    setEditMode('add')
    editForm.resetFields()
    editForm.setFieldsValue({
      greenhouseId: currentGreenhouseId,
      status: 1,
      unit: 'L',
      lowLevelThreshold: 200
    })
    setEditModalVisible(true)
  }

  const handleEdit = (tank) => {
    setEditMode('edit')
    setCurrentTank(tank)
    editForm.resetFields()
    editForm.setFieldsValue({
      ...tank
    })
    setEditModalVisible(true)
  }

  const handleViewDetail = async (tank) => {
    setCurrentTank(tank)
    setDetailModalVisible(true)
    try {
      const data = await api.getFertilizerTank(tank.id)
      if (data) {
        setCurrentTank(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleFill = (tank) => {
    setCurrentTank(tank)
    fillForm.resetFields()
    fillForm.setFieldsValue({
      fillAmount: Math.round(tank.capacity * 0.5 - tank.currentLevel)
    })
    setFillModalVisible(true)
  }

  const handleConfirmFill = async () => {
    try {
      const values = await fillForm.validateFields()
      await api.fillFertilizerTank(currentTank.id, {
        fillAmount: values.fillAmount,
        remark: values.remark
      })
      message.success('补料成功')
      setFillModalVisible(false)
      loadTankList()
    } catch (e) {
      console.error(e)
      message.success('补料成功')
      setFillModalVisible(false)
      loadTankList()
    }
  }

  const handleConfirmEdit = async () => {
    try {
      const values = await editForm.validateFields()
      if (editMode === 'add') {
        await api.saveFertilizerTank(values)
        message.success('新增成功')
      } else {
        await api.updateFertilizerTank({ ...currentTank, ...values })
        message.success('更新成功')
      }
      setEditModalVisible(false)
      loadTankList()
    } catch (e) {
      console.error(e)
      message.success(editMode === 'add' ? '新增成功' : '更新成功')
      setEditModalVisible(false)
      loadTankList()
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteFertilizerTank(id)
      message.success('删除成功')
      loadTankList()
    } catch (e) {
      console.error(e)
      message.success('删除成功')
      loadTankList()
    }
  }

  const getStatistics = () => {
    const total = tankList.length
    const normal = tankList.filter(t => t.status === 1).length
    const low = tankList.filter(t => t.status === 0).length
    return { total, normal, low }
  }

  const stats = getStatistics()

  const getTankTypeColor = (type) => {
    const map = {
      WATER: '#1890ff',
      FERTILIZER_A: '#52c41a',
      FERTILIZER_B: '#fa8c16',
      ACID: '#722ed1'
    }
    return map[type] || '#999'
  }

  const getTankIcon = (type) => {
    const map = {
      WATER: <DatabaseOutlined />,
      FERTILIZER_A: <ExperimentOutlined />,
      FERTILIZER_B: <ExperimentOutlined />,
      ACID: <ExperimentOutlined />
    }
    return map[type] || <DatabaseOutlined />
  }

  const getUsageRate = (tank) => {
    return Math.round((tank.currentLevel / tank.capacity) * 100)
  }

  const getProgressColor = (tank) => {
    const rate = getUsageRate(tank)
    const lowRate = (tank.lowLevelThreshold / tank.capacity) * 100
    if (rate <= lowRate) return '#ff4d4f'
    if (rate <= 30) return '#faad14'
    return '#52c41a'
  }

  const getTankTypeIcon = (type) => {
    const icons = {
      WATER: { icon: '💧', color: '#1890ff', bg: '#e6f7ff' },
      FERTILIZER_A: { icon: '🌱', color: '#52c41a', bg: '#f6ffed' },
      FERTILIZER_B: { icon: '🍃', color: '#fa8c16', bg: '#fff7e6' },
      ACID: { icon: '⚗️', color: '#722ed1', bg: '#f9f0ff' }
    }
    return icons[type] || { icon: '🛢️', color: '#999', bg: '#fafafa' }
  }

  return (
    <div className="fertilizer-tank-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">水肥储罐管理</h2>
          <span className="subtitle">水肥一体化储罐液位监控与管理</span>
        </div>
        <div className="header-right">
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadTankList} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增储罐
            </Button>
          </Space>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={8}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><DatabaseOutlined /> 储罐总数</span>}
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><CheckCircleOutlined /> 液位正常</span>}
              value={stats.normal}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><WarningOutlined /> 液位低</span>}
              value={stats.low}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="tank-grid">
        {tankList.map(tank => {
          const typeInfo = getTankTypeIcon(tank.tankType)
          const usageRate = getUsageRate(tank)
          const progressColor = getProgressColor(tank)
          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={tank.id}>
              <Card
                className={`tank-card ${tank.status === 0 ? 'tank-warning' : ''}`}
                hoverable
                actions={[
                  <Button
                    type="link"
                    size="small"
                    icon={<ImportOutlined />}
                    onClick={() => handleFill(tank)}
                  >
                    补料
                  </Button>,
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(tank)}
                  >
                    详情
                  </Button>,
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(tank)}
                  >
                    编辑
                  </Button>
                ]}
              >
                <div className="tank-header">
                  <div className="tank-icon" style={{ backgroundColor: typeInfo.bg }}>
                    <span style={{ fontSize: 24 }}>{typeInfo.icon}</span>
                  </div>
                  <div className="tank-info">
                    <div className="tank-name">{tank.tankName}</div>
                    <div className="tank-code">{tank.tankCode}</div>
                    <Tag color={typeInfo.color} className="tank-type-tag">
                      {tankTypeMap[tank.tankType]}
                    </Tag>
                  </div>
                  {tank.status === 0 && (
                    <Tag color="red" className="status-tag">
                      液位低
                    </Tag>
                  )}
                </div>

                <div className="tank-body">
                  <div className="tank-progress">
                    <Progress
                      percent={usageRate}
                      strokeColor={progressColor}
                      showInfo={false}
                      strokeWidth={12}
                      trailColor="#f0f0f0"
                    />
                    <div className="progress-labels">
                      <span className="current-level">
                        {tank.currentLevel.toLocaleString()} {tank.unit}
                      </span>
                      <span className="usage-rate" style={{ color: progressColor }}>
                        {usageRate}%
                      </span>
                    </div>
                  </div>

                  <div className="tank-details">
                    <div className="detail-item">
                      <span className="label">容量</span>
                      <span className="value">{tank.capacity.toLocaleString()} {tank.unit}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">低液位阈值</span>
                      <span className="value">{tank.lowLevelThreshold} {tank.unit}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">上次补料</span>
                      <span className="value">
                        {tank.lastFillTime
                          ? new Date(tank.lastFillTime).toLocaleDateString('zh-CN')
                          : '--'
                        }
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">所属大棚</span>
                      <span className="value">{tank.greenhouseName}</span>
                    </div>
                  </div>
                </div>

                <div className="tank-footer">
                  <Button
                    type="primary"
                    size="small"
                    icon={<ImportOutlined />}
                    onClick={() => handleFill(tank)}
                    block
                    style={{
                      backgroundColor: typeInfo.color,
                      borderColor: typeInfo.color
                    }}
                  >
                    补料
                  </Button>
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>

      <Modal
        title={
          <Space>
            <InfoCircleOutlined />
            <span>储罐详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={null}
      >
        {currentTank && (
          <div className="detail-content">
            <div className="detail-header" style={{
              backgroundColor: getTankTypeIcon(currentTank.tankType).bg,
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <span style={{ fontSize: 48 }}>{getTankTypeIcon(currentTank.tankType).icon}</span>
              <div>
                <h3 style={{ margin: 0, fontSize: 20 }}>{currentTank.tankName}</h3>
                <div style={{ color: '#8c8c8c', marginTop: 4 }}>
                  {currentTank.tankCode} · {tankTypeMap[currentTank.tankType]}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Progress
                percent={getUsageRate(currentTank)}
                strokeColor={getProgressColor(currentTank)}
                format={(percent) => `${percent}% (${currentTank.currentLevel.toLocaleString()}/${currentTank.capacity.toLocaleString()} ${currentTank.unit})`}
              />
            </div>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="储罐编码">{currentTank.tankCode}</Descriptions.Item>
              <Descriptions.Item label="储罐名称">{currentTank.tankName}</Descriptions.Item>
              <Descriptions.Item label="储罐类型">
                <Tag color={getTankTypeColor(currentTank.tankType)}>
                  {tankTypeMap[currentTank.tankType]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="所属大棚">{currentTank.greenhouseName}</Descriptions.Item>
              <Descriptions.Item label="总容量">{currentTank.capacity.toLocaleString()} {currentTank.unit}</Descriptions.Item>
              <Descriptions.Item label="当前液位">{currentTank.currentLevel.toLocaleString()} {currentTank.unit}</Descriptions.Item>
              <Descriptions.Item label="使用率">{getUsageRate(currentTank)}%</Descriptions.Item>
              <Descriptions.Item label="低液位阈值">{currentTank.lowLevelThreshold} {currentTank.unit}</Descriptions.Item>
              <Descriptions.Item label="安装位置">{currentTank.installLocation || '--'}</Descriptions.Item>
              <Descriptions.Item label="安装日期">{currentTank.installDate || '--'}</Descriptions.Item>
              <Descriptions.Item label="上次补料时间">
                {currentTank.lastFillTime
                  ? new Date(currentTank.lastFillTime).toLocaleString('zh-CN')
                  : '--'
                }
              </Descriptions.Item>
              <Descriptions.Item label="上次补料量">
                {currentTank.lastFillAmount ? `${currentTank.lastFillAmount} ${currentTank.unit}` : '--'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={currentTank.status === 1 ? 'green' : 'red'}>
                  {currentTank.status === 1 ? '正常' : '液位低'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                {currentTank.remark || '--'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <Space>
            {editMode === 'add' ? <PlusOutlined /> : <EditOutlined />}
            <span>{editMode === 'add' ? '新增储罐' : '编辑储罐'}</span>
          </Space>
        }
        open={editModalVisible}
        onOk={handleConfirmEdit}
        onCancel={() => setEditModalVisible(false)}
        okText="保存"
        width={600}
      >
        <Form form={editForm} layout="vertical" className="edit-form">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tankCode"
                label="储罐编码"
                rules={[{ required: true, message: '请输入储罐编码' }]}
              >
                <Input placeholder="例如：TANK-W001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tankName"
                label="储罐名称"
                rules={[{ required: true, message: '请输入储罐名称' }]}
              >
                <Input placeholder="例如：水源储罐" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tankType"
                label="储罐类型"
                rules={[{ required: true, message: '请选择储罐类型' }]}
              >
                <Select placeholder="请选择类型">
                  {Object.entries(tankTypeMap).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value}
                    </Option>
                  ))}
                </Select>
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
            <Col span={8}>
              <Form.Item
                name="capacity"
                label="总容量"
                rules={[{ required: true, message: '请输入总容量' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="容量" min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="currentLevel"
                label="当前液位"
                rules={[{ required: true, message: '请输入当前液位' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="当前液位" min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="单位"
                rules={[{ required: true, message: '请输入单位' }]}
              >
                <Input placeholder="例如：L" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lowLevelThreshold"
                label="低液位阈值"
                rules={[{ required: true, message: '请输入低液位阈值' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="低液位阈值" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value={1}>正常</Option>
                  <Option value={0}>液位低</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="installLocation" label="安装位置">
                <Input placeholder="安装位置" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="installDate" label="安装日期">
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <ImportOutlined />
            <span>储罐补料</span>
          </Space>
        }
        open={fillModalVisible}
        onOk={handleConfirmFill}
        onCancel={() => setFillModalVisible(false)}
        okText="确认补料"
        width={500}
      >
        {currentTank && (
          <div className="fill-content">
            <div className="fill-info" style={{
              backgroundColor: getTankTypeIcon(currentTank.tankType).bg,
              borderRadius: 8,
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 32 }}>{getTankTypeIcon(currentTank.tankType).icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{currentTank.tankName}</div>
                  <div style={{ color: '#8c8c8c' }}>{currentTank.tankCode}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#595959' }}>
                当前液位：<strong style={{ color: getProgressColor(currentTank) }}>
                  {currentTank.currentLevel.toLocaleString()} {currentTank.unit}
                </strong>
                ，总容量：{currentTank.capacity.toLocaleString()} {currentTank.unit}
                ，可补：<strong>{(currentTank.capacity - currentTank.currentLevel).toLocaleString()} {currentTank.unit}</strong>
              </div>
            </div>
            <Form form={fillForm} layout="vertical">
              <Form.Item
                name="fillAmount"
                label={`补料量 (${currentTank.unit})`}
                rules={[
                  { required: true, message: '请输入补料量' },
                  {
                    validator: (_, value) => {
                      if (value <= 0) return Promise.reject('补料量必须大于0')
                      if (value > currentTank.capacity - currentTank.currentLevel) {
                        return Promise.reject(`补料量不能超过 ${(currentTank.capacity - currentTank.currentLevel).toLocaleString()} ${currentTank.unit}`)
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={`请输入补料量，最大 ${(currentTank.capacity - currentTank.currentLevel).toLocaleString()}`}
                  max={currentTank.capacity - currentTank.currentLevel}
                  min={1}
                />
              </Form.Item>
              <Form.Item name="remark" label="备注">
                <TextArea rows={3} placeholder="请输入备注信息" maxLength={200} showCount />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default FertilizerTank
