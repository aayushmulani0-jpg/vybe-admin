import { Bell, Search, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 border-b border-vybe-glassBorder bg-vybe-surface/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
      
      {/* Left side: Mobile menu & Breadcrumbs (Placeholder) */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-gray-400 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-medium text-white hidden sm:block">
          Overview
        </h2>
      </div>

      {/* Right side: Search & Actions */}
      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-vybe-neon transition-colors" />
          <input 
            type="text"
            placeholder="Search orders, products..."
            className="bg-vybe-dark border border-vybe-glassBorder rounded-full py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-vybe-neon focus:ring-1 focus:ring-vybe-neon/50 w-64 transition-all"
          />
        </div>

        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-vybe-neon rounded-full shadow-[0_0_5px_rgba(163,255,18,0.8)]"></span>
        </button>
      </div>
    </header>
  );
}
