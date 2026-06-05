import { create } from 'zustand'
import { WS_URL } from '@/config'

const useStore = create((set, get) => ({
  currentGreenhouseId: 1,
  setCurrentGreenhouseId: (id) => set({ currentGreenhouseId: id }),

  realtimeData: null,
  setRealtimeData: (data) => set({ realtimeData: data }),

  deviceList: [],
  setDeviceList: (devices) => set({ deviceList: devices }),

  activeAlarms: [],
  setActiveAlarms: (alarms) => set({ activeAlarms: alarms }),

  controlMode: 1,
  setControlMode: (mode) => set({ controlMode: mode }),

  wsConnected: false,
  setWsConnected: (connected) => set({ wsConnected: connected }),

  wsInstance: null,

  connectWebSocket: () => {
    if (get().wsInstance && get().wsConnected) return

    const greenhouseId = get().currentGreenhouseId
    const ws = new WebSocket(`${WS_URL}/${greenhouseId}`)

    ws.onopen = () => {
      console.log('WebSocket connected')
      set({ wsConnected: true, wsInstance: ws })
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        set({ realtimeData: data })

        if (data.alarms && data.alarms.length > 0) {
          set({ activeAlarms: data.alarms })
        }
      } catch (e) {
        console.error('Parse error', e)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket closed')
      set({ wsConnected: false, wsInstance: null })
      setTimeout(() => {
        get().connectWebSocket()
      }, 3000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  },

  disconnectWebSocket: () => {
    const ws = get().wsInstance
    if (ws) {
      ws.close()
    }
  }
}))

export default useStore
