import React, { useState } from "react";

const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%230A0B14'/><stop offset='1' stop-color='%23141726'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><text x='50%' y='50%' font-family='Arial' font-size='34' fill='%2300E5FF' text-anchor='middle' dominant-baseline='middle' letter-spacing='4'>EMBZ</text></svg>`
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
