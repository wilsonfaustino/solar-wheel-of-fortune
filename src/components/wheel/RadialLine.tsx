import { memo } from "react";

interface RadialLineProps {
  isSelected: boolean;
}

function RadialLineComponent({ isSelected }: RadialLineProps) {
  return (
    <line
      x1="0"
      y1="0"
      x2="120"
      y2="0"
      stroke="white"
      strokeWidth="0.5"
      opacity={isSelected ? 0.6 : 0.12}
      style={{ transition: "opacity 0.3s ease" }}
    />
  );
}

export const RadialLine = memo(RadialLineComponent);
