import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFCF7',
            color: '#1C1410',
            border: '1px solid rgba(201,168,124,0.4)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#D4922A', secondary: '#F7F3ED' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
