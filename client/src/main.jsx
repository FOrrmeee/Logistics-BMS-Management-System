import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register PWA service worker
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <App />
            </CurrencyProvider>
          </LanguageProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
