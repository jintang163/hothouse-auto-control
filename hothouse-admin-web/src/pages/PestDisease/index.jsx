import { useState, useEffect } from 'react'
import {
  Form,
  Select,
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
  Descriptions,
  Upload,
  Image,
  Empty,
  Switch,
  Divider,
  Popconfirm
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BugOutlined,
  VirusOutlined,
  CheckCircleOutlined,
  PictureOutlined
} from '@ant-design/icons'
import { api } from '@/utils/request'
import { pestTypeMap, severityLevelMap, pestStatusMap, cropList } from '@/config'
import './PestDisease.scss'

const { Option } = Select
const { TextArea } = Input

function PestDisease() {
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [pestList, setPestList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12, total: 0 })
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [currentPest, setCurrentPest] = useState(null)
  const [isEdit, setIsEdit] = useState(false)
  const [imageList, setImageList] = useState([])

  useEffect(() => {
    loadPestList()
  }, [pagination.current, pagination.pageSize])

  const loadPestList = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const params = {
        page: pagination.current,
        size: pagination.pageSize,
        pestType: values.pestType,
        cropName: values.cropName,
        status: values.status,
        keyword: values.keyword
      }
      const data = await api.getPestDiseaseList(params)
      setPestList(data?.records || generateMockData())
      setPagination(prev => ({ ...prev, total: data?.total || 15 }))
    } catch (e) {
      console.error(e)
      setPestList(generateMockData())
      setPagination(prev => ({ ...prev, total: 15 }))
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => [
    {
      id: 1,
      pestCode: 'PEST001',
      pestName: '蚜虫',
      pestType: 'PEST',
      scientificName: 'Aphidoidea',
      aliasNames: '蜜虫、腻虫',
      susceptibleCrops: '番茄,黄瓜,辣椒,茄子',
      symptomDescription: '主要危害叶片、嫩茎。被害叶片向背面卷曲皱缩，严重时叶片枯黄脱落。',
      damageSymptom: '成虫和若虫吸食植物汁液，分泌蜜露，诱发煤污病，传播病毒病。',
      occurrenceCondition: '温度20-28℃，相对湿度60%-70%时最易发生。',
      occurrencePeriod: '春季3-5月，秋季9-10月为高发期。',
      imageUrls: JSON.stringify([
        'https://example.com/aphid1.jpg',
        'https://example.com/aphid2.jpg'
      ]),
      preventionMethods: '1. 清除田间杂草；2. 保护天敌瓢虫、草蛉；3. 悬挂黄板诱杀。',
      controlAgents: '吡虫啉、噻虫嗪、苦参碱、印楝素',
      biologicalControl: '释放瓢虫、食蚜蝇等天敌，喷施白僵菌。',
      agriculturalControl: '选用抗虫品种，合理密植，加强通风。',
      physicalControl: '悬挂黄板诱杀，高温闷棚。',
      severityLevel: 2,
      status: 1
    },
    {
      id: 2,
      pestCode: 'PEST002',
      pestName: '白粉虱',
      pestType: 'PEST',
      scientificName: 'Trialeurodes vaporariorum',
      aliasNames: '小白蛾',
      susceptibleCrops: '番茄,黄瓜,茄子,生菜',
      symptomDescription: '成虫和若虫群集在叶片背面吸食汁液，导致叶片褪绿、黄化、萎蔫。',
      damageSymptom: '分泌大量蜜露，引起煤污病，传播多种病毒病。',
      occurrenceCondition: '高温高湿环境，温度25-30℃时繁殖最快。',
      occurrencePeriod: '全年均可发生，保护地尤为严重。',
      imageUrls: JSON.stringify(['https://example.com/whitefly1.jpg']),
      preventionMethods: '1. 安装防虫网；2. 悬挂黄板诱杀；3. 释放丽蚜小蜂。',
      controlAgents: '噻虫嗪、吡蚜酮、联苯菊酯',
      biologicalControl: '释放丽蚜小蜂、桨角蚜小蜂。',
      agriculturalControl: '培育无虫苗，避免混栽。',
      physicalControl: '黄板诱杀，高温闷棚。',
      severityLevel: 2,
      status: 1
    },
    {
      id: 3,
      pestCode: 'DISE001',
      pestName: '灰霉病',
      pestType: 'DISEASE',
      scientificName: 'Botrytis cinerea',
      aliasNames: '灰毛病',
      susceptibleCrops: '番茄,黄瓜,草莓,茄子',
      symptomDescription: '花、果、叶、茎均可发病。果实病斑呈水渍状软腐，表面产生灰色霉层。',
      damageSymptom: '病菌从花器侵入，导致果实腐烂，严重时整株死亡。',
      occurrenceCondition: '低温高湿，温度18-23℃，相对湿度90%以上。',
      occurrencePeriod: '冬春季节保护地易发，遇连阴雨天气暴发。',
      imageUrls: JSON.stringify([
        'https://example.com/graymold1.jpg',
        'https://example.com/graymold2.jpg'
      ]),
      preventionMethods: '1. 控制棚内湿度；2. 及时清除病残体；3. 合理密植。',
      controlAgents: '腐霉利、异菌脲、嘧霉胺、木霉菌',
      biologicalControl: '喷施木霉菌、枯草芽孢杆菌。',
      agriculturalControl: '选用抗病品种，高垄栽培，地膜覆盖。',
      physicalControl: '通风降湿，高温闷棚。',
      severityLevel: 3,
      status: 1
    },
    {
      id: 4,
      pestCode: 'DISE002',
      pestName: '白粉病',
      pestType: 'DISEASE',
      scientificName: 'Erysiphaceae',
      aliasNames: '白毛病',
      susceptibleCrops: '黄瓜,番茄,茄子,西瓜',
      symptomDescription: '主要危害叶片，发病初期叶片出现白色小粉斑，逐渐扩大连片。',
      damageSymptom: '严重时叶片枯黄卷缩，植株早衰，影响光合作用。',
      occurrenceCondition: '温度20-25℃，干湿交替利于发病。',
      occurrencePeriod: '春季4-6月，秋季9-10月。',
      imageUrls: JSON.stringify(['https://example.com/powdery1.jpg']),
      preventionMethods: '1. 合理施肥；2. 控制种植密度；3. 及时清除病叶。',
      controlAgents: '三唑酮、戊唑醇、醚菌酯、枯草芽孢杆菌',
      biologicalControl: '喷施枯草芽孢杆菌、武夷菌素。',
      agriculturalControl: '选用抗病品种，加强通风透光。',
      physicalControl: '硫磺熏蒸。',
      severityLevel: 2,
      status: 1
    },
    {
      id: 5,
      pestCode: 'PEST003',
      pestName: '红蜘蛛',
      pestType: 'PEST',
      scientificName: 'Tetranychus cinnabarinus',
      aliasNames: '朱砂叶螨',
      susceptibleCrops: '茄子,番茄,黄瓜,西瓜',
      symptomDescription: '叶片受害后出现灰白色小点，严重时叶片枯黄、脱落。',
      damageSymptom: '以成螨、若螨吸食叶片汁液，导致植株生长受阻。',
      occurrenceCondition: '高温干旱，温度25-30℃，相对湿度低于70%。',
      occurrencePeriod: '夏季6-8月为高发期。',
      imageUrls: JSON.stringify(['https://example.com/spider1.jpg']),
      preventionMethods: '1. 保持棚内湿度；2. 清除杂草；3. 保护天敌。',
      controlAgents: '阿维菌素、哒螨灵、螺螨酯',
      biologicalControl: '释放捕食螨、草蛉。',
      agriculturalControl: '合理灌溉，避免过度干旱。',
      physicalControl: '喷水增湿。',
      severityLevel: 2,
      status: 1
    },
    {
      id: 6,
      pestCode: 'DISE003',
      pestName: '霜霉病',
      pestType: 'DISEASE',
      scientificName: 'Pseudoperonospora cubensis',
      aliasNames: '跑马干',
      susceptibleCrops: '黄瓜,西瓜,甜瓜',
      symptomDescription: '叶片出现多角形黄色病斑，湿度大时叶背面产生灰黑色霉层。',
      damageSymptom: '发病迅速，短期内叶片大量枯死，造成严重减产。',
      occurrenceCondition: '高湿低温，昼夜温差大，结露时间长。',
      occurrencePeriod: '春秋季多雨年份高发。',
      imageUrls: JSON.stringify(['https://example.com/downy1.jpg']),
      preventionMethods: '1. 控制棚内湿度；2. 合理密植；3. 增施磷钾肥。',
      controlAgents: '甲霜灵、霜脲氰、烯酰吗啉、百菌清',
      biologicalControl: '喷施霜霉威、枯草芽孢杆菌。',
      agriculturalControl: '选用抗病品种，高垄栽培。',
      physicalControl: '高温闷棚。',
      severityLevel: 3,
      status: 1
    }
  ]

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadPestList, 0)
  }

  const handleReset = () => {
    form.resetFields()
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(loadPestList, 0)
  }

  const handleViewDetail = async (pest) => {
    setCurrentPest(pest)
    try {
      const detail = await api.getPestDisease(pest.id)
      setCurrentPest(detail || pest)
    } catch (e) {
      console.error(e)
    }
    setDetailModalVisible(true)
  }

  const handleAdd = () => {
    editForm.resetFields()
    setImageList([])
    setIsEdit(false)
    setCurrentPest(null)
    setEditModalVisible(true)
  }

  const handleEdit = (pest) => {
    setCurrentPest(pest)
    setIsEdit(true)
    const images = pest.imageUrls ? JSON.parse(pest.imageUrls).map((url, idx) => ({
      uid: idx,
      name: `image${idx}`,
      status: 'done',
      url
    })) : []
    setImageList(images)
    editForm.setFieldsValue({
      ...pest,
      susceptibleCrops: pest.susceptibleCrops?.split(',') || []
    })
    setEditModalVisible(true)
  }

  const handleSave = async () => {
    try {
      const values = await editForm.validateFields()
      const data = {
        ...values,
        susceptibleCrops: values.susceptibleCrops?.join(','),
        imageUrls: JSON.stringify(imageList.map(img => img.url || img.name))
      }
      if (isEdit && currentPest) {
        await api.updatePestDisease({ ...currentPest, ...data })
        message.success('更新成功')
      } else {
        await api.addPestDisease(data)
        message.success('添加成功')
      }
      setEditModalVisible(false)
      loadPestList()
    } catch (e) {
      console.error(e)
      if (e?.errorFields) return
      message.error('保存失败')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deletePestDisease(id)
      message.success('删除成功')
      loadPestList()
    } catch (e) {
      console.error(e)
      message.error('删除失败')
    }
  }

  const handleToggleStatus = async (pest, checked) => {
    try {
      await api.updatePestDisease({ ...pest, status: checked ? 1 : 0 })
      message.success(`已${checked ? '启用' : '禁用'}`)
      loadPestList()
    } catch (e) {
      console.error(e)
      message.error('操作失败')
    }
  }

  const handlePageChange = (page, pageSize) => {
    setPagination({ current: page, pageSize, total: pagination.total })
  }

  const getStatistics = () => {
    const pestCount = pestList.filter(p => p.pestType === 'PEST').length
    const diseaseCount = pestList.filter(p => p.pestType === 'DISEASE').length
    const enabledCount = pestList.filter(p => p.status === 1).length
    const disabledCount = pestList.filter(p => p.status === 0).length
    return { pestCount, diseaseCount, enabledCount, disabledCount }
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
        <Image
          width="100%"
          height={160}
          src={images[0]}
          className="pest-cover"
        />
      )
    } catch (e) {
      return null
    }
  }

  return (
    <div className="pest-disease-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="title">病虫害知识库</h2>
          <span className="subtitle">病虫害信息管理与防治方案</span>
        </div>
        <div className="header-right">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增病虫害
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><BugOutlined /> 虫害数</span>}
              value={stats.pestCount}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><VirusOutlined /> 病害数</span>}
              value={stats.diseaseCount}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><CheckCircleOutlined /> 已启用</span>}
              value={stats.enabledCount}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title={<span className="stat-title"><VirusOutlined /> 已禁用</span>}
              value={stats.disabledCount}
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
          <Form.Item name="pestType" label="类型">
            <Select placeholder="请选择类型" allowClear style={{ width: 150 }}>
              {Object.entries(pestTypeMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="cropName" label="易感作物">
            <Select placeholder="请选择作物" allowClear style={{ width: 150 }}>
              {cropList.map(item => (
                <Option key={item.id} value={item.name}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 150 }}>
              {Object.entries(pestStatusMap).map(([key, value]) => (
                <Option key={key} value={Number(key)}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="名称/别名" style={{ width: 180 }} allowClear />
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

      <Card className="card-grid-wrapper" loading={loading}>
        {pestList.length > 0 ? (
          <Row gutter={[16, 16]} className="card-grid">
            {pestList.map(pest => (
              <Col xs={24} sm={12} lg={8} xl={6} key={pest.id}>
                <Card
                  className="pest-card"
                  hoverable
                  cover={renderImages(pest.imageUrls)}
                  actions={[
                    <EyeOutlined key="view" onClick={() => handleViewDetail(pest)} title="查看详情" />,
                    <EditOutlined key="edit" onClick={() => handleEdit(pest)} title="编辑" />,
                    <Popconfirm
                      key="delete"
                      title="确定要删除此病虫害信息吗？"
                      onConfirm={() => handleDelete(pest.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <DeleteOutlined className="danger" title="删除" />
                    </Popconfirm>
                  ]}
                >
                  <div className="pest-card-header">
                    <Space>
                      <Tag color={pestTypeMap[pest.pestType]?.color}>
                        {pestTypeMap[pest.pestType]?.text}
                      </Tag>
                      <Tag color={severityLevelMap[pest.severityLevel]?.color}>
                        {severityLevelMap[pest.severityLevel]?.text}
                      </Tag>
                    </Space>
                    <Switch
                      size="small"
                      checked={pest.status === 1}
                      onChange={(checked) => handleToggleStatus(pest, checked)}
                    />
                  </div>
                  <h3 className="pest-name">{pest.pestName}</h3>
                  <p className="pest-alias">{pest.aliasNames}</p>
                  <div className="pest-crops">
                    <span className="crops-label">易感作物：</span>
                    {pest.susceptibleCrops?.split(',').map((crop, idx) => (
                      <Tag key={idx} color="blue" size="small">{crop}</Tag>
                    ))}
                  </div>
                  <p className="pest-symptom">{pest.symptomDescription?.slice(0, 60)}...</p>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无数据" />
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
            <BugOutlined />
            <span>病虫害详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={900}
        footer={null}
      >
        {currentPest && (
          <div className="detail-content">
            <div className="detail-header">
              <h3 className="detail-title">{currentPest.pestName}</h3>
              <Space>
                <Tag color={pestTypeMap[currentPest.pestType]?.color}>
                  {pestTypeMap[currentPest.pestType]?.text}
                </Tag>
                <Tag color={severityLevelMap[currentPest.severityLevel]?.color}>
                  严重程度：{severityLevelMap[currentPest.severityLevel]?.text}
                </Tag>
                <Tag color={pestStatusMap[currentPest.status]?.color}>
                  {pestStatusMap[currentPest.status]?.text}
                </Tag>
              </Space>
            </div>

            {currentPest.imageUrls && (
              <div className="detail-images">
                <Image.PreviewGroup>
                  {JSON.parse(currentPest.imageUrls).map((img, idx) => (
                    <Image key={idx} width={140} height={140} src={img} style={{ margin: 8, borderRadius: 8 }} />
                  ))}
                </Image.PreviewGroup>
              </div>
            )}

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="编号">{currentPest.pestCode}</Descriptions.Item>
              <Descriptions.Item label="学名">{currentPest.scientificName}</Descriptions.Item>
              <Descriptions.Item label="别名">{currentPest.aliasNames}</Descriptions.Item>
              <Descriptions.Item label="易感作物">
                {currentPest.susceptibleCrops?.split(',').map((c, i) => (
                  <Tag key={i} color="blue" style={{ marginBottom: 4 }}>{c}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">症状描述</Divider>
            <p className="detail-text">{currentPest.symptomDescription}</p>

            <Divider orientation="left">危害特点</Divider>
            <p className="detail-text">{currentPest.damageSymptom}</p>

            <Divider orientation="left">发生条件</Divider>
            <p className="detail-text">{currentPest.occurrenceCondition}</p>

            <Divider orientation="left">发生时期</Divider>
            <p className="detail-text">{currentPest.occurrencePeriod}</p>

            <Divider orientation="left">防治方法</Divider>
            <div className="control-methods">
              <div className="method-item">
                <h4 className="method-title">预防措施</h4>
                <p className="method-content">{currentPest.preventionMethods}</p>
              </div>
              <div className="method-item">
                <h4 className="method-title">农业防治</h4>
                <p className="method-content">{currentPest.agriculturalControl}</p>
              </div>
              <div className="method-item">
                <h4 className="method-title">物理防治</h4>
                <p className="method-content">{currentPest.physicalControl}</p>
              </div>
              <div className="method-item">
                <h4 className="method-title">生物防治</h4>
                <p className="method-content">{currentPest.biologicalControl}</p>
              </div>
              <div className="method-item">
                <h4 className="method-title">药剂防治</h4>
                <p className="method-content">{currentPest.controlAgents}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <Space>
            <PlusOutlined />
            <span>{isEdit ? '编辑' : '新增'}病虫害</span>
          </Space>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            保存
          </Button>
        ]}
      >
        <Form
          form={editForm}
          layout="vertical"
          className="edit-form"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pestName"
                label="病虫害名称"
                rules={[{ required: true, message: '请输入名称' }]}
              >
                <Input placeholder="请输入病虫害名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pestCode"
                label="编号"
                rules={[{ required: true, message: '请输入编号' }]}
              >
                <Input placeholder="请输入编号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pestType"
                label="类型"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="请选择类型">
                  {Object.entries(pestTypeMap).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="severityLevel"
                label="严重程度"
                rules={[{ required: true, message: '请选择严重程度' }]}
              >
                <Select placeholder="请选择严重程度">
                  {Object.entries(severityLevelMap).map(([key, value]) => (
                    <Option key={key} value={Number(key)}>
                      {value.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="scientificName"
                label="学名"
              >
                <Input placeholder="请输入学名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="aliasNames"
                label="别名"
              >
                <Input placeholder="请输入别名，多个用逗号分隔" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="susceptibleCrops"
            label="易感作物"
            rules={[{ required: true, message: '请选择易感作物' }]}
          >
            <Select mode="multiple" placeholder="请选择易感作物">
              {cropList.map(item => (
                <Option key={item.id} value={item.name}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="symptomDescription"
            label="症状描述"
            rules={[{ required: true, message: '请输入症状描述' }]}
          >
            <TextArea rows={3} placeholder="请详细描述症状" />
          </Form.Item>
          <Form.Item
            name="damageSymptom"
            label="危害特点"
          >
            <TextArea rows={2} placeholder="请描述危害特点" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="occurrenceCondition"
                label="发生条件"
              >
                <TextArea rows={2} placeholder="请描述发生条件" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="occurrencePeriod"
                label="发生时期"
              >
                <TextArea rows={2} placeholder="请描述发生时期" />
              </Form.Item>
            </Col>
          </Row>
          <Divider orientation="left">防治方法</Divider>
          <Form.Item
            name="preventionMethods"
            label="预防措施"
          >
            <TextArea rows={2} placeholder="请描述预防措施" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="agriculturalControl"
                label="农业防治"
              >
                <TextArea rows={2} placeholder="请描述农业防治方法" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="physicalControl"
                label="物理防治"
              >
                <TextArea rows={2} placeholder="请描述物理防治方法" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="biologicalControl"
                label="生物防治"
              >
                <TextArea rows={2} placeholder="请描述生物防治方法" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="controlAgents"
                label="药剂防治"
              >
                <TextArea rows={2} placeholder="请描述药剂防治方法" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="图谱图片">
            <Upload {...uploadProps} listType="picture-card" multiple>
              <div>
                <PictureOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PestDisease
