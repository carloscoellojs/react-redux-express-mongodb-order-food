import type { HeaderProps } from "../../types/types";

export const Header = ({
  title,
  subtitle,
  children,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
  variant = "primary",
  size = "md",
  centered = false,
  showDivider = false
}: HeaderProps) => {
  // Define variant classes
  const variantClasses = {
    primary: "text-gray-900",
    secondary: "text-gray-600",
    accent: "text-blue-600"
  };

  // Define size classes for title
  const titleSizeClasses = {
    sm: "text-xl md:text-2xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl"
  };

  // Define size classes for subtitle
  const subtitleSizeClasses = {
    sm: "text-sm md:text-base",
    md: "text-base md:text-lg",
    lg: "text-lg md:text-xl",
    xl: "text-xl md:text-2xl"
  };

  // Define spacing classes
  const spacingClasses = {
    sm: "mb-4",
    md: "mb-6",
    lg: "mb-8",
    xl: "mb-10"
  };

  return (
    <header
      className={`
        ${spacingClasses[size]} 
        ${centered ? "text-center" : ""} 
        ${className}
      `.trim()}
    >
      {title && (
        <h1
          className={`
            font-bold 
            ${titleSizeClasses[size]} 
            ${variantClasses[variant]} 
            ${subtitle ? "mb-2" : ""} 
            ${titleClassName}
          `.trim()}
        >
          {title}
        </h1>
      )}

      {subtitle && (
        <p
          className={`
            ${subtitleSizeClasses[size]} 
            text-gray-600 
            ${subtitleClassName}
          `.trim()}
        >
          {subtitle}
        </p>
      )}

      {children && <div className="mt-4">{children}</div>}

      {showDivider && <hr className="mt-6 border-gray-200" />}
    </header>
  );
};

export default Header;
