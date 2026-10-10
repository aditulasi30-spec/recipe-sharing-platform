import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { PLACEHOLDER, Stars } from '../components/RecipeCard.jsx';

export default function RecipeDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/recipes/${id}`).then(setRecipe).catch((e) => setError(e.message));
    api(`/recipes/${id}/comments`).then(setComments).catch(() => {});
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!recipe) return <p className="empty">Loading…</p>;

  const isOwner = user && recipe.authorId?._id === user._id;

  const rate = async (value) => {
    try {
      const updated = await api(`/recipes/${id}/rate`, { method: 'POST', body: { value } });
      setRecipe((r) => ({ ...r, ...updated, authorId: r.authorId, isFavorite: r.isFavorite }));
    } catch (e) {
      setError(e.message);
    }
  };

  const toggleFav = async () => {
    try {
      const { isFavorite } = await api(`/recipes/${id}/favorite`, { method: 'POST' });
      setRecipe((r) => ({ ...r, isFavorite }));
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this recipe permanently?')) return;
    try {
      await api(`/recipes/${id}`, { method: 'DELETE' });
      navigate('/recipes');
    } catch (e) {
      setError(e.message);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const c = await api(`/recipes/${id}/comments`, { method: 'POST', body: { comment: text } });
      setComments((cs) => [c, ...cs]);
      setText('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <article className="details">
      <img
        className="cover"
        src={recipe.imageUrl || PLACEHOLDER}
        alt={recipe.title}
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER;
        }}
      />
      <h1>{recipe.title}</h1>
      <p className="tags">
        <span>{recipe.category}</span>
        <span>{recipe.cuisine}</span>
      </p>
      <p className="by">
        by <Link to={isOwner ? '/profile' : '#'}>{recipe.authorId?.name || 'Unknown'}</Link> ·{' '}
        {new Date(recipe.createdAt).toLocaleDateString()}
      </p>
      <Stars value={recipe.averageRating} count={recipe.ratingCount} />
      {error && <p className="error">{error}</p>}
      {recipe.description && <p className="lead">{recipe.description}</p>}

      <div className="actions">
        {user && (
          <button onClick={toggleFav}>{recipe.isFavorite ? '♥ Saved' : '♡ Save recipe'}</button>
        )}
        {isOwner && (
          <>
            <Link className="btn" to={`/recipes/${id}/edit`}>Edit</Link>
            <button className="danger" onClick={remove}>Delete</button>
          </>
        )}
      </div>

      <div className="two-col">
        <section>
          <h2>Ingredients</h2>
          <ul>{recipe.ingredients.map((i, n) => <li key={n}>{i}</li>)}</ul>
        </section>
        <section>
          <h2>Instructions</h2>
          <ol>{recipe.instructions.map((s, n) => <li key={n}>{s}</li>)}</ol>
        </section>
      </div>

      {user && (
        <section>
          <h2>Rate this recipe</h2>
          <div className="rate">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                className={v <= recipe.myRating ? 'on' : ''}
                onClick={() => rate(v)}
                aria-label={`${v} stars`}
              >
                ★
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2>Comments ({comments.length})</h2>
        {user ? (
          <form className="comment-form" onSubmit={addComment}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your thoughts…" maxLength={500} />
            <button>Post</button>
          </form>
        ) : (
          <p className="hint"><Link to="/login">Log in</Link> to rate, save, and comment.</p>
        )}
        {comments.map((c) => (
          <div key={c._id} className="comment">
            <strong>{c.userId?.name || 'User'}</strong>
            <small> · {new Date(c.createdAt).toLocaleDateString()}</small>
            <p>{c.comment}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
