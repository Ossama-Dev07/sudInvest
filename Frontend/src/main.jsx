import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import { ThemeProvider, useTheme } from "@/components/theme-provider";



createRoot(document.getElementById("root")).render(
  <StrictMode>
  
    <ToastContainer position="top-center"  theme="colored"/>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </StrictMode>
);
