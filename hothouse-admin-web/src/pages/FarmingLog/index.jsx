import { useState, useEffect } from 'react'
import {
  Form,
  Select,
  DatePicker,
  Input,
  Modal,
  Button,
  Tag,
  message,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Timeline,
  Descriptions,
  Upload,
  Image,
  Empty
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  PlusOutlined,
  FileTextOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PictureOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { api } from '@/utils/request'
import { logTypeMap, greenhouseList } from '@/config'
import useStore from '@/store'
import dayjs from 'dayjs'
import './FarmingLog.scss'

const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

function FarmingLog() {
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)

  const [form] = Form.useForm()
  const [addForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [logList, setLogList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [currentLog, setCurrentLog] = useState(null)
  const [imageList, setImageList] = useState([])
  const [greenhouses, setGreenhouses] = useState([])

  useEffect(() => {
    loadGreenhouseList()
    loadLogList()
  }, [currentGreenhouseId, pagination.current, pagination.pageSize])

  const loadGreenhouseList = async () => {
    try {
      const data = await api.getGreenhouseList()
      setGreenhouses(data || greenhouseList)
    } catch (e) {
      console.error(e)
      setGreenhouses(greenhouseList)
    }
  }

  const loadLogList = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const params = {
        greenhouseId: currentGreenhouseId,
        page: pagination.current,
        size: pagination.pageSize,
        logType: values.logType,
        startTime: values.timeRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        endTime: values.timeRange?.[1]?.format('YYYY-MM-DD HH:mm:ss')
      }
      const data = await api.getFarmingLogList(params)
      setLogList(data?.records || generateMockData())
      setPagination(prev => ({ ...prev, total: data?.total || 12 }))
    } catch (e) {
      console.error(e)
      setLogList(generateMockData())
      setPagination(prev => ({ ...prev, total: 12 }))
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => [
    {
      id: 1,
      logCode: 'LOG20240115001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      logType: 'OPERATION',
      logContent: '进行番茄整枝打杈，去除侧枝，保留主茎和第一花序下的一个侧枝。',
      operator: '张三',
      operationTime: '2024-01-15 09:30:00',
      images: JSON.stringify(['https://example.com/log1.jpg'])
    },
    {
      id: 2,
      logCode: 'LOG20240115002',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      logType: 'TASK',
      taskId: 1,
      logContent: '执行施肥任务，施用复合肥20kg，采用滴灌方式。',
      operator: '李四',
      operationTime: '2024-01-15 10:15:00',
      images: JSON.stringify(['https://example.com/log2.jpg', 'https://example.com/log3.jpg'])
    },
    {
      id: 3,
      logCode: 'LOG20240114001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      logType: 'ENV',
      logContent: '环境数据记录：温度25.3℃，湿度68%，光照35000lux，CO2浓度850ppm。',
      operator: 'system',
      operationTime: '2024-01-14 14:00:00',
      envData: JSON.stringify({ temperature: 25.3, humidity: 68, light: 35000, co2: 850 })
    },
    {
      id: 4,
      logCode: 'LOG20240114002',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      logType: 'YIELD',
      logContent: '今日采摘番茄150kg，其中一级果120kg，二级果30kg。',
      operator: '王五',
      operationTime: '2024-01-14 16:30:00',
      images: JSON.stringify(['https://example.com/log4.jpg'])
    },
    {
      id: 5,
      logCode: 'LOG20240113001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      logType: 'OPERATION',
      logContent: '喷施叶面肥，浓度0.3%，每亩用量50L。',
      operator: '张三',
      operationTime: '2024-01-13 08:45:00'
    },
    {
      id: 6,
      logCode: 'LOG20240112001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      logType: 'TASK',
      taskId: 2,
      logContent: '完成病虫害防治任务，喷施吡虫啉防治蚜虫。',
      operator: '李四',
      operationTime: '2024-01-12 11:20:00',
      images: JSON.stringify(['https://example.com/log5.jpg'])
    }
  ]

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadLogList, 0)
  }

  const handleReset = () => {
    form.resetFields()
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadLogList, 0)
  }

  const handleViewDetail = async (log) => {
    setCurrentLog(log)
    try {
      const detail = await api.getFarmingLog(log.id)
      setCurrentLog(detail || log)
    } catch (e) {
      console.error(e)
    }
    setDetailModalVisible(true)
  }

  const handleAdd = () => {
    addForm.resetFields()
    setImageList([])
    setAddModalVisible(true)
  }

  const handleSave = async () => {
    try {
      const values = await addForm.validateFields()
      const data = {
        ...values,
        greenhouseId: currentGreenhouseId,
        operationTime: values.operationTime?.format('YYYY-MM-DD HH:mm:ss'),
        images: JSON.stringify(imageList.map(img => img.url || img.name)),
        operator: '管理员'
      }
      await api.addFarmingLog(data)
      message.success('日志添加成功')
      setAddModalVisible(false)
      loadLogList()
    } catch (e) {
      console.error(e)
      if (e?.errorFields) return
      message.error('添加失败')
    }
  }

  const handlePageChange = (page, pageSize) => {
    setPagination({ current: page, pageSize, total: pagination.total })
  }

  const getStatistics = () => {
    const total = pagination.total
    const today = logList.filter(l => 
      l.operationTime && dayjs(l.operationTime).isSame(dayjs(), 'day')
    ).length
    const taskLogs = logList.filter(l => l.logType === 'TASK').length
    const operationLogs = logList.filter(l => l.logType === 'OPERATION').length
    return { total, today, taskLogs, operationLogs }
  }

  const stats = getStatistics()

  const uploadProps = {
    fileList: imageList,
    onChange: ({ fileList }) => setImageList(fileList),
    beforeUpload: () => false
  }

  const renderImages = (imagesStr) => {
    if (!imagesStr) return null
    try {
      const images = JSON.parse(imagesStr)
      if (!images || images.length === 0) return null
      return (
        <div className="log-images">
          {images.map((img, idx) => (
            <Image
              key={idx}
              width={60}
              height={60}
              src={img}
              className="log-image"
            />
          ))}
        </div>
      )
    } catch (e) {
      return null
    }
  }

  const getTimelineColor = (logType) => {
    const colorMap = {
      TASK: 'blue',
      ENV: 'green',
      OPERATION: 'orange',
      YIELD: 'purple'
    }
    return colorMap[logType] || 'gray'
  }

  return (
    <div className="farming-log-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">农事日志</h2>
          <span className="subtitle">记录农事操作，追踪生产过程</span>
        </div>
        <div className="header-right">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增日志
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><FileTextOutlined /> 日志总数</span>}
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><CalendarOutlined /> 今日日志</span>}
              value={stats.today}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><EnvironmentOutlined /> 任务日志</span>}
              value={stats.taskLogs}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><UserOutlined /> 操作日志</span>}
              value={stats.operationLogs}
              valueStyle={{ color: '#faad14' }}
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
              {greenhouses.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="logType" label="日志类型">
            <Select placeholder="请选择类型" allowClear style={{ width: 150 }}>
              {Object.entries(logTypeMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="timeRange" label="时间范围">
            <RangePicker showTime style={{ width: 300 }} />
          </Form.Item>
          <Form.Item name="operator" label="操作人">
            <Input placeholder="请输入操作人" style={{ width: 150 }} allowClear />
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

      <Card className="timeline-card" loading={loading}>
        <div className="timeline-toolbar">
          <span className="toolbar-title">日志列表</span>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadLogList}
            size="small"
          >
            刷新
          </Button>
        </div>
        {logList.length > 0 ? (
          <Timeline
            mode="left"
            className="log-timeline"
            items={logList.map(log => ({
              color: getTimelineColor(log.logType),
              label: (
                <div className="timeline-label">
                  <span className="time">
                    <ClockCircleOutlined /> {dayjs(log.operationTime).format('YYYY-MM-DD HH:mm')}
                  </span>
                </div>
              ),
              children: (
                <Card className="log-card" size="small">
                  <div className="log-card-header">
                    <Space>
                      <Tag color={logTypeMap[log.logType]?.color}>
                        {logTypeMap[log.logType]?.text}
                      </Tag>
                      <span className="log-operator">
                        <UserOutlined /> {log.operator}
                      </span>
                      <span className="log-greenhouse">
                        <EnvironmentOutlined /> {log.greenhouseName}
                      </span>
                    </Space>
                  </div>
                  <div className="log-content">
                    {log.logContent}
                  </div>
                  {renderImages(log.images)}
                  <div className="log-card-footer">
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetail(log)}
                    >
                      查看详情
                    </Button>
                  </div>
                </Card>
              )
            }))}
          />
        ) : (
          <Empty description="暂无日志记录" />
        )}
        <div className="pagination">
          <Button.Group>
            <Button
              disabled={pagination.current === 1}
              onClick={() => handlePageChange(pagination.current - 1, pagination.pageSize)}
            >
              上一页
            </Button>
            <Button disabled>
              {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize) || 1}
            </Button>
            <Button
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => handlePageChange(pagination.current + 1, pagination.pageSize)}
            >
              下一页
            </Button>
          </Button.Group>
        </div>
      </Card>

      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>日志详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={null}
      >
        {currentLog && (
          <div className="detail-content">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="日志编号">{currentLog.logCode}</Descriptions.Item>
              <Descriptions.Item label="日志类型">
                <Tag color={logTypeMap[currentLog.logType]?.color}>
                  {logTypeMap[currentLog.logType]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="所属大棚">{currentLog.greenhouseName}</Descriptions.Item>
              <Descriptions.Item label="操作人">{currentLog.operator}</Descriptions.Item>
              <Descriptions.Item label="操作时间">
                {dayjs(currentLog.operationTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="关联任务">{currentLog.taskId || '-'}</Descriptions.Item>
              <Descriptions.Item label="日志内容" span={2}>
                {currentLog.logContent}
              </Descriptions.Item>
              {currentLog.envData && (
                <Descriptions.Item label="环境数据" span={2}>
                  {currentLog.envData}
                </Descriptions.Item>
              )}
              {currentLog.weatherData && (
                <Descriptions.Item label="天气数据" span={2}>
                  {currentLog.weatherData}
                </Descriptions.Item>
              )}
            </Descriptions>
            {currentLog.images && (
              <div className="detail-images">
                <h4 className="images-title">现场图片</h4>
                <Image.PreviewGroup>
                  {JSON.parse(currentLog.images).map((img, idx) => (
                    <Image key={idx} width={120} height={120} src={img} style={{ margin: 8 }} />
                  ))}
                </Image.PreviewGroup>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={
          <Space>
            <PlusOutlined />
            <span>新增农事日志</span>
          </Space>
        }
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setAddModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            保存
          </Button>
        ]}
      >
        <Form
          form={addForm}
          layout="vertical"
          className="add-form"
        >
          <Form.Item
            name="logType"
            label="日志类型"
            rules={[{ required: true, message: '请选择日志类型' }]}
          >
            <Select placeholder="请选择日志类型">
              {Object.entries(logTypeMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="logContent"
            label="日志内容"
            rules={[{ required: true, message: '请输入日志内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述农事操作内容"
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item
            name="operationTime"
            label="操作时间"
            rules={[{ required: true, message: '请选择操作时间' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              placeholder="请选择操作时间"
              defaultValue={dayjs()}
            />
          </Form.Item>
          <Form.Item label="现场图片">
            <Upload {...uploadProps} listType="picture-card" multiple>
              <div>
                <PictureOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={2} placeholder="可选，其他说明信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default FarmingLog
