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
  Table,
  Descriptions,
  Image,
  Empty,
  Progress,
  Divider
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ScanOutlined,
  EnvironmentOutlined,
  BugOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { api } from '@/utils/request'
import { handleStatusMap, identifyMethodMap, greenhouseList, severityLevelMap } from '@/config'
import useStore from '@/store'
import dayjs from 'dayjs'
import './PestIdentify.scss'

const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

function PestIdentify() {
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)

  const [form] = Form.useForm()
  const [handleForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [identifyList, setIdentifyList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [handleModalVisible, setHandleModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [greenhouses, setGreenhouses] = useState([])

  useEffect(() => {
    loadGreenhouseList()
    loadIdentifyList()
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

  const loadIdentifyList = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const params = {
        greenhouseId: currentGreenhouseId,
        page: pagination.current,
        size: pagination.pageSize,
        handleStatus: values.handleStatus,
        keyword: values.keyword,
        startTime: values.timeRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        endTime: values.timeRange?.[1]?.format('YYYY-MM-DD HH:mm:ss')
      }
      const data = await api.getPestIdentifyList(params)
      setIdentifyList(data?.records || generateMockData())
      setPagination(prev => ({ ...prev, total: data?.total || 20 }))
    } catch (e) {
      console.error(e)
      setIdentifyList(generateMockData())
      setPagination(prev => ({ ...prev, total: 20 }))
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => [
    {
      id: 1,
      identifyCode: 'ID20240115001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      varietyId: 1,
      varietyName: '番茄',
      imageUrl: 'https://example.com/identify1.jpg',
      identifyMethod: 'AI',
      pestId: 1,
      pestName: '蚜虫',
      confidence: 0.965,
      identifyResult: '蚜虫重度危害',
      damageLevel: 3,
      affectedArea: 12.5,
      suggestion: '建议立即喷施吡虫啉或噻虫嗪，注意叶背喷施均匀。',
      handler: null,
      handleStatus: 0,
      handleResult: null,
      handleTime: null,
      identifyTime: '2024-01-15 10:30:00'
    },
    {
      id: 2,
      identifyCode: 'ID20240115002',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      varietyId: 1,
      varietyName: '番茄',
      imageUrl: 'https://example.com/identify2.jpg',
      identifyMethod: 'AI',
      pestId: 3,
      pestName: '灰霉病',
      confidence: 0.892,
      identifyResult: '灰霉病初期侵染',
      damageLevel: 2,
      affectedArea: 5.2,
      suggestion: '及时摘除病花病果，喷施腐霉利或异菌脲。',
      handler: '李四',
      handleStatus: 1,
      handleResult: '已摘除病果，喷施腐霉利1500倍液。',
      handleTime: '2024-01-15 14:20:00',
      identifyTime: '2024-01-15 09:15:00'
    },
    {
      id: 3,
      identifyCode: 'ID20240114001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      varietyId: 2,
      varietyName: '黄瓜',
      imageUrl: 'https://example.com/identify3.jpg',
      identifyMethod: 'MANUAL',
      pestId: 6,
      pestName: '霜霉病',
      confidence: 1.0,
      identifyResult: '霜霉病发病中期',
      damageLevel: 2,
      affectedArea: 8.0,
      suggestion: '喷施烯酰吗啉或霜脲氰，加强通风排湿。',
      handler: '张三',
      handleStatus: 2,
      handleResult: '已喷施烯酰吗啉，加强通风，每日检查。',
      handleTime: '2024-01-14 16:30:00',
      identifyTime: '2024-01-14 11:00:00'
    },
    {
      id: 4,
      identifyCode: 'ID20240114002',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      varietyId: 1,
      varietyName: '番茄',
      imageUrl: 'https://example.com/identify4.jpg',
      identifyMethod: 'AI',
      pestId: 5,
      pestName: '红蜘蛛',
      confidence: 0.928,
      identifyResult: '红蜘蛛轻度危害',
      damageLevel: 1,
      affectedArea: 2.5,
      suggestion: '可喷施阿维菌素，或增加棚内湿度。',
      handler: null,
      handleStatus: 0,
      handleResult: null,
      handleTime: null,
      identifyTime: '2024-01-14 15:45:00'
    },
    {
      id: 5,
      identifyCode: 'ID20240113001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      varietyId: 3,
      varietyName: '茄子',
      imageUrl: 'https://example.com/identify5.jpg',
      identifyMethod: 'AI',
      pestId: 2,
      pestName: '白粉虱',
      confidence: 0.875,
      identifyResult: '白粉虱成虫',
      damageLevel: 2,
      affectedArea: 6.8,
      suggestion: '悬挂黄板诱杀，喷施噻虫嗪。',
      handler: '王五',
      handleStatus: 2,
      handleResult: '已悬挂黄板20张，喷施噻虫嗪。',
      handleTime: '2024-01-13 10:30:00',
      identifyTime: '2024-01-13 08:30:00'
    },
    {
      id: 6,
      identifyCode: 'ID20240112001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      varietyId: 1,
      varietyName: '番茄',
      imageUrl: 'https://example.com/identify6.jpg',
      identifyMethod: 'MANUAL',
      pestId: 4,
      pestName: '白粉病',
      confidence: 1.0,
      identifyResult: '白粉病发病初期',
      damageLevel: 1,
      affectedArea: 3.0,
      suggestion: '喷施三唑酮或戊唑醇，注意通风透光。',
      handler: '李四',
      handleStatus: 2,
      handleResult: '已喷施戊唑醇，加强通风。',
      handleTime: '2024-01-12 14:00:00',
      identifyTime: '2024-01-12 09:20:00'
    }
  ]

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadIdentifyList, 0)
  }

  const handleReset = () => {
    form.resetFields()
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadIdentifyList, 0)
  }

  const handleViewDetail = async (record) => {
    setCurrentRecord(record)
    try {
      const detail = await api.getPestIdentify(record.id)
      setCurrentRecord(detail || record)
    } catch (e) {
      console.error(e)
    }
    setDetailModalVisible(true)
  }

  const handleProcess = (record) => {
    setCurrentRecord(record)
    handleForm.resetFields()
    setHandleModalVisible(true)
  }

  const handleSave = async () => {
    try {
      const values = await handleForm.validateFields()
      await api.handlePestIdentify(currentRecord.id, {
        handler: '管理员',
        handleResult: values.handleResult
      })
      message.success('处理完成')
      setHandleModalVisible(false)
      loadIdentifyList()
    } catch (e) {
      console.error(e)
      if (e?.errorFields) return
      message.error('处理失败')
    }
  }

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
  }

  const getStatistics = () => {
    const total = pagination.total
    const pending = identifyList.filter(r => r.handleStatus === 0).length
    const processing = identifyList.filter(r => r.handleStatus === 1).length
    const handled = identifyList.filter(r => r.handleStatus === 2).length
    return { total, pending, processing, handled }
  }

  const stats = getStatistics()

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return '#52c41a'
    if (confidence >= 0.7) return '#faad14'
    return '#ff4d4f'
  }

  const columns = [
    {
      title: '识别图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (url) => (
        <Image
          width={60}
          height={60}
          src={url}
          style={{ borderRadius: 4, objectFit: 'cover' }}
        />
      )
    },
    {
      title: '识别编号',
      dataIndex: 'identifyCode',
      key: 'identifyCode',
      width: 140,
      render: text => <span className="code">{text}</span>
    },
    {
      title: '识别结果',
      dataIndex: 'pestName',
      key: 'pestName',
      width: 120,
      render: (text, record) => (
        <Space direction="vertical" size={4}>
          <span className="pest-name">{text}</span>
          <Progress
            percent={(record.confidence * 100).toFixed(1)}
            size="small"
            showInfo={false}
            strokeColor={getConfidenceColor(record.confidence)}
            style={{ width: 80 }}
          />
          <span className="confidence" style={{ color: getConfidenceColor(record.confidence) }}>
            置信度 {(record.confidence * 100).toFixed(1)}%
          </span>
        </Space>
      )
    },
    {
      title: '危害程度',
      dataIndex: 'damageLevel',
      key: 'damageLevel',
      width: 100,
      render: level => (
        <Tag color={severityLevelMap[level]?.color}>
          {severityLevelMap[level]?.text}
        </Tag>
      )
    },
    {
      title: '识别方式',
      dataIndex: 'identifyMethod',
      key: 'identifyMethod',
      width: 100,
      render: method => (
        <Tag color={identifyMethodMap[method]?.color}>
          {identifyMethodMap[method]?.text}
        </Tag>
      )
    },
    {
      title: '所属大棚',
      dataIndex: 'greenhouseName',
      key: 'greenhouseName',
      width: 100
    },
    {
      title: '识别时间',
      dataIndex: 'identifyTime',
      key: 'identifyTime',
      width: 160,
      render: time => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '处理状态',
      dataIndex: 'handleStatus',
      key: 'handleStatus',
      width: 100,
      render: status => (
        <Tag color={handleStatusMap[status]?.color}>
          {handleStatusMap[status]?.text}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
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
          {record.handleStatus !== 2 && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleProcess(record)}
            >
              处理
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="pest-identify-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">病虫害识别记录</h2>
          <span className="subtitle">AI智能识别与人工判定记录管理</span>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><ScanOutlined /> 总识别数</span>}
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><ClockCircleOutlined /> 待处理</span>}
              value={stats.pending}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><SyncOutlined /> 处理中</span>}
              value={stats.processing}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><CheckCircleOutlined /> 已处理</span>}
              value={stats.handled}
              valueStyle={{ color: '#52c41a' }}
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
          <Form.Item name="handleStatus" label="处理状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 150 }}>
              {Object.entries(handleStatusMap).map(([key, value]) => (
                <Option key={key} value={Number(key)}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="identifyMethod" label="识别方式">
            <Select placeholder="请选择方式" allowClear style={{ width: 150 }}>
              {Object.entries(identifyMethodMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="timeRange" label="时间范围">
            <RangePicker showTime style={{ width: 300 }} />
          </Form.Item>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="编号/病虫害名" style={{ width: 150 }} allowClear />
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
        {identifyList.length > 0 ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={identifyList}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
          />
        ) : (
          <Empty description="暂无识别记录" />
        )}
      </Card>

      <Modal
        title={
          <Space>
            <BugOutlined />
            <span>识别详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={null}
      >
        {currentRecord && (
          <div className="detail-content">
            <Row gutter={24}>
              <Col span={10}>
                <div className="detail-image">
                  <Image
                    width="100%"
                    src={currentRecord.imageUrl}
                    style={{ borderRadius: 8 }}
                  />
                </div>
              </Col>
              <Col span={14}>
                <div className="detail-header">
                  <Space direction="vertical" size={8}>
                    <h3 className="pest-title">{currentRecord.pestName}</h3>
                    <Space>
                      <Tag color={handleStatusMap[currentRecord.handleStatus]?.color}>
                        {handleStatusMap[currentRecord.handleStatus]?.text}
                      </Tag>
                      <Tag color={identifyMethodMap[currentRecord.identifyMethod]?.color}>
                        {identifyMethodMap[currentRecord.identifyMethod]?.text}
                      </Tag>
                      <Tag color={severityLevelMap[currentRecord.damageLevel]?.color}>
                        {severityLevelMap[currentRecord.damageLevel]?.text}
                      </Tag>
                    </Space>
                    <div className="confidence-section">
                      <span className="label">置信度：</span>
                      <Progress
                        percent={(currentRecord.confidence * 100).toFixed(1)}
                        size="small"
                        strokeColor={getConfidenceColor(currentRecord.confidence)}
                        style={{ width: 150, display: 'inline-block', marginRight: 8 }}
                      />
                      <span className="value" style={{ color: getConfidenceColor(currentRecord.confidence) }}>
                        {(currentRecord.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </Space>
                </div>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="识别编号">{currentRecord.identifyCode}</Descriptions.Item>
                  <Descriptions.Item label="所属大棚">{currentRecord.greenhouseName}</Descriptions.Item>
                  <Descriptions.Item label="作物品种">{currentRecord.varietyName}</Descriptions.Item>
                  <Descriptions.Item label="危害面积">{currentRecord.affectedArea} 亩</Descriptions.Item>
                  <Descriptions.Item label="识别时间" span={2}>
                    {dayjs(currentRecord.identifyTime).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <Divider orientation="left">识别结果</Divider>
            <p className="detail-text">{currentRecord.identifyResult}</p>

            <Divider orientation="left">处理建议</Divider>
            <p className="detail-text suggestion">{currentRecord.suggestion}</p>

            {currentRecord.handleStatus !== 0 && (
              <>
                <Divider orientation="left">处理信息</Divider>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="处理人">{currentRecord.handler || '-'}</Descriptions.Item>
                  <Descriptions.Item label="处理时间">
                    {currentRecord.handleTime ? dayjs(currentRecord.handleTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="处理结果" span={2}>
                    {currentRecord.handleResult || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            <span>处理记录</span>
          </Space>
        }
        open={handleModalVisible}
        onCancel={() => setHandleModalVisible(false)}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setHandleModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            确认处理
          </Button>
        ]}
      >
        {currentRecord && (
          <div className="handle-content">
            <Descriptions bordered column={2} size="small" className="handle-desc">
              <Descriptions.Item label="识别编号">{currentRecord.identifyCode}</Descriptions.Item>
              <Descriptions.Item label="病虫害">{currentRecord.pestName}</Descriptions.Item>
              <Descriptions.Item label="所属大棚">{currentRecord.greenhouseName}</Descriptions.Item>
              <Descriptions.Item label="危害程度">
                <Tag color={severityLevelMap[currentRecord.damageLevel]?.color}>
                  {severityLevelMap[currentRecord.damageLevel]?.text}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div className="suggestion-box">
              <h4 className="suggestion-title">
                <FileTextOutlined /> 处理建议
              </h4>
              <p className="suggestion-content">{currentRecord.suggestion}</p>
            </div>

            <Form
              form={handleForm}
              layout="vertical"
              className="handle-form"
            >
              <Form.Item
                name="handleResult"
                label="处理结果"
                rules={[{ required: true, message: '请输入处理结果' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请详细描述处理措施和结果"
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PestIdentify
