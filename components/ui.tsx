import Image from "next/image";

/** Product/brand image. SVG placeholders are served as-is; real photos (jpg/png/webp) are optimised. */
export function Img({
  src,
  alt,
  sizes = "(max-width: 700px) 50vw, 25vw",
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={1000}
      sizes={sizes}
      priority={priority}
      className={className}
      unoptimized={src.endsWith(".svg")}
    />
  );
}

export function Price({ was, now }: { was?: number; now: number }) {
  return (
    <span className="price">
      {was !== undefined && was > now && (
        <>
          <span className="sr-only">Normal price </span>
          <s className="price-was">AED {was}</s>
          <span className="sr-only">, now </span>
        </>
      )}
      AED {now}
    </span>
  );
}
