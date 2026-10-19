import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Snip.ly Brand Logo & Badge Component
 * Neo-brutalist pop aesthetic matching the Snip.ly design system
 *
 * @param {'hero' | 'navbar' | 'auth' | 'banner' | 'icon-only'} variant
 * @param {boolean} asLink - whether to wrap in react-router Link
 * @param {string} className - extra classes
 */
export default function BrandLogo({
  variant = 'hero',
  asLink = true,
  className = '',
  subtitle = 'SNIP LONG LINKS IN A SNAP'
}) {
  // Scissor icon inside the neo-brutalist badge
  const renderBadge = (size = 'md') => {
    const sizeClasses = {
      sm: 'w-9 h-9 rounded-xl border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#0F172A]',
      md: 'w-12 h-12 rounded-2xl border-[3px] border-slate-900 shadow-[3.5px_4px_0px_#0F172A]',
      lg: 'w-18 h-18 sm:w-20 sm:h-20 rounded-[22px] border-[3.5px] border-slate-900 shadow-[4px_5px_0px_#0F172A]',
      xl: 'w-24 h-24 rounded-[28px] border-4 border-slate-900 shadow-[5px_6px_0px_#0F172A]',
    }[size] || 'w-12 h-12 rounded-2xl border-[3px] border-slate-900 shadow-[3.5px_4px_0px_#0F172A]';

    return (
      <div
        className={`${sizeClasses} bg-blue-600 flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95 select-none`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-[72%] h-[72%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Scissor Handles & Blades */}
          <circle cx="28" cy="68" r="13" stroke="#FFFFFF" strokeWidth="8.5" fill="none" />
          <circle cx="28" cy="28" r="13" stroke="#FFFFFF" strokeWidth="8.5" fill="none" />
          <path d="M37 36 L78 68" stroke="#FFFFFF" strokeWidth="8.5" strokeLinecap="round" />
          <path d="M37 60 L78 28" stroke="#FFFFFF" strokeWidth="8.5" strokeLinecap="round" />
          {/* Rivet */}
          <circle cx="48" cy="48" r="4.5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      </div>
    );
  };

  // 1. Icon Only
  if (variant === 'icon-only') {
    return renderBadge('md');
  }

  // 2. Navbar Variant: Compact & Clean
  if (variant === 'navbar') {
    const content = (
      <div className={`flex items-center gap-3 group ${className}`}>
        {renderBadge('sm')}
        <div className="flex flex-col text-left">
          <span className="text-xl font-black italic tracking-tight text-blue-600 dark:text-blue-500 uppercase leading-none transform -skew-x-3">
            SNIP.LY
          </span>
          <span className="text-[10px] font-bold tracking-[0.16em] text-slate-500 dark:text-slate-400 uppercase mt-0.5">
            FAST SHORTENER
          </span>
        </div>
      </div>
    );

    return asLink ? (
      <Link to="/" className="inline-block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    ) : content;
  }

  // 3. Auth Page Variant (Login / Register)
  if (variant === 'auth') {
    const content = (
      <div className={`flex flex-col items-center gap-3 text-center ${className}`}>
        {renderBadge('lg')}
        <div className="flex flex-col items-center">
          <span className="text-3xl font-black italic tracking-tight text-blue-600 dark:text-blue-500 uppercase leading-none transform -skew-x-3">
            SNIP.LY
          </span>
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase mt-1">
            {subtitle}
          </span>
        </div>
      </div>
    );

    return asLink ? (
      <Link to="/" className="inline-block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    ) : content;
  }

  // 4. Full Banner Variant (matches YouTube Roast header banner)
  if (variant === 'banner') {
    return (
      <div
        className={`w-full rounded-2xl bg-blue-600 border-2 sm:border-[3px] border-slate-900 shadow-[5px_6px_0px_#0F172A] p-4 sm:p-6 flex items-center gap-4 sm:gap-6 ${className}`}
      >
        <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-[22px] bg-white border-[3px] border-slate-900 shadow-[4px_5px_0px_#0F172A] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 100" className="w-[72%] h-[72%]" fill="none">
            <circle cx="28" cy="68" r="13" stroke="#2563EB" strokeWidth="8.5" fill="none" />
            <circle cx="28" cy="28" r="13" stroke="#2563EB" strokeWidth="8.5" fill="none" />
            <path d="M37 36 L78 68" stroke="#2563EB" strokeWidth="8.5" strokeLinecap="round" />
            <path d="M37 60 L78 28" stroke="#2563EB" strokeWidth="8.5" strokeLinecap="round" />
            <circle cx="48" cy="48" r="4.5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2" />
          </svg>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-3xl sm:text-4xl font-black italic tracking-tight text-white uppercase leading-none transform -skew-x-3">
            SNIP.LY
          </span>
          <span className="text-xs sm:text-sm font-extrabold tracking-[0.2em] text-blue-100 uppercase mt-1 sm:mt-1.5">
            {subtitle}
          </span>
        </div>
      </div>
    );
  }

  // 5. Default Hero Variant (for Homepage Header)
  const heroContent = (
    <div className={`flex items-center justify-center gap-4 sm:gap-5 ${className}`}>
      {renderBadge('lg')}
      <div className="flex flex-col text-left">
        <h1 className="text-4xl sm:text-5xl font-black italic tracking-tight text-blue-600 dark:text-blue-500 uppercase leading-none transform -skew-x-3 drop-shadow-sm">
          SNIP.LY
        </h1>
        <p className="text-xs sm:text-sm font-extrabold tracking-[0.22em] text-slate-600 dark:text-slate-400 uppercase mt-1.5 transform -skew-x-2">
          {subtitle}
        </p>
      </div>
    </div>
  );

  return asLink ? (
    <Link to="/" className="inline-block hover:opacity-95 transition-opacity">
      {heroContent}
    </Link>
  ) : (
    heroContent
  );
}
