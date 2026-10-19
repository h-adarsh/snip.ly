import BrandLogo from './BrandLogo';

export default function Navbar({ onLogout, totalLinks = 0, totalClicks = 0, theme = 'light', onToggleTheme }) {
  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <BrandLogo variant="navbar" />
          
          {totalLinks > 0 && (
            <div className="flex gap-4 text-sm">
              <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
                {totalLinks} {totalLinks === 1 ? 'link' : 'links'}
              </div>
              <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-medium">
                {totalClicks} {totalClicks === 1 ? 'click' : 'clicks'}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="text-sm px-3 py-2 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={onLogout}
            className="text-sm px-4 py-2 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}