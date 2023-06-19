import React from "react";

function GlowButton({
  type="button",
  children,
  onClick,
  disabled=false,
  padding = "py-1 px-2.5",
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`relative group ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } select-none`}>
      {!disabled && (
        <div className="absolute -inset-0 bg-purple rounded-lg group-hover:blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
      )}
      <div
        className={`${padding} relative ${
          disabled ? "bg-gray-600" : "bg-purple"
        } font-bold text-white rounded-lg`}>
        {children}
      </div>
    </button>
  );
}

export default GlowButton;
