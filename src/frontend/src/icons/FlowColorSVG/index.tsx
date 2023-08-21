import React from 'react'

export const FlowColorSVG = ({ fill }: { fill: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill={fill} fillOpacity="0.7" />
    </svg>
  )
}
