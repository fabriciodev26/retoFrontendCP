import { useState } from "react";

interface MovieImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function MovieImage({ src, alt, className = "" }: MovieImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div className={`relative bg-cp-gray-light ${className}`}>
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-cp-gray-light rounded-[inherit]" />
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-cp-gray-light rounded-[inherit]">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
