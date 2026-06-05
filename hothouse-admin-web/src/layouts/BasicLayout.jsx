import { Layout, Menu, Badge, Dropdown, Avatar, Space } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  DashboardOutlined,
  ToolOutlined,
  SettingOutlined,
  BellOutlined,
  LineChartOutlined,
  FileTextOutlined,
  UserOutlined,
  WifiOutlined,
  WifiOffOutlined,
  ToolFilled
} from '@ant-design/icons'
import useStore from '@/store'
import { api } from '@/utils/request'
import './BasicLayout.scss'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '监控大屏' },
  { key: '/device', icon: <ToolOutlined />, label: '设备管理' },
  { key: '/strategy', icon: <SettingOutlined />, label: '策略配置' },
  { key: '/alarm', icon: <BellOutlined />, label: '告警中心' },
  { key: '/history', icon: <LineChartOutlined />, label: '历史数据' },
  { key: '/control-log', icon: <FileTextOutlined />, label: '操作日志' },
  { key: '/maintenance', icon: <ToolFilled />, label: '设备运维' }
]

const userMenuItems = [
  { key: 'profile', label: '个人中心' },
  { key: 'settings', label: '系统设置' },
  { type: 'divider' },
  { key: 'logout', label: '退出登录' }
]

function BasicLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const wsConnected = useStore(state => state.wsConnected)
  const currentGreenhouseId = useStore(state => state.currentGreenhouseId)
  const setCurrentGreenhouseId = useStore(state => state.setCurrentGreenhouseId)
  const connectWebSocket = useStore(state => state.connectWebSocket)
  const disconnectWebSocket = useStore(state => state.disconnectWebSocket)
  const activeAlarms = useStore(state => state.activeAlarms)

  const [alarmCount, setAlarmCount] = useState(0)
  const [greenhouseList, setGreenhouseList] = useState([])

  useEffect(() => {
    loadGreenhouseList()
    loadAlarmCount()
  }, [activeAlarms])

  const loadGreenhouseList = async () => {
    try {
      const data = await api.getGreenhouseList()
      setGreenhouseList(data || [])
      if (data && data.length > 0 && !useStore.getState().currentGreenhouseId) {
        useStore.getState().setCurrentGreenhouseId(data[0].id)
      }
    } catch (e) {
      console.error(e)
      setGreenhouseList([
        { id: 1, name: '1号大棚', code: 'GH001' },
        { id: 2, name: '2号大棚', code: 'GH002' },
        { id: 3, name: '3号大棚', code: 'GH003' }
      ])
    }
  }

  const loadAlarmCount = async () => {
    try {
      if (activeAlarms.length > 0) {
        setAlarmCount(activeAlarms.length)
      } else {
        const data = await api.getAlarmCount()
        setAlarmCount(data?.total || 0)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleGreenhouseChange = (id) => {
    setCurrentGreenhouseId(id)
    disconnectWebSocket()
    setTimeout(() => connectWebSocket(), 500)
  }

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  const currentGreenhouse = greenhouseList.find(g => g.id === currentGreenhouseId)

  return (
    <Layout className="layout">
      <Sider className="sider" width={240} theme="dark">
        <div className="logo">
          <span className="logo-icon">🌱</span>
          <span className="logo-text">智慧大棚</span>
        </div>
        <div className="greenhouse-select">
          <span className="label">当前大棚:</span>
          <select
            className="select"
            value={currentGreenhouseId}
            onChange={e => handleGreenhouseChange(Number(e.target.value))}
          >
            {greenhouseList.map(gh => (
              <option key={gh.id} value={gh.id}>{gh.name}</option>
            ))}
          </select>
        </div>
        <div className="ws-status">
          {wsConnected ? (
            <span className="status connected"><WifiOutlined /> 实时连接</span>
          ) : (
            <span className="status disconnected"><WifiOffOutlined /> 连接断开</span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header className="header">
          <div className="header-left">
            <span className="page-title">{currentGreenhouse?.name} - 智能环控系统</span>
          </div>
          <div className="header-right">
            <Space size={24}>
              <Badge count={alarmCount} size="small">
                <BellOutlined
                  className="header-icon"
                  onClick={() => navigate('/alarm')}
                />
              </Badge>
              <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }}>
                <Space className="user-info">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span>管理员</span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content className="content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default BasicLayout
