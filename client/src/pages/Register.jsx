import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/recipes');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="form narrow" onSubmit={submit}>
      <h1>Create your account</h1>
      {error && <p className="error">{error}</p>}
      <label>Name
        <input required value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>Password (min 6 characters)
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button>Sign up</button>
      <p className="hint">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}
