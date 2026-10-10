import { Routes, Route, Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Home from './pages/Home.jsx';
import Recipes from './pages/Recipes.jsx';
import RecipeDetails from './pages/RecipeDetails.jsx';
import RecipeForm from './pages/RecipeForm.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Favorites from './pages/Favorites.jsx';

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="nav">
      <Link to="/" className="brand">🍲 Recipe Share</Link>
      <nav>
        <NavLink to="/recipes">Recipes</NavLink>
        {user ? (
          <>
            <NavLink to="/recipes/new">Add Recipe</NavLink>
            <NavLink to="/favorites">Favorites</NavLink>
            <NavLink to="/profile">{user.name.split(' ')[0]}</NavLink>
            <button
              className="link-btn"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register" className="btn-sm">Sign up</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/new" element={<Protected><RecipeForm /></Protected>} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />
          <Route path="/recipes/:id/edit" element={<Protected><RecipeForm /></Protected>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/favorites" element={<Protected><Favorites /></Protected>} />
          <Route path="*" element={<p className="empty">Page not found.</p>} />
        </Routes>
      </main>
      <footer className="footer">Online Recipe Sharing Platform · MERN Stack</footer>
    </>
  );
}
