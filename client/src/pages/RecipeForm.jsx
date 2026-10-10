import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { CATEGORIES, CUISINES } from './Recipes.jsx';

const empty = {
  title: '',
  description: '',
  ingredients: '',
  instructions: '',
  category: 'Dinner',
  cuisine: 'Indian',
  imageUrl: '',
};

export default function RecipeForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api(`/recipes/${id}`)
      .then((r) => {
        if (r.authorId?._id !== user._id) return navigate(`/recipes/${id}`);
        setForm({
          title: r.title,
          description: r.description || '',
          ingredients: r.ingredients.join('\n'),
          instructions: r.instructions.join('\n'),
          category: r.category,
          cuisine: r.cuisine,
          imageUrl: r.imageUrl || '',
        });
      })
      .catch((e) => setError(e.message));
  }, [id, user._id, navigate]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const saved = await api(id ? `/recipes/${id}` : '/recipes', {
        method: id ? 'PUT' : 'POST',
        body: form,
      });
      navigate(`/recipes/${saved._id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <h1>{id ? 'Edit recipe' : 'Add a recipe'}</h1>
      {error && <p className="error">{error}</p>}

      <label>Title
        <input required value={form.title} onChange={set('title')} maxLength={120} />
      </label>
      <label>Short description
        <textarea rows={2} value={form.description} onChange={set('description')} maxLength={1000} />
      </label>
      <div className="two-col">
        <label>Category
          <select value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Cuisine
          <select value={form.cuisine} onChange={set('cuisine')}>
            {CUISINES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <label>Image URL (optional)
        <input type="url" placeholder="https://…" value={form.imageUrl} onChange={set('imageUrl')} />
      </label>
      <label>Ingredients (one per line)
        <textarea required rows={6} value={form.ingredients} onChange={set('ingredients')} placeholder={'2 cups rice\n1 tsp salt'} />
      </label>
      <label>Instructions (one step per line)
        <textarea required rows={6} value={form.instructions} onChange={set('instructions')} placeholder={'Wash the rice\nBoil for 15 minutes'} />
      </label>
      <button disabled={saving}>{saving ? 'Saving…' : id ? 'Save changes' : 'Publish recipe'}</button>
    </form>
  );
}
