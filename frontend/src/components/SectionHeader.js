import React from "react";

export const SectionHeader = ({ label, title, action, className = "" }) => {
  return (
    <div className={`flex items-end justify-between gap-4 ${className}`}>
      <div>
        {label && <div className="label-caps mb-2">{label}</div>}
        {title && (
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl tracking-[-0.01em] text-foreground">
            {title}
          </h2>
        )}
      </div>
      {action}
    </div>
  );
};
