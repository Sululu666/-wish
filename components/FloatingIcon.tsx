import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FloatingIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  delay?: string;
}

const FloatingIcon: React.FC<FloatingIconProps> = ({ icon: Icon, size = 24, className = '', delay = '0s' }) => {
  return (
    <div 
      className={`absolute opacity-70 animate-float ${className}`}
      style={{ animationDelay: delay }}
    >
      <Icon size={size} className="text-white/60 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
    </div>
  );
};

export default FloatingIcon;
