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
import Prescription from '@/pages/Prescription'
import FarmingTask from '@/pages/FarmingTask'
import FarmingLog from '@/pages/FarmingLog'
import PestDisease from '@/pages/PestDisease'
import PestIdentify from '@/pages/PestIdentify'
import YieldAnalysis from '@/pages/YieldAnalysis'
import IrrigationFormula from '@/pages/IrrigationFormula'
import IrrigationDevice from '@/pages/IrrigationDevice'
import IrrigationTask from '@/pages/IrrigationTask'
import IrrigationRecord from '@/pages/IrrigationRecord'
import IrrigationAlarm from '@/pages/IrrigationAlarm'
import FertilizerTank from '@/pages/FertilizerTank'
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
        <Route path="prescription" element={<Prescription />} />
        <Route path="farming-task" element={<FarmingTask />} />
        <Route path="farming-log" element={<FarmingLog />} />
        <Route path="pest-disease" element={<PestDisease />} />
        <Route path="pest-identify" element={<PestIdentify />} />
        <Route path="yield-analysis" element={<YieldAnalysis />} />
        <Route path="irrigation/formula" element={<IrrigationFormula />} />
        <Route path="irrigation/device" element={<IrrigationDevice />} />
        <Route path="irrigation/task" element={<IrrigationTask />} />
        <Route path="irrigation/record" element={<IrrigationRecord />} />
        <Route path="irrigation/alarm" element={<IrrigationAlarm />} />
        <Route path="irrigation/tank" element={<FertilizerTank />} />
      </Route>
    </Routes>
  )
}

export default App
