// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import PdfViewer from './components/pdfViewer.tsx'
import PdfViewer2 from './components/pdfViewer.tsx'

createRoot(document.getElementById('root')!).render(
    <PdfViewer />
)
