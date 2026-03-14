

import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      alert('Login failed 😒');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-md border border-white/20">
        <h1 className="text-5xl font-bold text-white text-center mb-8"> TaskMaster</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" placeholder="Email" required value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-6 py-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/50 text-lg" />
          <input type="password" placeholder="Password" required value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-6 py-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/50 text-lg" />
          <button className="w-full bg-white text-purple-600 font-bold py-4 rounded-xl text-xl hover:bg-gray-100 transform hover:scale-105 transition duration-300">
            Login
          </button>
        </form>
        <p className="text-center mt-6 text-white">
          No account? <Link to="/register" className="underline font-bold">Register here</Link>
        </p>
      </div>
    </div>
  );
}