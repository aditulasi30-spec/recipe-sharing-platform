import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import RecipeCard from '../components/RecipeCard.jsx';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api('/recipes').then((r) => setRecipes(r.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <h1>Share the recipes you love</h1>
        <p>Discover dishes from home cooks, and publish your own in minutes.</p>
        <form
          className="searchbar"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/recipes?search=${encodeURIComponent(q)}`);
          }}
        >
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or ingredient…" />
          <button>Search</button>
        </form>
      </section>

      <div className="row-head">
        <h2>Latest recipes</h2>
        <Link to="/recipes">View all →</Link>
      </div>
      {recipes.length ? (
        <div className="grid">{recipes.map((r) => <RecipeCard key={r._id} recipe={r} />)}</div>
      ) : (
        <p className="empty">No recipes yet. <Link to="/recipes/new">Add the first one!</Link></p>
      )}
    </>
  );
}
