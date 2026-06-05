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
  Badge
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ApartmentOutlined,
  BulbOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { api } from '@/utils/request'
import {
  irrigationDeviceTypeMap,
  irrigationDeviceStatusMap,
  greenhouseList
} from '@/config'
import useStore from '@/store'
import './index.scss'

const { Option } = Select
const { TextArea } = Input

function IrrigationDevice() {
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)

  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [deviceList, setDeviceList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentDevice, setCurrentDevice] = useState(null)
  const [editMode, setEditMode] = useState('add')

  useEffect(() => {
    loadDeviceList()
  }, [currentGreenhouseId, pagination.current, pagination.pageSize])

  const loadDeviceList = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const params = {
        greenhouseId: currentGreenhouseId,
        page: pagination.current,
        size: pagination.pageSize,
        ...values
      }
      const data = await api.getIrrigationDeviceList(params)
      setDeviceList(data?.records || generateMockData())
      setPagination(prev => ({ ...prev, total: data?.total || 12 }))
    } catch (e) {
      console.error(e)
      setDeviceList(generateMockData())
      setPagination(prev => ({ ...prev, total: 12 }))
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => [
    {
      id: 1,
      deviceCode: 'VALVE001',
      deviceName: '1号灌溉电磁阀',
      deviceType: 'SOLENOID_VALVE',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      area: '东片区',
      flowRate: 2.5,
      status: 1,
      lastHeartbeat: new Date().toISOString(),
      installDate: '2024-01-10',
      manufacturer: '某灌溉设备公司',
      model: 'SV-25A',
      ratedVoltage: 'DC24V',
      nominalPressure: '1.0MPa',
      currentFlow: 0,
      workingHours: 1250,
      remark: '控制1区灌溉'
    },
    {
      id: 2,
      deviceCode: 'VALVE002',
      deviceName: '2号灌溉电磁阀',
      deviceType: 'SOLENOID_VALVE',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      area: '西片区',
      flowRate: 2.5,
      status: 1,
      lastHeartbeat: new Date().toISOString(),
      installDate: '2024-01-10',
      manufacturer: '某灌溉设备公司',
      model: 'SV-25A',
      ratedVoltage: 'DC24V',
      nominalPressure: '1.0MPa',
      currentFlow: 0,
      workingHours: 1180,
      remark: '控制2区灌溉'
    },
    {
      id: 3,
      deviceCode: 'FPUMP001',
      deviceName: 'A肥施肥泵',
      deviceType: 'FERTILIZER_PUMP',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      area: '泵房',
      flowRate: 5.0,
      status: 1,
      lastHeartbeat: new Date().toISOString(),
      installDate: '2024-01-08',
      manufacturer: '某泵业公司',
      model: 'FP-100',
      ratedVoltage: '380V',
      nominalPressure: '0.6MPa',
      currentFlow: 0,
      workingHours: 890,
      remark: 'A肥罐施肥泵'
    },
    {
      id: 4,
      deviceCode: 'FPUMP002',
      deviceName: 'B肥施肥泵',
      deviceType: 'FERTILIZER_PUMP',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      area: '泵房',
      flowRate: 5.0,
      status: 1,
      lastHeartbeat: new Date().toISOString(),
      installDate: '2024-01-08',
      manufacturer: '某泵业公司',
      model: 'FP-100',
      ratedVoltage: '380V',
      nominalPressure: '0.6MPa',
      currentFlow: 0,
      workingHours: 856,
      remark: 'B肥罐施肥泵'
    },
    {
      id: 5,
      deviceCode: 'APUMP001',
      deviceName: '酸调节泵',
      deviceType: 'ACID_PUMP',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      area: '泵房',
      flowRate: 2.0,
      status: 0,
      lastHeartbeat: new Date(Date.now() - 7200000).toISOString(),
      installDate: '2024-01-08',
      manufacturer: '某泵业公司',
      model: 'AP-50',
      ratedVoltage: '380V',
      nominalPressure: '0.4MPa',
      currentFlow: 0,
      workingHours: 320,
      remark: 'pH调节酸泵'
    },
    {
      id: 6,
      deviceCode: 'WM001',
      deviceName: '主管道水表',
      deviceType: 'WATER_METER',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      area: '主管道',
      flowRate: 0,
      status: 1,
      lastHeartbeat: new Date().toISOString(),
      installDate: '2024-01-05',
      manufacturer: '某仪表公司',
      model: 'WM-50',
      ratedVoltage: 'DC12V',
      nominalPressure: '1.6MPa',
      currentFlow: 0,
      workingHours: 2160,
      totalUsage: 125680,
      remark: '进水主管道流量计'
    },
    {
      id: 7,
      deviceCode: 'ECPH001',
      deviceName: 'ECpH传感器1',
      deviceType: 'EC_PH_SENSOR',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      area: '出水管道',
      flowRate: 0,
      status: 1,
      lastHeartbeat: new Date().toISOString(),
      installDate: '2024-01-06',
      manufacturer: '某传感公司',
      model: 'ECP-100',
      ratedVoltage: 'DC24V',
      currentEc: 1.8,
      currentPh: 6.0,
      workingHours: 2100,
      remark: '出水EC/pH监测'
    },
    {
      id: 8,
      deviceCode: 'PS001',
      deviceName: '主管道压力传感器',
      deviceType: 'PRESSURE_SENSOR',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      area: '主管道',
      flowRate: 0,
      status: 1,
      lastHeartbeat: new Date().toISOString(),
      installDate: '2024-01-06',
      manufacturer: '某传感公司',
      model: 'PS-200',
      ratedVoltage: 'DC24V',
      currentPressure: 0.35,
      workingHours: 2150,
      remark: '主管道压力监测'
    },
    {
      id: 9,
      deviceCode: 'LS001',
      deviceName: '水源罐液位传感器',
      deviceType: 'LEVEL_SENSOR',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      area: '水源罐',
      flowRate: 0,
      status: 1,
      lastHeartbeat: new Date().toISOString(),
      installDate: '2024-01-05',
      manufacturer: '某传感公司',
      model: 'LS-1000',
      ratedVoltage: 'DC24V',
      currentLevel: 75,
      tankCapacity: 5000,
      workingHours: 2200,
      remark: '水源罐液位监测'
    },
    {
      id: 10,
      deviceCode: 'VALVE003',
      deviceName: '3号灌溉电磁阀',
      deviceType: 'SOLENOID_VALVE',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      area: '南区',
      flowRate: 2.5,
      status: 2,
      lastHeartbeat: new Date(Date.now() - 1800000).toISOString(),
      installDate: '2024-01-12',
      manufacturer: '某灌溉设备公司',
      model: 'SV-25A',
      ratedVoltage: 'DC24V',
      nominalPressure: '1.0MPa',
      currentFlow: 0,
      workingHours: 720,
      remark: '阀门故障，待检修'
    },
    {
      id: 11,
      deviceCode: 'ECPH002',
      deviceName: 'ECpH传感器2',
      deviceType: 'EC_PH_SENSOR',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      area: '出水管道',
      flowRate: 0,
      status: 1,
      lastHeartbeat: new Date().toISOString(),
      installDate: '2024-01-15',
      manufacturer: '某传感公司',
      model: 'ECP-100',
      ratedVoltage: 'DC24V',
      currentEc: 2.0,
      currentPh: 5.8,
      workingHours: 1800,
      remark: '2号棚出水监测'
    },
    {
      id: 12,
      deviceCode: 'LS002',
      deviceName: 'A肥罐液位传感器',
      deviceType: 'LEVEL_SENSOR',
      greenhouseId: 2,
      greenhouseName: '2号大棚',
      area: 'A肥罐',
      flowRate: 0,
      status: 1,
      lastHeartbeat: new Date().toISOString(),
      installDate: '2024-01-10',
      manufacturer: '某传感公司',
      model: 'LS-1000',
      ratedVoltage: 'DC24V',
      currentLevel: 45,
      tankCapacity: 2000,
      workingHours: 1900,
      remark: 'A肥罐液位监测'
    }
  ]

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadDeviceList, 0)
  }

  const handleReset = () => {
    form.resetFields()
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadDeviceList, 0)
  }

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
  }

  const handleAdd = () => {
    setEditMode('add')
    setCurrentDevice(null)
    editForm.resetFields()
    editForm.setFieldsValue({
      greenhouseId: currentGreenhouseId,
      status: 1
    })
    setEditModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditMode('edit')
    setCurrentDevice(record)
    editForm.setFieldsValue({
      ...record
    })
    setEditModalVisible(true)
  }

  const handleViewDetail = (record) => {
    setCurrentDevice(record)
    setDetailModalVisible(true)
  }

  const handleDelete = async (id) => {
    setActionLoading(true)
    try {
      await api.deleteIrrigationDevice(id)
      message.success('删除成功')
      setTimeout(loadDeviceList, 1000)
    } catch (e) {
      message.error('删除失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await editForm.validateFields()
      setActionLoading(true)
      if (editMode === 'add') {
        await api.saveIrrigationDevice({
          ...values,
          deviceCode: `${values.deviceType?.substring(0, 2).toUpperCase() || 'DV'}-${String(Date.now()).slice(-4)}`
        })
        message.success('创建成功')
      } else {
        await api.updateIrrigationDevice({
          ...values,
          id: currentDevice.id
        })
        message.success('更新成功')
      }
      setEditModalVisible(false)
      setTimeout(loadDeviceList, 1000)
    } catch (e) {
      if (e.errorFields) return
      message.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatistics = () => {
    const total = deviceList.length
    const online = deviceList.filter(d => d.status === 1).length
    const offline = deviceList.filter(d => d.status === 0).length
    const fault = deviceList.filter(d => d.status === 2).length
    return { total, online, offline, fault }
  }

  const stats = getStatistics()

  const getStatusBadge = (status) => {
    const map = {
      0: { status: 'default', text: '离线' },
      1: { status: 'success', text: '在线' },
      2: { status: 'error', text: '故障' }
    }
    return map[status] || { status: 'default', text: '未知' }
  }

  const columns = [
    {
      title: '设备编码',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      width: 140,
      render: text => <span className="device-code">{text}</span>
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 180,
      render: (text, record) => (
        <Space>
          <Badge status={getStatusBadge(record.status).status} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 120,
      render: type => (
        <Tag color="blue">
          {irrigationDeviceTypeMap[type] || '未知'}
        </Tag>
      )
    },
    {
      title: '所属大棚/区域',
      dataIndex: 'greenhouseName',
      key: 'location',
      width: 160,
      render: (_, record) => (
        <span>{record.greenhouseName} / {record.area}</span>
      )
    },
    {
      title: '流量(L/min)',
      dataIndex: 'flowRate',
      key: 'flowRate',
      width: 120,
      render: (val, record) => (
        <span>{val || record.currentFlow || 0}</span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: status => (
        <Tag color={irrigationDeviceStatusMap[status]?.color}>
          {irrigationDeviceStatusMap[status]?.text}
        </Tag>
      )
    },
    {
      title: '最后心跳',
      dataIndex: 'lastHeartbeat',
      key: 'lastHeartbeat',
      width: 170,
      render: time => time ? new Date(time).toLocaleString('zh-CN') : '--'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
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
          <Popconfirm
            title="确定要删除该设备吗？"
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
    <div className="irrigation-device-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">灌溉设备管理</h2>
          <span className="subtitle">灌溉系统设备监控与管理</span>
        </div>
        <div className="header-right">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增设备
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><ApartmentOutlined /> 设备总数</span>}
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><BulbOutlined /> 在线设备</span>}
              value={stats.online}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><WarningOutlined /> 离线设备</span>}
              value={stats.offline}
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><ThunderboltOutlined /> 故障设备</span>}
              value={stats.fault}
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
          <Form.Item name="deviceType" label="设备类型">
            <Select placeholder="请选择类型" allowClear style={{ width: 150 }}>
              {Object.entries(irrigationDeviceTypeMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
              {Object.entries(irrigationDeviceStatusMap).map(([key, value]) => (
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
                onClick={loadDeviceList}
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
          dataSource={deviceList}
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
            <span>{editMode === 'add' ? '新增设备' : '编辑设备'}</span>
          </Space>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={actionLoading}
        width={700}
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
                name="deviceName"
                label="设备名称"
                rules={[{ required: true, message: '请输入设备名称' }]}
              >
                <Input placeholder="请输入设备名称" maxLength={50} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deviceType"
                label="设备类型"
                rules={[{ required: true, message: '请选择设备类型' }]}
              >
                <Select placeholder="请选择设备类型">
                  {Object.entries(irrigationDeviceTypeMap).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value}
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
            <Col span={12}>
              <Form.Item
                name="area"
                label="安装区域"
                rules={[{ required: true, message: '请输入安装区域' }]}
              >
                <Input placeholder="如：东片区、泵房" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="flowRate"
                label="额定流量(L/min)"
                rules={[{ required: true, message: '请输入额定流量' }]}
              >
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="model"
                label="设备型号"
              >
                <Input placeholder="请输入设备型号" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="manufacturer"
                label="生产厂商"
              >
                <Input placeholder="请输入生产厂商" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ratedVoltage"
                label="额定电压"
              >
                <Input placeholder="如：DC24V、380V" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nominalPressure"
                label="公称压力"
              >
                <Input placeholder="如：1.0MPa" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="remark"
            label="备注说明"
          >
            <TextArea rows={3} placeholder="请输入备注说明" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <InfoCircleOutlined />
            <span>设备详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={null}
      >
        {currentDevice && (
          <div className="detail-content">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="设备编码">{currentDevice.deviceCode}</Descriptions.Item>
              <Descriptions.Item label="设备名称">{currentDevice.deviceName}</Descriptions.Item>
              <Descriptions.Item label="设备类型">
                <Tag color="blue">{irrigationDeviceTypeMap[currentDevice.deviceType]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={irrigationDeviceStatusMap[currentDevice.status]?.color}>
                  {irrigationDeviceStatusMap[currentDevice.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="所属大棚">{currentDevice.greenhouseName}</Descriptions.Item>
              <Descriptions.Item label="安装区域">{currentDevice.area}</Descriptions.Item>
              <Descriptions.Item label="设备型号">{currentDevice.model || '--'}</Descriptions.Item>
              <Descriptions.Item label="生产厂商">{currentDevice.manufacturer || '--'}</Descriptions.Item>
              <Descriptions.Item label="额定电压">{currentDevice.ratedVoltage || '--'}</Descriptions.Item>
              <Descriptions.Item label="公称压力">{currentDevice.nominalPressure || '--'}</Descriptions.Item>
              <Descriptions.Item label="额定流量">{currentDevice.flowRate} L/min</Descriptions.Item>
              <Descriptions.Item label="累计运行">{currentDevice.workingHours} 小时</Descriptions.Item>
              {currentDevice.currentEc !== undefined && (
                <Descriptions.Item label="当前EC值">{currentDevice.currentEc} mS/cm</Descriptions.Item>
              )}
              {currentDevice.currentPh !== undefined && (
                <Descriptions.Item label="当前pH值">{currentDevice.currentPh}</Descriptions.Item>
              )}
              {currentDevice.currentPressure !== undefined && (
                <Descriptions.Item label="当前压力">{currentDevice.currentPressure} MPa</Descriptions.Item>
              )}
              {currentDevice.currentLevel !== undefined && (
                <Descriptions.Item label="当前液位">{currentDevice.currentLevel}%</Descriptions.Item>
              )}
              {currentDevice.totalUsage !== undefined && (
                <Descriptions.Item label="累计流量">{currentDevice.totalUsage} L</Descriptions.Item>
              )}
              <Descriptions.Item label="安装日期">{currentDevice.installDate}</Descriptions.Item>
              <Descriptions.Item label="最后心跳">
                {new Date(currentDevice.lastHeartbeat).toLocaleString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="备注说明" span={2}>
                {currentDevice.remark || '--'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default IrrigationDevice
