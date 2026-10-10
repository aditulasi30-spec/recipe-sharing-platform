import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import RecipeCard from '../components/RecipeCard.jsx';

export default function Profile() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/recipes?author=${user._id}`)
      .then(setRecipes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user._id]);

  return (
    <>
      <section className="profile-head">
        <div className="avatar">{user.name[0].toUpperCase()}</div>
        <div>
          <h1>{user.name}</h1>
          <p className="by">{user.email}</p>
        </div>
      </section>
      <div className="row-head">
        <h2>My recipes ({recipes.length})</h2>
        <Link to="/recipes/new" className="btn">+ Add recipe</Link>
      </div>
      {loading ? (
        <p className="empty">Loading…</p>
      ) : recipes.length ? (
        <div className="grid">{recipes.map((r) => <RecipeCard key={r._id} recipe={r} />)}</div>
      ) : (
        <p className="empty">You haven't published any recipes yet.</p>
      )}
    </>
  );
}
