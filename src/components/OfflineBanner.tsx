import React from 'react';
import { WifiOff, Wifi, CloudCheck, HardDrive } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
  cachedPatientsCount: number;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline, cachedPatientsCount }) => {
  if (isOnline) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-white px-4 py-2.5 shadow-md flex items-center justify-between transition-all">
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-100" />
          <span>
            <strong>Offline Mode Active:</strong> You are working without an internet connection.
          </span>
        </div>
        <div className="flex items-center gap-2 text-amber-100 bg-amber-600/40 px-3 py-1 rounded-full text-xs">
          <HardDrive className="w-3.5 h-3.5" />
          <span>Local Cache: {cachedPatientsCount} patient{cachedPatientsCount === 1 ? '' : 's'} available offline</span>
        </div>
      </div>
    </div>
  );
};
