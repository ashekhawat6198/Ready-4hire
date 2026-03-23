import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import useSocket from './hooks/useSocket';
import { ToastContainer } from 'react-toastify';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import InterviewRunner from './pages/InterviewRunner';
import SessionReview from './pages/SessionReview';
import NotFound from './pages/NotFound';
import ResumeUploader from './pages/ResumeUploader';
import Leaderboard from './pages/Leaderboard';

const FASTAPI_URL = "https://ready-4hire-2.onrender.com"; 

const App = () => {
  useSocket();

  useEffect(() => {
    const wakeUp = async () => {
      try {
        await fetch(`${FASTAPI_URL}/health`);
        console.log("FastAPI is awake");
      } catch {
        console.warn("FastAPI wake-up ping failed — it may still be starting");
      }
    };
    wakeUp();
  }, []);

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />
      <main className='container mx-auto p-4'>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/' element={<PrivateRoute />}>
            <Route path='/' element={<Dashboard />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/resumeUploader' element={<ResumeUploader/>}/>
            <Route path='/interview/:sessionId' element={<InterviewRunner />} />
            <Route path="/review/:sessionId" element={<SessionReview />} />
            <Route path="/leaderboard" element={<Leaderboard/>}/>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <ToastContainer position='top-right' autoClose={3000}/>
    </div>
  )
}

export default App