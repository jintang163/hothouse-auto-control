import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import BasicLayout from '@/layouts/BasicLayout'
import Dashboard from '@/pages/Dashboard'
import Device from '@/pages/Device'
import Strategy from '@/pages/Strategy'
import Alarm from '@/pages/Alarm'
import History from '@/pages/History'
import ControlLog from '@/pages/ControlLog'
import DeviceMaintenance from '@/pages/DeviceMaintenance'
import useStore from '@/store'

function App() {
  const connectWebSocket = useStore(state => state.connectWebSocket)
  const disconnectWebSocket = useStore(state => state.disconnectWebSocket)

  useEffect(() => {
    connectWebSocket()
    return () => disconnectWebSocket()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<BasicLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="device" element={<Device />} />
        <Route path="strategy" element={<Strategy />} />
        <Route path="alarm" element={<Alarm />} />
        <Route path="history" element={<History />} />
        <Route path="control-log" element={<ControlLog />} />
        <Route path="maintenance" element={<DeviceMaintenance />} />
      </Route>
    </Routes>
  )
}

export default App
