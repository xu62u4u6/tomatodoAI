
import React from 'react';

const Header: React.FC = () => {
    return (
        <nav className="w-full px-6 py-4 flex items-center justify-between z-20">
            {/* Left: Logo / Brand */}
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-zinc-900 flex items-center gap-2 font-serif">
                    <i className="fa-solid fa-fire text-theme opacity-70 text-xl"></i>
                    TomatodoAI
                </h1>
            </div>

            {/* Right: Nav Icons */}
            <div className="flex items-center gap-3">
                {/* Settings Button */}
                <button
                    className="p-2 rounded-md hover:bg-zinc-200/50 text-zinc-600 hover:text-zinc-900 transition-all duration-200"
                    title="Settings"
                >
                    <i className="fa-solid fa-gear text-theme opacity-70"></i>
                </button>
            </div>
        </nav>
    );
};

export default Header;
