import { useState } from 'react';
import Logo from '../ui/Logo';
import './ProductImage.css';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export default function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const shouldShowImage = Boolean(src) && !hasError;

  return (
    <div className={`product-image ${className}`}>
      {shouldShowImage ? (
        <img
          src={src ?? ''}
          alt={alt}
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="product-image__fallback" role="img" aria-label={`${alt} image unavailable`}>
          <Logo variant="red" showText={false} />
          <span>Freshly baked</span>
        </div>
      )}
    </div>
  );
}
