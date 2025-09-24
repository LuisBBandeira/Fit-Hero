import React, { JSX } from 'react';

interface FalloutIconProps {
  type: 'flame' | 'lightning' | 'rocket' | 'controller' | 'sword' | 'tube' | 'star' | 'target' | 'lock' | 'gear';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  className?: string;
  animate?: 'glitch' | 'flicker' | 'pulse' | 'scan' | 'corrupt' | 'static' | 'drift' | 'spark';
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16',
  '3xl': 'w-20 h-20',
  '4xl': 'w-24 h-24',
  '5xl': 'w-32 h-32',
  '6xl': 'w-40 h-40'
};

const animationMap = {
  glitch: 'fallout-glitch',
  flicker: 'fallout-flicker',
  pulse: 'fallout-pulse',
  scan: 'fallout-scan',
  corrupt: 'fallout-corrupt',
  static: 'fallout-static',
  drift: 'fallout-drift',
  spark: 'fallout-spark'
};

export const FalloutIcon: React.FC<FalloutIconProps> = ({ 
  type, 
  size = 'md', 
  className = '', 
  animate = 'glitch' 
}) => {
  const sizeClass = sizeMap[size];
  const animationClass = animationMap[animate];
  const uniqueId = `${type}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`fallout-icon-container ${sizeClass} ${className}`}>
      <div className={`fallout-icon ${animationClass}`}>
        <svg
          className="w-full h-full fallout-svg"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Simple glow filter */}
            <filter id={`glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>

            {/* Simple neon gradient */}
            <linearGradient id={`neon-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00ff41"/>
              <stop offset="100%" stopColor="#00cc33"/>
            </linearGradient>

            {/* Animation path for spark effect */}
            <path id={`sparkPath-${uniqueId}`} d="M12,2 Q18,8 12,12 Q6,8 12,2" stroke="none" fill="none"/>
          </defs>
          {renderIconPath(type, uniqueId)}
          
          {/* Animated spark particles for enhanced effects */}
          {animate === 'spark' && (
            <>
              <circle r="1" fill="#00ff41" opacity="0.8">
                <animateMotion dur="2s" repeatCount="indefinite">
                  <mpath href={`#sparkPath-${uniqueId}`}/>
                </animateMotion>
                <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle r="0.5" fill="#ffffff" opacity="0.6">
                <animateMotion dur="1.5s" repeatCount="indefinite" begin="0.3s">
                  <mpath href={`#sparkPath-${uniqueId}`}/>
                </animateMotion>
                <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
              </circle>
            </>
          )}
        </svg>
        
        {/* Simplified overlay effects - only scanlines */}
        <div className="fallout-scanlines"></div>
      </div>
    </div>
  );
};

function getIconFileName(type: string): string {
  const fileMap: Record<string, string> = {
    flame: 'flame-.svg',
    lightning: 'light-bolt.svg',
    rocket: 'rocket-launch.svg',
    controller: 'video-game-controller.svg',
    sword: 'crossed-swords.svg',
    tube: 'test-tube.svg',
    star: 'star.svg',
    target: 'target.svg',
    lock: 'lock-alt.svg',
    gear: 'gear.svg'
  };
  return fileMap[type] || 'flame-.svg';
}

