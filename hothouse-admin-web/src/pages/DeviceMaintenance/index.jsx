import { useState, useEffect } from 'react'
import { Card, Tabs, Table, Button, Space, Statistic, Tag, Progress, Modal, Form, Input, Select, DatePicker, message } from 'antd'
import {
  ToolOutlined, WarningOutlined, DashboardOutlined, BarChartOutlined, ToolFilled } from '@ant-design/icons'
import { api } from '@/utils/request'
import { deviceTypeMap, maintenanceStatusMap, maintenanceTypeMap, faultLevelMap, faultStatusMap } from '@/config'
import './DeviceMaintenance.scss'

const { TabPane } = Tabs
const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

function DeviceMaintenance() {
  const [activeTab, setActiveTab] = useState('ledger')
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [faultLoading, setFaultLoading] = useState(false)
  const [ledgerList, setLedgerList] = useState([])
  const [ledgerPagination, setLedgerPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [needMaintenanceList, setNeedMaintenanceList] = useState([])
  const [faultList, setFaultList] = useState([])
  const [faultPagination, setFaultPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [faultOverview, setFaultOverview] = useState({ totalCount: 0, unresolvedCount: 0, criticalCount: 0 })
  const [highFrequencyFaults, setHighFrequencyFaults] = useState([])
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false)
  const [currentLedger, setCurrentLedger] = useState(null)
  const [maintenanceForm] = Form.useForm()
  const [handleModalVisible, setHandleModalVisible] = useState(false)
  const [currentFault, setCurrentFault] = useState(null)
  const [handleForm] = Form.useForm()

  useEffect(() => {
    loadLedgerList()
    loadNeedMaintenance()
    loadFaultOverview()
    loadHighFrequencyFaults()
  }, [ledgerPagination.current, ledgerPagination.pageSize])

  useEffect(() => {
    if (activeTab === 'fault') {
      loadFaultList()
    }
  }, [activeTab, faultPagination.current, faultPagination.pageSize])

  const loadLedgerList = async () => {
    setLedgerLoading(true)
    try {
      const data = await api.getDeviceLedgerPage({
        page: ledgerPagination.current,
        size: ledgerPagination.pageSize
      })
      setLedgerList(data.records || [])
      setLedgerPagination({ ...ledgerPagination, total: data.total || 0 })
    } catch (e) {
      console.error(e)
      setLedgerList([])
    } finally {
      setLedgerLoading(false)
    }
  }

  const loadNeedMaintenance = async () => {
    try {
      const data = await api.getNeedMaintenance()
      setNeedMaintenanceList(data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadFaultOverview = async () => {
    try {
      const data = await api.getFaultOverview()
      setFaultOverview(data || {})
    } catch (e) {
      console.error(e)
    }
  }

  const loadHighFrequencyFaults = async () => {
    try {
      const endTime = new Date()
      const startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000)
      const data = await api.getHighFrequencyFaults(
        startTime.toISOString(), endTime.toISOString()
      )
      setHighFrequencyFaults(data || [])
    } catch (e) {
      console.error(e)
      setHighFrequencyFaults([
        { deviceCode: 'FAN001', deviceName: '1号风机', count: 3 },
        { deviceCode: 'FAN003', deviceName: '3号风机', count: 2 }
      ])
    }
  }

  const loadFaultList = async () => {
    setFaultLoading(true)
    try {
      const data = await api.getFaultRecordPage({
        page: faultPagination.current,
        size: faultPagination.pageSize
      })
      setFaultList(data.records || [])
      setFaultPagination({ ...faultPagination, total: data.total || 0 })
    } catch (e) {
      console.error(e)
      setFaultList([])
    } finally {
      setFaultLoading(false)
    }
  }

  const showMaintenanceModal = (record) => {
    setCurrentLedger(record)
    maintenanceForm.setFieldsValue({
      deviceCode: record.deviceCode,
      deviceName: record.deviceName,
      maintenanceType: '润滑',
      operator: '',
      remark: ''
    })
    setMaintenanceModalVisible(true)
  }

  const handleMaintenance = async () => {
    try {
      const values = await maintenanceForm.validateFields()
      await api.addMaintenanceRecord({
        ...values,
        greenhouseId: currentLedger.greenhouseId,
        maintenanceTime: new Date().toISOString()
      })
      message.success('保养记录已提交')
      setMaintenanceModalVisible(false)
      loadLedgerList()
      loadNeedMaintenance()
    } catch (e) {
        message.error('提交失败')
      }
  }

  const showHandleModal = (record) => {
    setCurrentFault(record)
    handleForm.setFieldsValue({
      handler: '',
      handleMethod: '',
      sparePartsUsed: '',
      cost: '',
      remark: ''
    })
    setHandleModalVisible(true)
  }

  const handleFault = async () => {
    try {
      const values = await handleForm.validateFields()
      await api.handleFaultRecord(currentFault.id, values)
      message.success('故障处理已提交')
      setHandleModalVisible(false)
      loadFaultList()
      loadFaultOverview()
    } catch (e) {
        message.error('提交失败')
      }
  }

  const ledgerColumns = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 120
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 100,
      render: (type) => deviceTypeMap[type]?.name || '-'
    },
    {
      title: '累计运行时长',
      dataIndex: 'totalRunHours',
      key: 'totalRunHours',
      width: 120,
      render: (hours) => `${hours || 0}小时`
    },
    {
      title: '启停次数',
      dataIndex: 'startStopCount',
      key: 'startStopCount',
      width: 100,
      render: (count) => `${count || 0}次`
    },
    {
      title: '保养进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        const total = record.totalRunHours || 0
        const next = record.nextMaintenanceHours || 1000
        const percent = Math.min((total / next) * 100, 100)
        return (
          <Progress
            percent={Math.round(percent)}
            size="small"
            status={record.maintenanceStatus === 2 ? 'exception' : record.maintenanceStatus === 1 ? 'active' : undefined}
          />
        )
      }
    },
    {
      title: '保养状态',
      dataIndex: 'maintenanceStatus',
      key: 'maintenanceStatus',
      width: 100,
      render: (status) => {
        const cfg = maintenanceStatusMap[status] || maintenanceStatusMap[0]
        return <Tag color={cfg.color}>{cfg.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button type="link" size="small" icon={<ToolOutlined />} onClick={() => showMaintenanceModal(record)}>
          登记保养
        </Button>
      )
    }
  ]

  const faultColumns = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 120
    },
    {
      title: '故障类型',
      dataIndex: 'faultType',
      key: 'faultType',
      width: 120
    },
    {
      title: '故障级别',
      dataIndex: 'faultLevel',
      key: 'faultLevel',
      width: 100,
      render: (level) => {
        const cfg = faultLevelMap[level] || faultLevelMap[2]
        return <Tag color={cfg.color}>{cfg.text}</Tag>
      }
    },
    {
      title: '故障描述',
      dataIndex: 'faultContent',
      key: 'faultContent',
      ellipsis: true
    },
    {
      title: '发生时间',
      dataIndex: 'faultTime',
      key: 'faultTime',
      width: 180
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const cfg = faultStatusMap[status] || faultStatusMap[0]
        return <Tag color={cfg.color}>{cfg.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          disabled={record.status === 2}
          onClick={() => showHandleModal(record)}
        >
          {record.status === 2 ? '已处理' : '处理'}
        </Button>
      )
    }
  ]

  return (
    <div className="device-maintenance">
      <div className="page-header">
        <h2><ToolOutlined /> 设备运维</h2>
      </div>

      <div className="stat-cards">
        <Card className="stat-card">
          <Statistic
          title="待保养设备"
          value={needMaintenanceList.length}
          prefix={<WarningOutlined />}
          valueStyle={{ color: '#faad14' }}
        />
        </Card>
        <Card className="stat-card">
          <Statistic
          title="近30天故障"
          value={faultOverview.totalCount}
          prefix={<DashboardOutlined />}
          valueStyle={{ color: '#1890ff' }}
        />
        <Card className="stat-card">
          <Statistic
          title="未解决故障"
          value={faultOverview.unresolvedCount}
          prefix={<WarningOutlined />}
          valueStyle={{ color: '#ff4d4f' }}
        />
        <Card className="stat-card">
          <Statistic
          title="严重故障"
          value={faultOverview.criticalCount}
          prefix={<ToolFilled />}
          valueStyle={{ color: '#722ed1' }}
        />
      </div>

      {highFrequencyFaults.length > 0 && (
        <Card className="warning-card" style={{ marginBottom: 16 }}>
        <div className="warning-header">
          <WarningOutlined style={{ color: '#faad14', fontSize: 20, marginRight: 8 }} />
          <span>备件建议：以下设备近期故障频率较高，建议检修或更换</span>
        </div>
        <div className="warning-list">
          {highFrequencyFaults.map((item, index) => (
            <Tag key={index} color="orange">
            {item.deviceName} - 近30天故障 {item.count} 次
            </Tag>
          ))}
        </div>
        </Card>
      )}

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="设备台账" key="ledger">
            <Table
              columns={ledgerColumns}
              dataSource={ledgerList}
              rowKey="id"
              loading={ledgerLoading}
              pagination={{
                ...ledgerPagination,
                onChange: (page, pageSize) => {
                  setLedgerPagination({ ...ledgerPagination, current: page, pageSize })
                },
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`
              }}
            />
          </TabPane>
          <TabPane tab="故障记录" key="fault">
            <Table
              columns={faultColumns}
              dataSource={faultList}
              rowKey="id"
              loading={faultLoading}
              pagination={{
                ...faultPagination,
                onChange: (page, pageSize) => {
                  setFaultPagination({ ...faultPagination, current: page, pageSize })
                },
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="登记保养"
        open={maintenanceModalVisible}
        onCancel={() => setMaintenanceModalVisible(false)}
        onOk={handleMaintenance}
        width={600}
      >
        <Form form={maintenanceForm} layout="vertical">
          <Form.Item name="deviceCode" label="设备编码">
            <Input disabled />
          </Form.Item>
          <Form.Item name="deviceName" label="设备名称">
            <Input disabled />
          </Form.Item>
          <Form.Item name="maintenanceType" label="保养类型" rules={[{ required: true, message: '请选择保养类型' }]}>
            <Select>
              <Option value="润滑">润滑</Option>
              <Option value="清洁">清洁</Option>
              <Option value="检修">检修</Option>
              <Option value="更换">更换</Option>
            </Select>
          </Form.Item>
          <Form.Item name="maintenanceContent" label="保养内容">
            <TextArea rows={4} placeholder="请输入保养内容" />
          </Form.Item>
          <Form.Item name="operator" label="操作人" rules={[{ required: true, message: '请输入操作人' }]}>
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="sparePartsUsed" label="使用备件">
            <Input placeholder="请输入使用的备件" />
          </Form.Item>
          <Form.Item name="cost" label="费用(元)">
            <Input placeholder="请输入费用" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="处理故障"
        open={handleModalVisible}
        onCancel={() => setHandleModalVisible(false)}
        onOk={handleFault}
        width={600}
      >
        <Form form={handleForm} layout="vertical">
          <Form.Item label="故障信息">
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
              <p style={{ margin: 0 }}>
                <strong>{currentFault?.deviceName}</strong> - {currentFault?.faultType}
              </p>
              <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                {currentFault?.faultContent}
              </p>
            </div>
          </Form.Item>
          <Form.Item name="handler" label="处理人" rules={[{ required: true, message: '请输入处理人' }]}>
            <Input placeholder="请输入处理人" />
          </Form.Item>
          <Form.Item name="handleMethod" label="处理方法" rules={[{ required: true, message: '请输入处理方法' }]}>
            <TextArea rows={4} placeholder="请输入处理方法" />
          </Form.Item>
          <Form.Item name="sparePartsUsed" label="更换备件">
            <Input placeholder="请输入更换的备件" />
          </Form.Item>
          <Form.Item name="cost" label="维修费用(元)">
            <Input placeholder="请输入维修费用" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DeviceMaintenance
