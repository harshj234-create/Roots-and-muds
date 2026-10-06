import Image from "next/image";

/** Any image. Local photos and Shopify photos are resized and compressed automatically; SVGs are served as-is. */
export function Img({
  src,
  alt,
  sizes = "(max-width: 700px) 50vw, 25vw",
  priority,
  className,
  width = 800,
  height = 800,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      unoptimized={src.endsWith(".svg")}
    />
  );
}

/** Product photo on a tile tinted with the product's colour. White studio backgrounds blend into the tint. */
export function Tile({
  src,
  alt,
  tint,
  hoverSrc,
  sizes,
  priority,
  className = "",
}: {
  src: string;
  alt: string;
  tint?: string;
  hoverSrc?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`ph ${className}`} style={tint ? ({ "--tint": tint } as React.CSSProperties) : undefined}>
      <Img src={src} alt={alt} sizes={sizes} priority={priority} />
      {hoverSrc && <Img src={hoverSrc} alt="" sizes={sizes} className="alt" />}
    </div>
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

/** Light tint of a product colour for tile backgrounds. */
export function soft(hex?: string, amount = 0.38) {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return "#fff1e3";
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c * amount + 255 * (1 - amount));
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(mix);
  return `rgb(${r} ${g} ${b})`;
}
