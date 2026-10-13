import React from 'react';

interface EcgHeartbeatBackgroundProps {
  className?: string;
  strokeColor?: string;
  opacity?: number;
  variant?: 'blue-teal' | 'red-pulse' | 'subtle-medical';
}

/**
 * Animated ECG Heartbeat Background Component
 * Renders an elegant, continuous, low-opacity medical heartbeat (ECG) waveform
 * suitable as a beautiful background for dashboards and headers.
 */
export const EcgHeartbeatBackground: React.FC<EcgHeartbeatBackgroundProps> = ({
  className = '',
  strokeColor,
  opacity = 0.12,
  variant = 'blue-teal',
}) => {
  // Determine gradient colors based on variant
  const getGradientStops = () => {
    if (variant === 'red-pulse') {
      return (
        <>
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
          <stop offset="25%" stopColor="#f43f5e" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#dc2626" stopOpacity="0.9" />
          <stop offset="75%" stopColor="#fb7185" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
        </>
      );
    }
    if (variant === 'subtle-medical') {
      return (
        <>
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
          <stop offset="40%" stopColor="#0d9488" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#059669" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.15" />
        </>
      );
    }
    // Default 'blue-teal'
    return (
      <>
        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.1" />
        <stop offset="20%" stopColor="#0ea5e9" stopOpacity="0.5" />
        <stop offset="45%" stopColor="#0d9488" stopOpacity="0.8" />
        <stop offset="65%" stopColor="#10b981" stopOpacity="0.75" />
        <stop offset="85%" stopColor="#06b6d4" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
      </>
    );
  };

  const gradientId = `ecg-grad-${variant}-${Math.random().toString(36).substring(2, 7)}`;
  const gridId = `ecg-grid-${Math.random().toString(36).substring(2, 7)}`;

  // Cardiac cycle waveform (P wave, PR segment, QRS complex spike, ST segment, T wave, isoelectric line)
  // Repeated rhythmically across 1600 units
  const ecgPath = 
    'M 0,110 ' +
    'L 100,110 ' +
    // Beat 1 (100 -> 360)
    'C 120,110 125,102 135,102 C 145,102 150,110 160,110 ' + // P-wave
    'L 190,110 ' + // PR interval
    'L 198,118 L 210,24 L 222,175 L 232,100 L 238,110 ' + // Q-R-S complex (R peak at 24)
    'L 260,110 ' + // ST segment
    'C 275,110 285,88 300,88 C 315,88 325,110 340,110 ' + // T-wave
    'L 480,110 ' + // Baseline
    // Beat 2 (480 -> 740)
    'C 500,110 505,102 515,102 C 525,102 530,110 540,110 ' + // P-wave
    'L 570,110 ' +
    'L 578,118 L 590,20 L 602,178 L 612,98 L 618,110 ' + // Q-R-S complex (R peak at 20)
    'L 640,110 ' +
    'C 655,110 665,86 680,86 C 695,86 705,110 720,110 ' + // T-wave
    'L 860,110 ' + // Baseline
    // Beat 3 (860 -> 1120)
    'C 880,110 885,102 895,102 C 905,102 910,110 920,110 ' + // P-wave
    'L 950,110 ' +
    'L 958,118 L 970,22 L 982,176 L 992,100 L 998,110 ' + // Q-R-S complex
    'L 1020,110 ' +
    'C 1035,110 1045,88 1060,88 C 1075,88 1085,110 1100,110 ' + // T-wave
    'L 1240,110 ' + // Baseline
    // Beat 4 (1240 -> 1500)
    'C 1260,110 1265,102 1275,102 C 1285,102 1290,110 1300,110 ' + // P-wave
    'L 1330,110 ' +
    'L 1338,118 L 1350,22 L 1362,176 L 1372,99 L 1378,110 ' + // Q-R-S complex
    'L 1400,110 ' +
    'C 1415,110 1425,87 1440,87 C 1455,87 1465,110 1480,110 ' + // T-wave
    'L 1600,110';

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 1600 220"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {getGradientStops()}
          </linearGradient>

          {/* Faint medical graph paper grid */}
          <pattern id={gridId} width="32" height="32" patternUnits="userSpaceOnUse">
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke={strokeColor || '#0284c7'}
              strokeWidth="0.5"
              strokeOpacity="0.1"
            />
          </pattern>
        </defs>

        {/* Medical Grid Background */}
        <rect width="100%" height="100%" fill={`url(#${gridId})`} />

        {/* Soft Isoelectric Baseline Reference */}
        <line
          x1="0"
          y1="110"
          x2="1600"
          y2="110"
          stroke={strokeColor || `url(#${gradientId})`}
          strokeWidth="0.8"
          strokeDasharray="6,4"
          strokeOpacity="0.25"
        />

        {/* Primary ECG Heartbeat Waveform */}
        <path
          d={ecgPath}
          stroke={strokeColor || `url(#${gradientId})`}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-1000"
        />

        {/* Subtle traveling glow / pulse nodes at cardiac peaks */}
        <circle
          cx="210"
          cy="24"
          r="3"
          fill={variant === 'red-pulse' ? '#ef4444' : '#10b981'}
          className="animate-ping"
          style={{ animationDuration: '3.5s', animationDelay: '0s' }}
        />
        <circle
          cx="590"
          cy="20"
          r="3"
          fill={variant === 'red-pulse' ? '#f43f5e' : '#0d9488'}
          className="animate-ping"
          style={{ animationDuration: '3.5s', animationDelay: '1s' }}
        />
        <circle
          cx="970"
          cy="22"
          r="3"
          fill={variant === 'red-pulse' ? '#ef4444' : '#0284c7'}
          className="animate-ping"
          style={{ animationDuration: '3.5s', animationDelay: '2s' }}
        />
        <circle
          cx="1350"
          cy="22"
          r="3"
          fill={variant === 'red-pulse' ? '#f43f5e' : '#10b981'}
          className="animate-ping"
          style={{ animationDuration: '3.5s', animationDelay: '2.8s' }}
        />
      </svg>
    </div>
  );
};
