/**
 * Event Tracker System - Reusable Sidebar Component
 */

const SidebarComponent = {
    init() {
        const sidebarContainer = document.getElementById('sidebar-container');
        if (!sidebarContainer) return;

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        const menuItems = [
            { id: 'dashboard', label: 'Dashboard', icon: this.icons.dashboard, link: 'index.html' },
            { id: 'attendance', label: 'Attendance Monitoring', icon: this.icons.attendance, link: 'attendance_monitoring.html' },
            { id: 'events', label: 'Event Monitoring', icon: this.icons.events, link: 'event_monitoring.html' },
        ];

        const html = `
            <!-- Mobile Menu Overlay -->
            <div id="sidebar-overlay" class="fixed inset-0 bg-slate-900/50 z-40 hidden lg:hidden backdrop-blur-sm transition-opacity duration-300 opacity-0"></div>

            <!-- Sidebar -->
            <aside id="sidebar" class="fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-100 z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                
                <!-- Logo Section -->
                <div class="h-24 flex items-center px-8 border-b border-slate-50">
                    <div class="flex items-center space-x-3 group cursor-pointer">
                        <div class="w-10 h-10 bg-[#0061FF] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0061FF]/30 group-hover:scale-105 transition-transform">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                        </div>
                        <span class="text-2xl font-bold tracking-tight text-slate-900">Event Tracker</span>
                    </div>
                </div>

                <!-- Navigation Links -->
                <nav class="flex-grow px-6 mt-8 space-y-2 overflow-y-auto">
                    ${menuItems.map(item => `
                        <a href="${item.link}" 
                           class="flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${currentPage === item.link ? 'bg-[#0061FF] text-white shadow-md shadow-[#0061FF]/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}"
                           aria-label="${item.label}">
                            <div class="w-5 h-5 ${currentPage === item.link ? 'text-white' : 'text-slate-400 group-hover:text-[#0061FF] transition-colors'}">
                                ${item.icon}
                            </div>
                            <span class="text-[15px] ${currentPage === item.link ? 'font-semibold' : ''}">${item.label}</span>
                        </a>
                    `).join('')}
                </nav>

                <!-- Footer Section -->
                <div class="p-6 border-t border-slate-50">
                    <!-- Logout Button -->
                    <button id="logout-btn" 
                            class="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-slate-50 text-slate-600 font-medium hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all duration-200 group"
                            aria-label="Logout">
                        <div class="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors">
                            ${this.icons.logout}
                        </div>
                        <span class="text-[15px]">Logout</span>
                    </button>
                </div>
            </aside>
            
            <!-- Mobile Menu Button -->
            <button id="mobile-menu-btn" class="fixed top-6 left-6 z-50 p-3 bg-white text-[#155DFC] rounded-xl shadow-lg lg:hidden hover:bg-gray-50 active:scale-90 transition-all">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
        `;

        sidebarContainer.innerHTML = html;
        this.attachEventListeners();
    },

    attachEventListeners() {
        const logout = document.getElementById('logout-btn');
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (logout) {
            logout.onclick = () => {
                NotificationSystem.show("Logging out...", "info");
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            };
        }

        if (mobileBtn && sidebar && overlay) {
            mobileBtn.onclick = () => {
                sidebar.classList.toggle('-translate-x-full');
                overlay.classList.toggle('hidden');
                setTimeout(() => overlay.classList.toggle('opacity-0'), 10);
            };

            overlay.onclick = () => {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('opacity-0');
                setTimeout(() => overlay.classList.add('hidden'), 300);
            };
        }
    },

    icons: {
        dashboard: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>`,
        attendance: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>`,
        events: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`,
        moon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`,
        sun: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
        logout: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>`
    }
};

// Auto-initialize when the DOM is ready
window.addEventListener('DOMContentLoaded', () => SidebarComponent.init());
