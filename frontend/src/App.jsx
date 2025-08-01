// src/App.jsx

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
    // Yeh classes footer ko hamesha neeche rakhne ke liye aur dark theme ke liye hain
    <div className="flex flex-col min-h-screen bg-[#0a0518] text-slate-200 font-sans">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b', // slate-800
            color: '#e2e8f0',     // slate-200
            border: '1px solid #334155', // slate-700
          },
        }}
      />

      <Header />

      {/* flex-grow bachi hui saari jagah le lega, taaki footer neeche rahe */}
      <main className="flex-grow w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/test/:topicId" element={<ProtectedRoute><Test /></ProtectedRoute>} />
          <Route path="/results/:topicId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        </Routes>
      </main>

      {/* Footer ab hamesha neeche rahega */}
      <Footer />
    </div>
  );
}

export default App;