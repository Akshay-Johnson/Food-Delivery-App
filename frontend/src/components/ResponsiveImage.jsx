function getWebpCandidate(src) {
  if (!src || typeof src !== "string") return src;
  if (src.startsWith("http")) return src;
  if (src.startsWith("data:")) return src;

  const queryIndex = src.indexOf("?");
  const basePath = queryIndex >= 0 ? src.slice(0, queryIndex) : src;
  const query = queryIndex >= 0 ? src.slice(queryIndex) : "";

  return basePath.replace(/\.(png|jpe?g)$/i, ".webp") + query;
}

export default function ResponsiveImage({
  src,
  alt = "",
  className = "",
  loading = "lazy",
  priority = false,
  sizes,
  fallbackSrc,
  ...props
}) {
  const webpSrc = getWebpCandidate(src);
  const resolvedFallback = fallbackSrc || src;

  if (!src) {
    return null;
  }

  return (
    <picture>
      {webpSrc && webpSrc !== src && (
        <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
      )}
      <img
        src={resolvedFallback}
        alt={alt}
        className={className}
        loading={priority ? "eager" : loading}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        sizes={sizes}
        {...props}
      />
    </picture>
  );
}