import React from "react";
import { Loader2 } from "lucide-react";
import type { ButtonProps } from "../../types";

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  children,
  onClick,
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-github-accent hover:bg-blue-600 text-white focus:ring-github-accent",
    secondary:
      "bg-gray-100 hover:bg-gray-200 dark:bg-github-surface dark:hover:bg-github-border text-gray-900 dark:text-github-text focus:ring-gray-500",
    outline:
      "border border-gray-300 dark:border-github-border bg-transparent hover:bg-gray-50 dark:hover:bg-github-surface text-gray-900 dark:text-github-text focus:ring-gray-500",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-github-surface text-gray-900 dark:text-github-text focus:ring-gray-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
