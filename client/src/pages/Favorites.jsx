import { useEffect, useState } from 'react';
import { api } from '../api.js';
import RecipeCard from '../components/RecipeCard.jsx';

export default function Favorites() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/users/me/favorites')
      .then(setRecipes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1>Saved recipes</h1>
      {loading ? (
        <p className="empty">Loading…</p>
      ) : recipes.length ? (
        <div className="grid">{recipes.map((r) => <RecipeCard key={r._id} recipe={r} />)}</div>
      ) : (
        <p className="empty">Nothing saved yet. Tap “Save recipe” on any recipe page.</p>
      )}
    </>
  );
}
