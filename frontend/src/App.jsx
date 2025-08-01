// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Test from './pages/Test';
import Results from './pages/Results';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Toaster position="top-center" />
      <Header />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/test/:topicId" element={<ProtectedRoute><Test /></ProtectedRoute>} />
          <Route path="/results/:topicId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;