/**
 * Login Page
 * File: src/pages/Login.jsx
 * 
 * PURPOSE: Let users sign in with email + password
 * CONNECTS TO: authService.login() → backend /api/auth/login
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Login() {
  // NAVIGATION: useNavigate() lets us redirect after successful login
  const navigate = useNavigate();
  
  // AUTH: useAuth() gives us the login function from AuthContext
  const { login } = useAuth();
  
  // FORM STATE: Track what user types in email and password fields
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // ERROR STATE: Store error messages to show user
  const [error, setError] = useState('');
  
  // LOADING STATE: Show spinner/disable button while logging in
  const [loading, setLoading] = useState(false);

  // HANDLE INPUT CHANGES
  // When user types in any input field, update formData
  const handleChange = (e) => {
    setFormData({
      ...formData,                    // Keep other fields as they are
      [e.target.name]: e.target.value // Update only the changed field
    });
  };

  // HANDLE FORM SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload (default form behavior)
    
    // Clear any previous errors
    setError('');
    
    // Start loading state
    setLoading(true);
    
    try {
      // Call login from AuthContext
      // This sends email + password to backend
      await login(formData);
      
      // If we reach here, login succeeded
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      // If login fails, show error message
      // err.response.data.message comes from backend error response
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
      
    } finally {
      // Always stop loading, whether success or failure
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        
        {/* HEADER */}
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Sign in to APPE
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            A Plus Project Eco
          </p>
        </div>

        {/* LOGIN FORM */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            
            {/* EMAIL INPUT */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="student@university.edu"
              />
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* REGISTER LINK */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
