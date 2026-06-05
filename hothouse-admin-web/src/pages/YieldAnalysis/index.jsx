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
  Empty,
  InputNumber,
  Divider
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  RiseOutlined,
  BarChartOutlined,
  TrophyOutlined,
  PieChartOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { api } from '@/utils/request'
import { qualityLevelMap, greenhouseList, cropList } from '@/config'
import useStore from '@/store'
import dayjs from 'dayjs'
import './YieldAnalysis.scss'

const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

function YieldAnalysis() {
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)

  const [form] = Form.useForm()
  const [addForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [yieldList, setYieldList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [greenhouses, setGreenhouses] = useState([])

  useEffect(() => {
    loadGreenhouseList()
    loadYieldList()
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

  const loadYieldList = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const params = {
        greenhouseId: currentGreenhouseId,
        page: pagination.current,
        size: pagination.pageSize,
        varietyId: values.varietyId,
        startDate: values.timeRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.timeRange?.[1]?.format('YYYY-MM-DD')
      }
      const data = await api.getYieldRecordList(params)
      setYieldList(data?.records || generateMockData())
      setPagination(prev => ({ ...prev, total: data?.total || 24 }))
    } catch (e) {
      console.error(e)
      setYieldList(generateMockData())
      setPagination(prev => ({ ...prev, total: 24 }))
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => [
    {
      id: 1,
      recordCode: 'YLD20240115001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      varietyId: 1,
      varietyName: '番茄',
      stageId: 1,
      stageName: '结果期',
      harvestDate: '2024-01-15',
      yieldQuantity: 156.5,
      yieldUnit: 'kg',
      qualityLevel: 2,
      averageWeight: 0.18,
      commodityRate: 92.5,
      harvestWorkers: 3,
      harvestDuration: 4,
      weather: '晴',
      remark: '一级果占比85%，果实大小均匀。'
    },
    {
      id: 2,
      recordCode: 'YLD20240114001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      varietyId: 1,
      varietyName: '番茄',
      stageId: 1,
      stageName: '结果期',
      harvestDate: '2024-01-14',
      yieldQuantity: 142.0,
      yieldUnit: 'kg',
      qualityLevel: 2,
      averageWeight: 0.17,
      commodityRate: 88.0,
      harvestWorkers: 2,
      harvestDuration: 3.5,
      weather: '多云',
      remark: '部分果实有轻微裂果。'
    },
    {
      id: 3,
      recordCode: 'YLD20240113001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      varietyId: 1,
      varietyName: '番茄',
      stageId: 1,
      stageName: '结果期',
      harvestDate: '2024-01-13',
      yieldQuantity: 168.5,
      yieldUnit: 'kg',
      qualityLevel: 1,
      averageWeight: 0.19,
      commodityRate: 95.0,
      harvestWorkers: 3,
      harvestDuration: 4.5,
      weather: '晴',
      remark: '品质优良，特级果占比高。'
    },
    {
      id: 4,
      recordCode: 'YLD20240112001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      varietyId: 2,
      varietyName: '黄瓜',
      stageId: 1,
      stageName: '结瓜期',
      harvestDate: '2024-01-12',
      yieldQuantity: 210.0,
      yieldUnit: 'kg',
      qualityLevel: 2,
      averageWeight: 0.22,
      commodityRate: 90.0,
      harvestWorkers: 4,
      harvestDuration: 5,
      weather: '阴',
      remark: '瓜条顺直，商品性好。'
    },
    {
      id: 5,
      recordCode: 'YLD20240111001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      varietyId: 1,
      varietyName: '番茄',
      stageId: 1,
      stageName: '结果期',
      harvestDate: '2024-01-11',
      yieldQuantity: 138.5,
      yieldUnit: 'kg',
      qualityLevel: 3,
      averageWeight: 0.16,
      commodityRate: 75.0,
      harvestWorkers: 2,
      harvestDuration: 3,
      weather: '小雨',
      remark: '受天气影响，部分果实着色不均。'
    },
    {
      id: 6,
      recordCode: 'YLD20240110001',
      greenhouseId: 1,
      greenhouseName: '1号大棚',
      varietyId: 2,
      varietyName: '黄瓜',
      stageId: 1,
      stageName: '结瓜期',
      harvestDate: '2024-01-10',
      yieldQuantity: 195.5,
      yieldUnit: 'kg',
      qualityLevel: 1,
      averageWeight: 0.23,
      commodityRate: 94.5,
      harvestWorkers: 3,
      harvestDuration: 4,
      weather: '晴',
      remark: '产量稳定，品质优良。'
    }
  ]

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadYieldList, 0)
  }

  const handleReset = () => {
    form.resetFields()
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadYieldList, 0)
  }

  const handleAdd = () => {
    addForm.resetFields()
    setAddModalVisible(true)
  }

  const handleSave = async () => {
    try {
      const values = await addForm.validateFields()
      const data = {
        ...values,
        greenhouseId: currentGreenhouseId,
        harvestDate: values.harvestDate?.format('YYYY-MM-DD')
      }
      await api.addYieldRecord(data)
      message.success('记录添加成功')
      setAddModalVisible(false)
      loadYieldList()
    } catch (e) {
      console.error(e)
      if (e?.errorFields) return
      message.error('添加失败')
    }
  }

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
  }

  const getStatistics = () => {
    const totalYield = yieldList.reduce((sum, item) => sum + Number(item.yieldQuantity || 0), 0)
    const avgYield = yieldList.length > 0 ? totalYield / yieldList.length : 0
    const maxYield = yieldList.length > 0 ? Math.max(...yieldList.map(item => Number(item.yieldQuantity || 0))) : 0

    const qualityCount = {
      1: yieldList.filter(i => i.qualityLevel === 1).length,
      2: yieldList.filter(i => i.qualityLevel === 2).length,
      3: yieldList.filter(i => i.qualityLevel === 3).length,
      4: yieldList.filter(i => i.qualityLevel === 4).length
    }

    return { totalYield: totalYield.toFixed(1), avgYield: avgYield.toFixed(1), maxYield: maxYield.toFixed(1), qualityCount }
  }

  const stats = getStatistics()

  const getTrendChartOption = () => {
    const sortedList = [...yieldList].sort((a, b) => 
      dayjs(a.harvestDate).valueOf() - dayjs(b.harvestDate).valueOf()
    )
    
    return {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>产量: {c} kg'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: sortedList.map(item => dayjs(item.harvestDate).format('MM-DD'))
      },
      yAxis: {
        type: 'value',
        name: '产量(kg)'
      },
      series: [{
        name: '产量',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: 'rgba(24, 144, 255, 0.3)'
            }, {
              offset: 1,
              color: 'rgba(24, 144, 255, 0.05)'
            }]
          }
        },
        lineStyle: {
          color: '#1890ff',
          width: 2
        },
        itemStyle: {
          color: '#1890ff'
        },
        data: sortedList.map(item => item.yieldQuantity)
      }]
    }
  }

  const getQualityChartOption = () => {
    const data = [
      { value: stats.qualityCount[1], name: '特级', itemStyle: { color: '#722ed1' } },
      { value: stats.qualityCount[2], name: '一级', itemStyle: { color: '#1890ff' } },
      { value: stats.qualityCount[3], name: '二级', itemStyle: { color: '#52c41a' } },
      { value: stats.qualityCount[4], name: '三级', itemStyle: { color: '#faad14' } }
    ].filter(item => item.value > 0)

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center'
      },
      series: [{
        name: '品质分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: data.length > 0 ? data : [{ value: 1, name: '暂无数据', itemStyle: { color: '#d9d9d9' } }]
      }]
    }
  }

  const columns = [
    {
      title: '记录编号',
      dataIndex: 'recordCode',
      key: 'recordCode',
      width: 140,
      render: text => <span className="code">{text}</span>
    },
    {
      title: '作物品种',
      dataIndex: 'varietyName',
      key: 'varietyName',
      width: 100
    },
    {
      title: '采收日期',
      dataIndex: 'harvestDate',
      key: 'harvestDate',
      width: 120,
      render: date => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '产量',
      dataIndex: 'yieldQuantity',
      key: 'yieldQuantity',
      width: 100,
      render: (value, record) => (
        <span className="yield-value">
          <strong>{value}</strong> {record.yieldUnit}
        </span>
      )
    },
    {
      title: '品质等级',
      dataIndex: 'qualityLevel',
      key: 'qualityLevel',
      width: 100,
      render: level => (
        <Tag color={qualityLevelMap[level]?.color}>
          {qualityLevelMap[level]?.text}
        </Tag>
      )
    },
    {
      title: '商品率',
      dataIndex: 'commodityRate',
      key: 'commodityRate',
      width: 100,
      render: value => `${value}%`
    },
    {
      title: '平均单重',
      dataIndex: 'averageWeight',
      key: 'averageWeight',
      width: 100,
      render: value => `${value}kg`
    },
    {
      title: '采收工时',
      key: 'harvest',
      width: 140,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{record.harvestWorkers} 人</span>
          <span>{record.harvestDuration} 小时</span>
        </Space>
      )
    },
    {
      title: '天气',
      dataIndex: 'weather',
      key: 'weather',
      width: 80
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 180,
      ellipsis: true
    }
  ]

  return (
    <div className="yield-analysis-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">产量分析</h2>
          <span className="subtitle">产量数据统计与趋势分析</span>
        </div>
        <div className="header-right">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增记录
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><BarChartOutlined /> 总产量</span>}
              value={stats.totalYield}
              suffix="kg"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><RiseOutlined /> 平均产量</span>}
              value={stats.avgYield}
              suffix="kg"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><TrophyOutlined /> 最高产量</span>}
              value={stats.maxYield}
              suffix="kg"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><PieChartOutlined /> 品质分布</span>}
              value={Object.values(stats.qualityCount).reduce((a, b) => a + b, 0)}
              suffix="条记录"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} lg={14}>
          <Card className="chart-card" title="产量趋势">
            <ReactECharts
              option={getTrendChartOption()}
              style={{ height: 320 }}
              notMerge={true}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="chart-card" title="品质分布">
            <ReactECharts
              option={getQualityChartOption()}
              style={{ height: 320 }}
              notMerge={true}
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
          <Form.Item name="varietyId" label="作物品种">
            <Select placeholder="请选择品种" allowClear style={{ width: 150 }}>
              {cropList.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="timeRange" label="时间范围">
            <RangePicker style={{ width: 280 }} />
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

      <Card className="table-card" title="产量记录">
        {yieldList.length > 0 ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={yieldList}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1300 }}
          />
        ) : (
          <Empty description="暂无产量记录" />
        )}
      </Card>

      <Modal
        title={
          <Space>
            <PlusOutlined />
            <span>新增产量记录</span>
          </Space>
        }
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        width={700}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="varietyId"
                label="作物品种"
                rules={[{ required: true, message: '请选择作物品种' }]}
              >
                <Select placeholder="请选择作物品种">
                  {cropList.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="harvestDate"
                label="采收日期"
                rules={[{ required: true, message: '请选择采收日期' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择采收日期"
                  defaultValue={dayjs()}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="yieldQuantity"
                label="产量"
                rules={[{ required: true, message: '请输入产量' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入产量"
                  min={0}
                  step={0.1}
                  addonAfter="kg"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="qualityLevel"
                label="品质等级"
                rules={[{ required: true, message: '请选择品质等级' }]}
              >
                <Select placeholder="请选择品质等级">
                  {Object.entries(qualityLevelMap).map(([key, value]) => (
                    <Option key={key} value={Number(key)}>
                      {value.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="averageWeight"
                label="平均单重"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="平均单重"
                  min={0}
                  step={0.01}
                  addonAfter="kg"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="commodityRate"
                label="商品率"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="商品率"
                  min={0}
                  max={100}
                  step={0.1}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="weather"
                label="天气"
              >
                <Select placeholder="请选择天气">
                  <Option value="晴">晴</Option>
                  <Option value="多云">多云</Option>
                  <Option value="阴">阴</Option>
                  <Option value="小雨">小雨</Option>
                  <Option value="中雨">中雨</Option>
                  <Option value="大雨">大雨</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="harvestWorkers"
                label="采收人数"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="采收人数"
                  min={1}
                  addonAfter="人"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="harvestDuration"
                label="采收时长"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="采收时长"
                  min={0}
                  step={0.5}
                  addonAfter="小时"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea
              rows={3}
              placeholder="请输入备注信息"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default YieldAnalysis
