/**
 * Image Optimization Component
 *
 * Provides lazy loading, responsive images, and placeholder support
 */

import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  className,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Default blur placeholder
  const defaultBlurDataURL =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=';

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {placeholder === 'blur' && !isLoaded && !hasError && (
        <div
          className="absolute inset-0 animate-pulse bg-cover bg-center blur-sm"
          style={{
            backgroundImage: `url(${blurDataURL || defaultBlurDataURL})`,
          }}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">Failed to load</span>
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
}

/**
 * Avatar with optimized loading
 */
interface OptimizedAvatarProps {
  src?: string;
  alt: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function OptimizedAvatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
}: OptimizedAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground',
          sizeClasses[size],
          className
        )}
      >
        {fallback}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority
      className={cn('rounded-full', sizeClasses[size], className)}
      onError={() => setHasError(true)}
    />
  );
}

/**
 * Background image with lazy loading
 */
interface LazyBackgroundProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
}

export function LazyBackground({ src, className, children }: LazyBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [isInView, src]);

  return (
    <div
      ref={ref}
      className={cn(
        'bg-cover bg-center transition-opacity duration-500',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : undefined,
      }}
    >
      {children}
    </div>
  );
}
