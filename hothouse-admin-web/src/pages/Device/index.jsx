import { useState, useEffect } from 'react'
import {
  Table,
  Form,
  Select,
  Modal,
  Switch,
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
  Descriptions
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  PoweroffOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  ApartmentOutlined
} from '@ant-design/icons'
import { api } from '@/utils/request'
import { deviceTypeMap, deviceStatusMap, controlModeMap } from '@/config'
import useStore from '@/store'
import './Device.scss'

const { Option } = Select

function Device() {
  const controlMode = useStore(state => state.controlMode)
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [controlLoading, setControlLoading] = useState(false)
  const [deviceList, setDeviceList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentDevice, setCurrentDevice] = useState(null)
  const [deviceLogs, setDeviceLogs] = useState([])
  const [greenhouseList, setGreenhouseList] = useState([])

  useEffect(() => {
    loadGreenhouseList()
    loadDeviceList()
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
      const data = await api.getDeviceList(params)
      setDeviceList(data?.records || generateMockData())
      setPagination(prev => ({ ...prev, total: data?.total || 6 }))
    } catch (e) {
      console.error(e)
      setDeviceList(generateMockData())
      setPagination(prev => ({ ...prev, total: 6 }))
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => [
    {
      id: 1,
      deviceCode: 'FAN001',
      deviceName: '1号风机',
      deviceType: 1,
      status: 2,
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      lastHeartbeat: new Date().toISOString(),
      description: '北侧排风风机',
      installPosition: '北墙上部',
      ratedPower: '1.5kW',
      ratedVoltage: '380V',
      manufacturer: '某某机电',
      installDate: '2024-01-15',
      runningHours: 1256
    },
    {
      id: 2,
      deviceCode: 'FAN002',
      deviceName: '2号风机',
      deviceType: 1,
      status: 1,
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      lastHeartbeat: new Date().toISOString(),
      description: '南侧排风风机',
      installPosition: '南墙上部',
      ratedPower: '1.5kW',
      ratedVoltage: '380V',
      manufacturer: '某某机电',
      installDate: '2024-01-15',
      runningHours: 1189
    },
    {
      id: 3,
      deviceCode: 'WET001',
      deviceName: '湿帘水泵',
      deviceType: 2,
      status: 0,
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      lastHeartbeat: new Date(Date.now() - 3600000).toISOString(),
      description: '湿帘循环水泵',
      installPosition: '湿帘侧水池',
      ratedPower: '0.75kW',
      ratedVoltage: '220V',
      manufacturer: '某某泵业',
      installDate: '2024-01-20',
      runningHours: 456
    },
    {
      id: 4,
      deviceCode: 'SHD001',
      deviceName: '遮阳网电机',
      deviceType: 3,
      status: 2,
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      lastHeartbeat: new Date().toISOString(),
      description: '外遮阳网驱动电机',
      installPosition: '顶部北侧',
      ratedPower: '0.55kW',
      ratedVoltage: '380V',
      manufacturer: '某某传动',
      installDate: '2024-01-18',
      runningHours: 892
    },
    {
      id: 5,
      deviceCode: 'THS001',
      deviceName: '温湿度传感器',
      deviceType: 10,
      status: 1,
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      lastHeartbeat: new Date().toISOString(),
      description: '空气温湿度采集传感器',
      installPosition: '中部2.5米高度',
      measurementRange: '-40~80℃/0~100%RH',
      accuracy: '±0.3℃/±2%RH',
      manufacturer: '某某传感',
      installDate: '2024-01-10',
      runningHours: 3650
    },
    {
      id: 6,
      deviceCode: 'LIS001',
      deviceName: '光照传感器',
      deviceType: 12,
      status: 3,
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      lastHeartbeat: new Date(Date.now() - 1800000).toISOString(),
      description: '光照强度采集传感器',
      installPosition: '顶部外侧',
      measurementRange: '0~200000lux',
      accuracy: '±5%',
      manufacturer: '某某传感',
      installDate: '2024-01-10',
      runningHours: 3580
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

  const handleViewDetail = async (device) => {
    setCurrentDevice(device)
    setDetailModalVisible(true)
    try {
      const logs = await api.getDeviceLogs(device.deviceCode)
      setDeviceLogs(logs || generateMockLogs())
    } catch (e) {
      setDeviceLogs(generateMockLogs())
    }
  }

  const generateMockLogs = () => [
    { id: 1, action: '启动', operator: 'admin', actionTime: new Date().toISOString(), result: '成功', remark: '手动控制' },
    { id: 2, action: '停止', operator: 'system', actionTime: new Date(Date.now() - 3600000).toISOString(), result: '成功', remark: '自动策略触发' },
    { id: 3, action: '启动', operator: 'admin', actionTime: new Date(Date.now() - 7200000).toISOString(), result: '成功', remark: '手动控制' },
    { id: 4, action: '故障上报', operator: 'system', actionTime: new Date(Date.now() - 86400000).toISOString(), result: '告警', remark: '电流异常' },
    { id: 5, action: '启动', operator: 'timer', actionTime: new Date(Date.now() - 90000000).toISOString(), result: '成功', remark: '定时任务' }
  ]

  const handleControlDevice = async (device, action) => {
    if (controlMode === 1) {
      message.warning('当前为自动模式，无法手动控制')
      return
    }
    setControlLoading(true)
    try {
      await api.manualControl({
        greenhouseId: currentGreenhouseId,
        deviceCode: device.deviceCode,
        action,
        operator: 'admin'
      })
      message.success(`设备${action === 1 ? '启动' : '停止'}成功`)
      setTimeout(loadDeviceList, 1000)
    } catch (e) {
      message.error('操作失败')
    } finally {
      setControlLoading(false)
    }
  }

  const handleBatchControl = async (action) => {
    if (controlMode === 1) {
      message.warning('当前为自动模式，无法手动控制')
      return
    }
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的设备')
      return
    }
    const controllableDevices = deviceList.filter(
      d => selectedRowKeys.includes(d.id) && d.deviceType <= 3
    )
    if (controllableDevices.length === 0) {
      message.warning('所选设备中无可控制设备')
      return
    }
    setControlLoading(true)
    try {
      for (const device of controllableDevices) {
        await api.manualControl({
          greenhouseId: currentGreenhouseId,
          deviceCode: device.deviceCode,
          action,
          operator: 'admin'
        })
      }
      message.success(`批量${action === 1 ? '启动' : '停止'}成功`)
      setSelectedRowKeys([])
      setTimeout(loadDeviceList, 1000)
    } catch (e) {
      message.error('批量操作失败')
    } finally {
      setControlLoading(false)
    }
  }

  const getStatistics = () => {
    const total = deviceList.length
    const online = deviceList.filter(d => d.status === 1 || d.status === 2).length
    const running = deviceList.filter(d => d.status === 2).length
    const fault = deviceList.filter(d => d.status === 3).length
    return { total, online, running, fault }
  }

  const stats = getStatistics()

  const columns = [
    {
      title: '设备编码',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      width: 120,
      render: text => <span className="device-code">{text}</span>
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 140,
      render: (text, record) => (
        <Space>
          <Badge
            status={
              record.status === 0 ? 'default' :
              record.status === 1 ? 'success' :
              record.status === 2 ? 'processing' : 'error'
            }
          />
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
          {deviceTypeMap[type]?.name || '未知'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: status => (
        <Tag color={deviceStatusMap[status]?.color}>
          {deviceStatusMap[status]?.text || '未知'}
        </Tag>
      )
    },
    {
      title: '所属大棚',
      dataIndex: 'greenhouseName',
      key: 'greenhouseName',
      width: 120
    },
    {
      title: '最后心跳',
      dataIndex: 'lastHeartbeat',
      key: 'lastHeartbeat',
      width: 180,
      render: time => time ? new Date(time).toLocaleString('zh-CN') : '--'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
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
          {record.deviceType <= 3 && (
            <>
              <Divider type="vertical" />
              {record.status === 2 ? (
                <Popconfirm
                  title="确定要停止该设备吗？"
                  onConfirm={() => handleControlDevice(record, 0)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<PauseCircleOutlined />}
                    disabled={controlMode === 1 || controlLoading}
                  >
                    停止
                  </Button>
                </Popconfirm>
              ) : (
                <Button
                  type="link"
                  size="small"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleControlDevice(record, 1)}
                  disabled={controlMode === 1 || controlLoading || record.status === 0}
                >
                  启动
                </Button>
              )}
            </>
          )}
        </Space>
      )
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: record => ({
      disabled: record.deviceType > 3
    })
  }

  return (
    <div className="device-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">设备管理</h2>
          <span className="subtitle">设备状态监控与控制</span>
        </div>
        <div className="header-right">
          <Tag color={controlModeMap[controlMode]?.color}>
            当前模式: {controlModeMap[controlMode]?.text}
          </Tag>
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
              title={<span className="stat-title"><ThunderboltOutlined /> 运行中</span>}
              value={stats.running}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><InfoCircleOutlined /> 故障设备</span>}
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
          <Form.Item name="deviceType" label="设备类型">
            <Select placeholder="请选择设备类型" allowClear style={{ width: 150 }}>
              {Object.entries(deviceTypeMap).map(([key, value]) => (
                <Option key={key} value={Number(key)}>
                  {value.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="设备状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 150 }}>
              {Object.entries(deviceStatusMap).map(([key, value]) => (
                <Option key={key} value={Number(key)}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="greenhouseId" label="所属大棚">
            <Select placeholder="请选择大棚" allowClear style={{ width: 150 }}>
              {greenhouseList.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.name}
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
              已选择 <strong>{selectedRowKeys.length}</strong> 项
            </span>
          </div>
          <div className="toolbar-right">
            <Space>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => handleBatchControl(1)}
                disabled={selectedRowKeys.length === 0 || controlMode === 1 || controlLoading}
              >
                批量启动
              </Button>
              <Button
                danger
                icon={<PauseCircleOutlined />}
                onClick={() => handleBatchControl(0)}
                disabled={selectedRowKeys.length === 0 || controlMode === 1 || controlLoading}
              >
                批量停止
              </Button>
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
          rowSelection={rowSelection}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <SettingOutlined />
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
                <Tag color="blue">{deviceTypeMap[currentDevice.deviceType]?.name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="设备状态">
                <Tag color={deviceStatusMap[currentDevice.status]?.color}>
                  {deviceStatusMap[currentDevice.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="所属大棚">{currentDevice.greenhouseName}</Descriptions.Item>
              <Descriptions.Item label="安装位置">{currentDevice.installPosition}</Descriptions.Item>
              <Descriptions.Item label="设备描述" span={2}>{currentDevice.description}</Descriptions.Item>
              {currentDevice.ratedPower && (
                <>
                  <Descriptions.Item label="额定功率">{currentDevice.ratedPower}</Descriptions.Item>
                  <Descriptions.Item label="额定电压">{currentDevice.ratedVoltage}</Descriptions.Item>
                </>
              )}
              {currentDevice.measurementRange && (
                <Descriptions.Item label="测量范围" span={2}>
                  {currentDevice.measurementRange}
                </Descriptions.Item>
              )}
              {currentDevice.accuracy && (
                <Descriptions.Item label="精度">{currentDevice.accuracy}</Descriptions.Item>
              )}
              <Descriptions.Item label="生产厂商">{currentDevice.manufacturer}</Descriptions.Item>
              <Descriptions.Item label="安装日期">{currentDevice.installDate}</Descriptions.Item>
              <Descriptions.Item label="累计运行">
                {currentDevice.runningHours} 小时
              </Descriptions.Item>
              <Descriptions.Item label="最后心跳">
                {new Date(currentDevice.lastHeartbeat).toLocaleString('zh-CN')}
              </Descriptions.Item>
            </Descriptions>

            {currentDevice.deviceType <= 3 && (
              <div className="control-section">
                <Divider orientation="left">设备控制</Divider>
                <div className="control-panel">
                  <span className="control-label">
                    <PoweroffOutlined /> 开关控制
                  </span>
                  <Switch
                    checked={currentDevice.status === 2}
                    checkedChildren="运行"
                    unCheckedChildren="停止"
                    onChange={checked => {
                      handleControlDevice(currentDevice, checked ? 1 : 0)
                      setCurrentDevice({
                        ...currentDevice,
                        status: checked ? 2 : 1
                      })
                    }}
                    disabled={controlMode === 1 || controlLoading || currentDevice.status === 0}
                  />
                  {controlMode === 1 && (
                    <span className="mode-tip">自动模式下无法手动控制</span>
                  )}
                </div>
              </div>
            )}

            <div className="logs-section">
              <Divider orientation="left">最近操作记录</Divider>
              <Table
                rowKey="id"
                size="small"
                pagination={false}
                dataSource={deviceLogs}
                columns={[
                  {
                    title: '操作',
                    dataIndex: 'action',
                    key: 'action',
                    width: 100,
                    render: text => (
                      <Tag color={text === '启动' ? 'green' : text === '停止' ? 'orange' : 'red'}>
                        {text}
                      </Tag>
                    )
                  },
                  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
                  { title: '结果', dataIndex: 'result', key: 'result', width: 80 },
                  { title: '备注', dataIndex: 'remark', key: 'remark' },
                  {
                    title: '操作时间',
                    dataIndex: 'actionTime',
                    key: 'actionTime',
                    width: 160,
                    render: time => new Date(time).toLocaleString('zh-CN')
                  }
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Device
