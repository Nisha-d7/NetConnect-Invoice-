'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role'); // 'customer' or 'staff'

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect based on user role
        if (data.user.role === 'staff') {
          router.push('/staff/dashboard');
        } else if (data.user.role === 'customer') {
          router.push('/customer/invoices');
        } else {
          router.push('/dashboard'); // fallback
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-xl mb-4">Login ({role})</h1>
      <input
        className="w-full border p-2 mb-2"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        className="w-full border p-2 mb-4"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white p-2 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </div>
  );
}
