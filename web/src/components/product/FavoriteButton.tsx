import { Heart } from 'lucide-react';
import { useFavorites } from '../../shared/hooks/FavoritesContext';
import './FavoriteButton.css';

interface FavoriteButtonProps {
  productId: number;
  size?: number;
  className?: string;
}

export default function FavoriteButton({ productId, size = 18, className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(productId);

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    await toggleFavorite(productId);
  }

  return (
    <button
      type="button"
      className={`fav-btn ${favorited ? 'fav-btn--active' : ''} ${className}`}
      onClick={handleClick}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={size}
        className="fav-btn__icon"
        fill={favorited ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
    </button>
  );
}
