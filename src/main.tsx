import React from 'react'
import ReactDOM from 'react-dom/client'
import { createAppKit } from '@reown/appkit/react'
import { celo } from '@reown/appkit/networks'
import App from './App'
import './index.css'
import { projectId, metadata, wagmiAdapter } from './config/appkit'


// Initialize AppKit before rendering app
createAppKit({
  adapters: [wagmiAdapter],
  networks: [celo],
  projectId,
  metadata,
  features: {
    analytics: true,
  },
})
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
