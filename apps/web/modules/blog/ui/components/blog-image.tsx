import Image from "next/image"

type BlogImageProps = {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  sizes?: string
  className?: string
}

/**
 * Local `/blog/…` files use `next/image`.
 * Convex storage and other `https` URLs use `img`, including the card `fill` frame.
 */
export function BlogImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  sizes,
  className,
}: BlogImageProps) {
  if (src.startsWith("https://")) {
    const remoteClassName = fill
      ? ["absolute inset-0 size-full", className].filter(Boolean).join(" ")
      : className

    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote hosts stay off the image optimizer
      <img src={src} alt={alt} className={remoteClassName} />
    )
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes ?? "(min-width: 1024px) 480px, 100vw"}
        className={className}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 1200}
      height={height ?? 900}
      priority={priority}
      sizes={sizes ?? "(min-width: 1024px) 720px, 100vw"}
      className={className}
    />
  )
}
