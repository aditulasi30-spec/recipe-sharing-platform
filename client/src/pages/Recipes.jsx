import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import RecipeCard from '../components/RecipeCard.jsx';

export const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Beverage', 'Other'];
export const CUISINES = ['Indian', 'Italian', 'Chinese', 'Mexican', 'American', 'Mediterranean', 'Thai', 'Other'];

export default function Recipes() {
  const [params, setParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const cuisine = params.get('cuisine') || '';
  const [text, setText] = useState(search);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (category) qs.set('category', category);
    if (cuisine) qs.set('cuisine', cuisine);
    api(`/recipes?${qs}`)
      .then(setRecipes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, category, cuisine]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next);
  };

  return (
    <>
      <h1>Browse recipes</h1>
      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          update('search', text.trim());
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search name or ingredient…" />
        <select value={category} onChange={(e) => update('category', e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={cuisine} onChange={(e) => update('cuisine', e.target.value)}>
          <option value="">All cuisines</option>
          {CUISINES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button>Search</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="empty">Loading…</p>
      ) : recipes.length ? (
        <div className="grid">{recipes.map((r) => <RecipeCard key={r._id} recipe={r} />)}</div>
      ) : (
        <p className="empty">No recipes match your search.</p>
      )}
    </>
  );
}
