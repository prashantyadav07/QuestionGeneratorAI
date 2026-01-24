// File: src/App.jsx

import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Core Components
import ProtectedRoute from './components/ProtectedRoute';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Test from './pages/Test';
import Results from './pages/Results';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#ffffff', 
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
          loading: {
            icon: null,
          },
        }}
      />

      <Header />

      <main className="flex-grow w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/test/:topicId" element={<ProtectedRoute><Test /></ProtectedRoute>} />
          <Route path="/results/:topicId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;