import { ShoppingCart } from 'lucide-react';
import './MenuComponents.css';

interface AddToCartButtonProps {
  isLoading?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function AddToCartButton({ isLoading = false, onClick }: AddToCartButtonProps) {
  return (
    <button
      type="button"
      className="add-cart-button"
      onClick={onClick}
      disabled={isLoading}
      aria-label="Add item to cart"
    >
      <ShoppingCart size={18} />
      <span>{isLoading ? 'Adding' : 'Add'}</span>
    </button>
  );
}
