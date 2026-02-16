import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'
import ReactDOM from "react-dom/client"
import {Provider} from "react-redux"
import { GoogleAuthProvider } from "@react-oauth/google"
import axios from "axios"
import store from "./app/store.js"
const GOOGLE_CLIENT_ID= import.meta.env.VITE_GOOGLE_CLIENT_ID

axios.interceptors.request.use(
 (response)=>response,
 (error)=>{
  if(error.response && error.response.status===401){
    localStorage.removeItem('user');
    window.location.href="/login";
  }
  return Promise.reject(error);
 }
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <GoogleAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
      <Router>
         <App />
      </Router>
            
      </Provider>
  </GoogleAuthProvider>   
 
  </StrictMode>,
)
