import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Theme-aware Card component
export function ThemeCard({ 
  children, 
  className = '', 
  hover = true,
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  [key: string]: any;
}) {
  return (
    <div 
      className={`theme-card rounded-lg p-6 theme-transition ${
        hover ? 'hover:shadow-theme-md' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Theme-aware Button component
export function ThemeButton({ 
  children, 
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props 
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'theme-button-primary',
    secondary: 'theme-button-secondary',
    outline: 'border theme-border theme-text-primary hover:theme-bg-secondary',
    ghost: 'theme-text-primary hover:theme-bg-secondary'
  };

  return (
    <button
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        rounded-lg font-medium theme-transition theme-focus-visible
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Theme-aware Input component
export function ThemeInput({ 
  className = '',
  error = false,
  ...props 
}: {
  className?: string;
  error?: boolean;
  [key: string]: any;
}) {
  return (
    <input
      className={`
        theme-input rounded-lg px-4 py-2 theme-transition theme-focus-visible
        ${error ? 'border-red-500 focus:border-red-500' : ''}
        ${className}
      `}
      {...props}
    />
  );
}

// Theme-aware Select component
export function ThemeSelect({ 
  children,
  className = '',
  error = false,
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  error?: boolean;
  [key: string]: any;
}) {
  return (
    <select
      className={`
        theme-input rounded-lg px-4 py-2 theme-transition theme-focus-visible
        ${error ? 'border-red-500 focus:border-red-500' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
}

// Theme-aware Textarea component
export function ThemeTextarea({ 
  className = '',
  error = false,
  ...props 
}: {
  className?: string;
  error?: boolean;
  [key: string]: any;
}) {
  return (
    <textarea
      className={`
        theme-input rounded-lg px-4 py-2 theme-transition theme-focus-visible resize-none
        ${error ? 'border-red-500 focus:border-red-500' : ''}
        ${className}
      `}
      {...props}
    />
  );
}

// Theme-aware Badge component
export function ThemeBadge({ 
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    default: 'theme-bg-secondary theme-text-primary',
    success: 'theme-success-bg',
    warning: 'theme-warning-bg',
    error: 'theme-error-bg',
    info: 'theme-info-bg'
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// Theme-aware Modal component
export function ThemeModal({ 
  isOpen,
  onClose,
  children,
  title,
  className = ''
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/70 theme-transition"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative theme-card max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto
        ${className}
      `}>
        {title && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b theme-border">
            <h2 className="text-lg font-semibold theme-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="theme-text-secondary hover:theme-text-primary theme-transition"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}