import type { SpinnerProps } from "../../types/types";

export const Spinner = ({
  message,
  size = "md",
  color = "blue"
}: SpinnerProps) => {
  // Size configurations
  const sizeConfig = {
    sm: { spinner: "h-4 w-4", text: "text-xs" },
    md: { spinner: "h-8 w-8", text: "text-sm" },
    lg: { spinner: "h-12 w-12", text: "text-base" },
    xl: { spinner: "h-16 w-16", text: "text-lg" }
  };

  // Color configurations
  const colorConfig = {
    blue: {
      spinner: "text-blue-600",
      glow: "bg-blue-400",
      text: "text-blue-700"
    },
    green: {
      spinner: "text-green-600",
      glow: "bg-green-400",
      text: "text-green-700"
    },
    white: {
      spinner: "text-white",
      glow: "bg-white",
      text: "text-white"
    },
    gray: {
      spinner: "text-gray-600",
      glow: "bg-gray-400",
      text: "text-gray-700"
    }
  };

  const { spinner: spinnerSize, text: textSize } = sizeConfig[size];
  const {
    spinner: spinnerColor,
    glow: glowColor,
    text: textColor
  } = colorConfig[color];

  return (
    <div className="flex items-center justify-center">
      {message && (
        <span
          className={`${textColor} ${textSize} font-medium animate-pulse mr-3`}
        >
          {message}
        </span>
      )}
      <div className="relative">
        <svg
          className={`animate-spin ${spinnerSize} ${spinnerColor}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.5"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {/* Subtle pulsing glow effect */}
        <div
          className={`absolute inset-0 ${spinnerSize} rounded-full ${glowColor} opacity-20 animate-ping`}
        ></div>
      </div>
    </div>
  );
};
