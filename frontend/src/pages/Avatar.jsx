import React, { useState } from "react";

const Avatar = ({ src, alt = "user", size = "w-24 h-24", name }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const displayLetter = name ? name.charAt(0).toUpperCase() : "U";

  return (
    <div
      className={`relative ${size} rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center bg-gray-100`}
    >
      {/* Fallback (first letter avatar) */}
      {(!src || imgError) && (
        <span className="text-gray-400 font-semibold text-lg">
          {displayLetter}
        </span>
      )}

      {/* Profile Image */}
      {src && !imgError && (
        <img
          src={src}
          alt={alt}
          className={`object-cover w-full h-full transition-opacity duration-700 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      )}

      {/* Subtle skeleton shimmer while loading */}
      {!imgLoaded && src && !imgError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}
    </div>
  );
};

export default Avatar;
