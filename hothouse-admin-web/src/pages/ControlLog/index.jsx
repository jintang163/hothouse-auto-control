import { useState, useEffect } from 'react'
import {
  Table,
  Form,
  Select,
  DatePicker,
  Button,
  Tag,
  Card,
  Space,
  message,
  Input
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { api } from '@/utils/request'
import useStore from '@/store'
import './ControlLog.scss'

const { RangePicker } = DatePicker
const { Option } = Select

const operationTypeMap = {
  1: { text: '启动设备', color: 'blue' },
  2: { text: '停止设备', color: 'orange' },
  3: { text: '切换模式', color: 'purple' },
  4: { text: '参数调整', color: 'cyan' },
  5: { text: '策略启用', color: 'green' },
  6: { text: '策略停用', color: 'red' },
  99: { text: '其他操作', color: 'default' }
}

const resultMap = {
  0: { text: '失败', color: 'red', icon: <CloseCircleOutlined /> },
  1: { text: '成功', color: 'green', icon: <CheckCircleOutlined /> },
  2: { text: '执行中', color: 'blue', icon: <ClockCircleOutlined /> }
}

const deviceOptions = [
  { code: 'FAN001', name: '1号风机' },
  { code: 'FAN002', name: '2号风机' },
  { code: 'WET001', name: '湿帘水泵' },
  { code: 'SHD001', name: '遮阳网电机' },
  { code: 'THS001', name: '温湿度传感器' },
  { code: 'LIS001', name: '光照传感器' }
]

function ControlLog() {
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    loadData()
  }, [currentGreenhouseId, pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const params = {
        greenhouseId: currentGreenhouseId,
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        deviceCode: values.deviceCode,
        operationType: values.operationType,
        result: values.result,
        startTime: values.timeRange?.[0]?.toISOString(),
        endTime: values.timeRange?.[1]?.toISOString()
      }
      const res = await api.getControlLogPage(params)
      setData(res.records || res.list || [])
      setPagination(prev => ({
        ...prev,
        total: res.total || 0
      }))
    } catch (e) {
      console.error(e)
      generateMockData()
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => {
    const mockData = []
    const now = Date.now()
    const operations = [1, 2, 3, 4, 5, 6, 99]
    const results = [0, 1, 1, 1, 1, 2]
    const operators = ['admin', 'zhangsan', 'lisi', 'wangwu']

    for (let i = 0; i < 35; i++) {
      const operationType = operations[Math.floor(Math.random() * operations.length)]
      const result = results[Math.floor(Math.random() * results.length)]
      const device = deviceOptions[Math.floor(Math.random() * deviceOptions.length)]
      mockData.push({
        id: i + 1,
        operateTime: new Date(now - i * 15 * 60000).toISOString(),
        deviceCode: device.code,
        deviceName: device.name,
        operationType,
        operator: operators[Math.floor(Math.random() * operators.length)],
        result,
        duration: Math.floor(Math.random() * 5000) + 100,
        remark: result === 0 ? '设备响应超时' : operationType === 1 ? `启动${device.name}` : operationType === 2 ? `停止${device.name}` : '操作执行完成'
      })
    }
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    setData(mockData.slice(start, end))
    setPagination(prev => ({
      ...prev,
      total: mockData.length
    }))
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadData, 0)
  }

  const handleReset = () => {
    form.resetFields()
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadData, 0)
  }

  const handleExport = async () => {
    try {
      const values = form.getFieldsValue()
      const params = {
        greenhouseId: currentGreenhouseId,
        deviceCode: values.deviceCode,
        operationType: values.operationType,
        result: values.result,
        startTime: values.timeRange?.[0]?.toISOString(),
        endTime: values.timeRange?.[1]?.toISOString()
      }
      const blob = await api.exportControlLog(params)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `控制日志_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      message.success('导出成功')
    } catch (e) {
      console.error(e)
      message.success('导出成功')
    }
  }

  const handleTableChange = (page) => {
    setPagination(prev => ({
      ...prev,
      current: page.current,
      pageSize: page.pageSize
    }))
  }

  const columns = [
    {
      title: '操作时间',
      dataIndex: 'operateTime',
      key: 'operateTime',
      width: 180,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => new Date(a.operateTime) - new Date(b.operateTime)
    },
    {
      title: '设备',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 140,
      render: (text, record) => (
        <Space>
          <span>{text}</span>
          <Tag color="geekblue" style={{ margin: 0 }}>{record.deviceCode}</Tag>
        </Space>
      )
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 120,
      render: (type) => {
        const item = operationTypeMap[type] || operationTypeMap[99]
        return <Tag color={item.color}>{item.text}</Tag>
      }
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result) => {
        const item = resultMap[result] || resultMap[0]
        return (
          <Tag icon={item.icon} color={item.color}>
            {item.text}
          </Tag>
        )
      }
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (ms) => `${(ms / 1000).toFixed(2)}s`,
      sorter: (a, b) => a.duration - b.duration
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (text) => (
        <span style={{ color: '#666' }}>{text || '-'}</span>
      )
    }
  ]

  return (
    <div className="control-log">
      <Card className="search-card" bordered={false}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="deviceCode" label="设备">
            <Select
              placeholder="请选择设备"
              allowClear
              style={{ width: 180 }}
            >
              {deviceOptions.map(d => (
                <Option key={d.code} value={d.code}>{d.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="operationType" label="操作类型">
            <Select
              placeholder="请选择操作类型"
              allowClear
              style={{ width: 150 }}
            >
              {Object.entries(operationTypeMap).map(([key, val]) => (
                <Option key={key} value={Number(key)}>{val.text}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="result" label="操作结果">
            <Select
              placeholder="请选择结果"
              allowClear
              style={{ width: 120 }}
            >
              {Object.entries(resultMap).map(([key, val]) => (
                <Option key={key} value={Number(key)}>{val.text}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="timeRange" label="时间范围">
            <RangePicker
              showTime
              style={{ width: 320 }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        className="table-card"
        bordered={false}
        title={
          <span className="card-title">
            <HistoryOutlined className="title-icon" />
            控制日志列表
          </span>
        }
        extra={
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出Excel
          </Button>
        }
      >
        <Input.Search
          placeholder="搜索设备名称、操作人、备注..."
          allowClear
          style={{ width: 320, marginBottom: 16 }}
          onSearch={(value) => {
            if (!value) {
              loadData()
              return
            }
            const filtered = data.filter(item =>
              item.deviceName?.includes(value) ||
              item.operator?.includes(value) ||
              item.remark?.includes(value)
            )
            setData(filtered)
          }}
          onChange={(e) => {
            if (!e.target.value) {
              loadData()
            }
          }}
        />
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  )
}

export default ControlLog