function renderIconPath(type: string, uniqueId: string): JSX.Element {
  const fillColor = `url(#neon-${uniqueId})`;
  const glowFilter = `url(#glow-${uniqueId})`;

  switch (type) {
    case 'flame':
      return (
        <g>
          <path 
            d="M12 2C8.5 2 5.5 5 5.5 8.5c0 2.5 2 4.5 4.5 6.5L12 22l2-7c2.5-2 4.5-4 4.5-6.5C18.5 5 15.5 2 12 2z"
            fill="#00ff41"
            fillOpacity="0.4"
            stroke="#00ff41"
            strokeWidth="2"
            filter={glowFilter}
          />
          <path 
            d="M12 4C9.5 4 7.5 6 7.5 8.5c0 1.5 1 3 2.5 4.5L12 18l2-5c1.5-1.5 2.5-3 2.5-4.5C16.5 6 14.5 4 12 4z"
            fill="#66ff66"
            fillOpacity="0.6"
          />
        </g>
      );
    case 'lightning':
      return (
        <g>
          <path 
            d="M13 2L8 9h3l-2 11 8-11h-3l3-7z"
            fill="#00ff41"
            stroke="#00ff41"
            strokeWidth="1"
            strokeLinejoin="round"
            filter={glowFilter}
          />
          <path 
            d="M13 2L8 9h3l-2 11 8-11h-3l3-7z"
            fill="none"
            stroke="#66ff66"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        </g>
      );
    case 'rocket':
      return (
        <g>
          <path 
            d="M12 2L8 6V14L12 18L16 14V6L12 2Z"
            fill="none"
            stroke="#00ff41"
            strokeWidth="2"
            filter={glowFilter}
          />
          <circle cx="12" cy="8" r="2" fill="none" stroke="#00ff41" strokeWidth="1.5" />
          <path d="M8 18L6 22L10 20L12 22L14 20L18 22L16 18" fill="none" stroke="#00ff41" strokeWidth="1.5" />
        </g>
      );
    case 'controller':
      return (
        <g>
          <rect x="4" y="8" width="16" height="8" rx="4" fill="none" stroke="#00ff41" strokeWidth="2" filter={glowFilter} />
          <circle cx="7" cy="11" r="1" fill="#00ff41" />
          <circle cx="17" cy="11" r="1" fill="#00ff41" />
          <circle cx="15" cy="9" r="0.5" fill="#00ff41" />
          <circle cx="17" cy="9" r="0.5" fill="#00ff41" />
          <path d="M2 10L4 8" stroke="#00ff41" strokeWidth="2" />
          <path d="M2 14L4 16" stroke="#00ff41" strokeWidth="2" />
          <path d="M22 10L20 8" stroke="#00ff41" strokeWidth="2" />
          <path d="M22 14L20 16" stroke="#00ff41" strokeWidth="2" />
        </g>
      );
    case 'sword':
      return (
        <g>
          <path d="M20 2L15 7L17 9L22 4L20 2Z" fill="none" stroke="#00ff41" strokeWidth="2" filter={glowFilter}/>
          <path d="M15 7L2 20L4 22L17 9L15 7Z" fill="none" stroke="#00ff41" strokeWidth="2" filter={glowFilter}/>
          <path d="M7 13L11 17L9 19L5 15L7 13Z" fill="none" stroke="#00ff41" strokeWidth="1.5" filter={glowFilter}/>
        </g>
      );
    case 'tube':
      return (
        <g>
          <rect x="8" y="2" width="8" height="18" rx="1" fill="none" stroke="#00ff41" strokeWidth="2" filter={glowFilter}/>
          <rect x="9" y="3" width="6" height="16" rx="0.5" fill="#00ff41" fillOpacity="0.3"/>
          <circle cx="12" cy="6" r="2" fill="#00ff41"/>
          <rect x="10.5" y="8" width="3" height="10" rx="0.5" fill="#00ff41" fillOpacity="0.6"/>
          <circle cx="12" cy="18" r="1" fill="#00ff41"/>
        </g>
      );
    case 'star':
      return (
        <path 
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="none"
          stroke="#00ff41"
          strokeWidth="2"
          filter={glowFilter}
        />
      );
    case 'target':
      return (
        <g fill="none" stroke="#00ff41" strokeWidth="2" filter={glowFilter}>
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </g>
      );
    case 'lock':
      return (
        <g>
          <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="#00ff41" strokeWidth="2" filter={glowFilter}/>
          <path d="M9 11V7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7V11" fill="none" stroke="#00ff41" strokeWidth="2"/>
          <circle cx="12" cy="16" r="1" fill="#00ff41"/>
        </g>
      );
    case 'gear':
      return (
        <path 
          d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5A3.5 3.5 0 0 1 15.5 12A3.5 3.5 0 0 1 12 15.5M19.43 12.98C19.47 12.66 19.5 12.34 19.5 12C19.5 11.66 19.47 11.34 19.43 11.02L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.22 8.95 2.27 9.22 2.46 9.37L4.57 11.02C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.66 4.57 12.98L2.46 14.63C2.27 14.78 2.22 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.94C7.96 18.34 8.52 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.98Z"
          fill="none"
          stroke="#00ff41"
          strokeWidth="2"
          filter={glowFilter}
        />
      );
    default:
      return (
        <circle 
          cx="12" 
          cy="12" 
          r="8" 
          fill="none"
          stroke="#00ff41"
          strokeWidth="2"
          filter={glowFilter}
        />
      );
  }
}

export default FalloutIcon;
