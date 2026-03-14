/**
 * Register Page
 * File: src/pages/Register.jsx
 *
 * PURPOSE: Let new users create an APPE account
 * CONNECTS TO: authService.register() → backend /api/auth/register
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // FORM STATE
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // SIMPLE FRONTEND VALIDATION
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Build payload for backend
      // Adjust field names if your backend expects different keys
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        institution: formData.institution || undefined
      };

      await register(payload);

      // On success go to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Please check your details and try again.'
      );
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* HEADER */}
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create your APPE account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            A Plus Project Eco
          </p>
        </div>

        {/* FORM */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* NAME */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Diamond Chizota"
              />
            </div>

            {/* EMAIL */}
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

            {/* INSTITUTION (OPTIONAL) */}
            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                Institution (optional)
              </label>
              <input
                id="institution"
                name="institution"
                type="text"
                value={formData.institution}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="University of Ghana"
              />
            </div>

            {/* PASSWORD */}
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

            {/* CONFIRM PASSWORD */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          {/* LOGIN LINK */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
