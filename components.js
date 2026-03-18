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
            <aside id="sidebar" class="fixed left-0 top-0 h-screen w-72 bg-[#155DFC] text-white flex flex-col transition-all duration-300 z-50 transform -translate-x-full lg:translate-x-0 shadow-2xl overflow-hidden">
                <!-- Logo Header -->
                <div class="p-8 flex items-center space-x-3">
                    <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-800/20">
                        <svg class="w-6 h-6 text-[#155DFC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <span class="text-2xl font-black tracking-tighter uppercase text-white">Tracker</span>
                </div>

                <!-- Navigation Links -->
                <nav class="flex-grow px-4 mt-6 space-y-2 overflow-y-auto">
                    ${menuItems.map(item => `
                        <a href="${item.link}" 
                           class="flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-200 group hover:bg-white/10 ${currentPage === item.link ? 'bg-white text-[#155DFC] font-bold shadow-xl shadow-blue-900/10' : 'text-white/90 hover:text-white'}"
                           aria-label="${item.label}">
                            <div class="w-6 h-6 ${currentPage === item.link ? 'text-[#155DFC]' : 'text-white/80 group-hover:text-white transition-colors'}">
                                ${item.icon}
                            </div>
                            <span class="text-sm font-semibold tracking-tight">${item.label}</span>
                        </a>
                    `).join('')}
                </nav>

                <!-- Footer Section -->
                <div class="p-6 space-y-4 bg-blue-700/20 backdrop-blur-md">
                    <!-- Dark Mode Toggle -->
                    <div class="flex items-center justify-between px-6 py-4 rounded-2xl bg-white/10">
                        <div class="flex items-center space-x-4">
                            <div id="dark-mode-icon" class="text-white">
                                ${this.icons.moon}
                            </div>
                            <span class="text-sm font-bold tracking-tight text-white">Dark Mode</span>
                        </div>
                        <button id="dark-mode-toggle" 
                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/20"
                                role="switch" aria-checked="false">
                            <span class="sr-only">Toggle Dark Mode</span>
                            <span id="dark-mode-dot" class="inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 translate-x-1"></span>
                        </button>
                    </div>

                    <!-- Logout Button -->
                    <button id="logout-btn" 
                            class="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl bg-white text-[#155DFC] font-black shadow-xl hover:bg-gray-50 active:scale-95 transition-all duration-200"
                            aria-label="Logout">
                        <div class="w-5 h-5">
                            ${this.icons.logout}
                        </div>
                        <span class="text-sm uppercase tracking-widest">Logout</span>
                    </button>
                </div>
            </aside>

            <!-- Mobile Toggle Overlay -->
            <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 hidden lg:hidden transition-opacity duration-300 opacity-0"></div>
            
            <!-- Mobile Menu Button -->
            <button id="mobile-menu-btn" class="fixed top-6 left-6 z-50 p-3 bg-white text-[#155DFC] rounded-xl shadow-lg lg:hidden hover:bg-gray-50 active:scale-90 transition-all">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
        `;

        sidebarContainer.innerHTML = html;
        this.attachEventListeners();
        this.updateDarkModeState();
    },

    attachEventListeners() {
        const toggle = document.getElementById('dark-mode-toggle');
        const logout = document.getElementById('logout-btn');
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (toggle) {
            toggle.onclick = () => this.toggleDarkMode();
        }

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

    toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
        this.updateDarkModeState();
        
        // Haptic Feedback
        if ('vibrate' in navigator) window.navigator.vibrate(20);
        
        NotificationSystem.show(isDark ? "Dark Mode Enabled" : "Light Mode Enabled", "info");
    },

    updateDarkModeState() {
        const isDark = document.documentElement.classList.contains('dark');
        const toggle = document.getElementById('dark-mode-toggle');
        const dot = document.getElementById('dark-mode-dot');
        const iconContainer = document.getElementById('dark-mode-icon');

        if (toggle && dot) {
            toggle.classList.toggle('bg-blue-600', isDark);
            toggle.classList.toggle('bg-white/20', !isDark);
            toggle.setAttribute('aria-checked', isDark);
            dot.classList.toggle('translate-x-6', isDark);
            dot.classList.toggle('translate-x-1', !isDark);
        }

        if (iconContainer) {
            iconContainer.innerHTML = isDark ? this.icons.sun : this.icons.moon;
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
