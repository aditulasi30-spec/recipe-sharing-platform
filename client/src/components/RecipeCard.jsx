import { Link } from 'react-router-dom';

export const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="#fde8d4"/><text x="50%" y="52%" font-size="64" text-anchor="middle">🍽️</text></svg>'
  );

export function Stars({ value = 0, count }) {
  const full = Math.round(value);
  return (
    <span className="stars" title={`${value} / 5`}>
      {'★'.repeat(full)}
      <span className="dim">{'★'.repeat(5 - full)}</span>
      {count !== undefined && <small> ({count})</small>}
    </span>
  );
}

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipes/${recipe._id}`} className="card">
      <img
        src={recipe.imageUrl || PLACEHOLDER}
        alt={recipe.title}
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER;
        }}
      />
      <div className="card-body">
        <h3>{recipe.title}</h3>
        <p className="tags">
          <span>{recipe.category}</span>
          <span>{recipe.cuisine}</span>
        </p>
        <Stars value={recipe.averageRating} count={recipe.ratingCount} />
        {recipe.authorId?.name && <p className="by">by {recipe.authorId.name}</p>}
      </div>
    </Link>
  );
}
