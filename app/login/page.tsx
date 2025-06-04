'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        // Pastikan session sudah terupdate sebelum redirect
        const session = await getSession();
        if (session) {
          router.push('/dashboard');
          router.refresh(); // Force refresh untuk memastikan session terupdate
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Login</h1>
      
      {error && (
        <div style={{ 
          color: 'red', 
          textAlign: 'center', 
          backgroundColor: '#fee', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              opacity: loading ? 0.6 : 1
            }}
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              opacity: loading ? 0.6 : 1
            }}
            placeholder="Enter your password"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{ 
            padding: '12px', 
            backgroundColor: loading ? '#ccc' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}