import React from 'react';
import { EmailIcon, WhatsAppIcon } from './ContactIcons';

interface ContactLinksProps {
  className?: string;
  showLabel?: boolean;
  labelText?: string;
  size?: 'xs' | 'sm' | 'base';
  layout?: 'horizontal' | 'vertical';
}

const ContactLinks: React.FC<ContactLinksProps> = ({ 
  className = '', 
  showLabel = false, 
  labelText = "Besoin d'aide ? Contactez-nous :",
  size = 'xs',
  layout = 'horizontal'
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base'
  };

  const layoutClasses = {
    horizontal: 'flex flex-col sm:flex-row items-center justify-center gap-3',
    vertical: 'flex flex-col items-center gap-2'
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {showLabel && (
        <span className={`${sizeClasses[size]} text-slate-500`}>
          {labelText}
        </span>
      )}
      <a 
        href="mailto:gnonlonfoun@ensetmasters.org" 
        className={`${sizeClasses[size]} text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1`}
      >
        <EmailIcon />
        gnonlonfoun@ensetmasters.org
      </a>
      <a 
        href="https://wa.me/22996113246" 
        target="_blank" 
        rel="noopener noreferrer"
        className={`${sizeClasses[size]} text-green-600 hover:text-green-800 transition-colors duration-200 flex items-center gap-1`}
      >
        <WhatsAppIcon />
        +229 01 96 11 32 46
      </a>
    </div>
  );
};

export default ContactLinks; 