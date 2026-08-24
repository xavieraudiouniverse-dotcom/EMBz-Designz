import React, { useState } from "react";

const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'><rect width='100%' height='100%' fill='%23EFE6D8'/><text x='50%' y='50%' font-family='Georgia' font-size='20' fill='%236B5B52' text-anchor='middle' dominant-baseline='middle'>EMBZ</text></svg>`
  );

export const SmartImage = ({ src, alt, className = "", ...rest }) => {
  const [err, setErr] = useState(false);
  return (
    <img
      src={err || !src ? FALLBACK : src}
      alt={alt || "product"}
      loading="lazy"
      onError={() => setErr(true)}
      className={className}
      {...rest}
    />
  );
};
