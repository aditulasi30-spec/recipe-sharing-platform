import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/recipes');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="form narrow" onSubmit={submit}>
      <h1>Welcome back</h1>
      {error && <p className="error">{error}</p>}
      <label>Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>Password
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button>Log in</button>
      <p className="hint">New here? <Link to="/register">Create an account</Link></p>
    </form>
  );
}
