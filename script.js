const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwbmaD00ynKEaLOCQ6qrLDlniN8e1eNhAPxrBz98VB2dbsbw4RJ-JHsR9tS7e38l3kn/exec";
const SECRET_KEY = "1TAgdSVNyGFQ9sU_g8uqjpBg5Jkt_XXIxFGGw9OpPOR4E_QjF1h13K3sK";

/**
 * Global Theme Helper - Enables transitions after initial load
 */
(function initThemeTransitions() {
    window.addEventListener('DOMContentLoaded', () => {
        // Delay adding transitions to prevent flash on load
        setTimeout(() => {
            document.body.classList.add('theme-transition');
        }, 100);
    });
})();

/**
 * Verifies the access script provided by the user.
 * @param {string} key - The key entered by the user.
 * @returns {boolean} - True if correct, false otherwise.
 */
function verifyAccess(key) {
  return key === SECRET_KEY;
}

/**
 * Modern Notification System inspired by Dynamic Island
 *
 * This system provides a dynamic, animated notification UI that appears from the top of the screen.
 * It supports different notification types, real-time updates, and interactive elements.
 *
 * @property {HTMLElement} container - The main container for all notifications.
 * @property {Array<object>} notifications - An array of active notification objects.
 * @property {HTMLElement} modalEl - The element for the confirmation modal.
 */
const NotificationSystem = {
    container: null,
    notifications: [],
    modalEl: null,

    /**
     * Initializes the notification system by creating the container and adding styles to the document.
     * This is called automatically on the first notification.
     */
    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center';
        document.body.appendChild(this.container);

        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --sidebar-bg: #ffffff;
                --page-bg: #F8FAFC; 
                --card-bg: #ffffff;
                --card-inner-bg: #F1F5F9; 
                --text-primary: #0F172A; 
                --text-secondary: #64748B; 
                --border-color: #F1F5F9; 
                --accent-color: #0061FF;
            }
            body {
                background-color: var(--page-bg);
                color: var(--text-primary);
                -webkit-font-smoothing: antialiased;
            }
            .theme-transition, .theme-transition *, .theme-transition *:before, .theme-transition *:after {
                transition: all 0.3s ease !important;
                transition-delay: 0s !important;
            }
            .card-theme { background-color: var(--card-bg); border: 1px solid var(--border-color); }
            .card-inner-theme { background-color: var(--card-inner-bg); }
            .text-theme-primary { color: var(--text-primary); }
            .text-theme-secondary { color: var(--text-secondary); }
            input, select, textarea { color: var(--text-primary) !important; }
            input::placeholder { color: var(--text-secondary) !important; opacity: 0.7; }

            .dynamic-island {
                background: rgba(20, 20, 20, 0.75);
                backdrop-filter: blur(25px) saturate(200%);
                -webkit-backdrop-filter: blur(25px) saturate(200%);
                border-radius: 50px;
                padding: 10px;
                color: white;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                box-shadow: 0 12px 40px rgba(0,0,0,0.4);
                transition: all 0.6s cubic-bezier(0.2, 1, 0.2, 1);
                transform: scale(0.95) translateY(-20px) opacity(0);
                will-change: transform, opacity, height, padding;
                max-width: calc(100vw - 32px);
                border: 1px solid rgba(255,255,255,0.1);
                cursor: pointer;
            }
            .dynamic-island.show {
                transform: scale(1) translateY(0) opacity(1);
            }
            .dynamic-island-content-wrapper {
                display: flex;
                align-items: center;
                transition: all 0.4s cubic-bezier(0.2, 1, 0.2, 1);
            }
            .dynamic-island-icon {
                width: 32px;
                height: 32px;
                flex-shrink: 0;
                margin-right: 12px;
                display: grid;
                place-items: center;
                transition: all 0.4s ease;
            }
            .dynamic-island-text {
                flex-grow: 1;
                font-size: 13px;
                font-weight: 600;
                line-height: 1.4;
            }
            .dynamic-island-title {
                font-weight: 700;
            }
            .dynamic-island-message {
                font-weight: 500;
                font-size: 12px;
                opacity: 0.8;
                max-height: 0;
                overflow: hidden;
                transition: all 0.5s ease;
            }
            .dynamic-island-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 8px;
                max-height: 0;
                overflow: hidden;
                transition: all 0.5s ease;
            }
            .dynamic-island-timestamp {
                font-size: 11px;
                opacity: 0.6;
            }
            .dynamic-island-actions button {
                font-size: 11px;
                background: rgba(255,255,255,0.1);
                border: none;
                color: white;
                padding: 4px 8px;
                border-radius: 6px;
                cursor: pointer;
                margin-left: 4px;
            }
            /* Expandable styles */
            .dynamic-island.expanded {
                border-radius: 28px;
                padding: 16px;
                height: auto;
            }
            .expanded .dynamic-island-icon {
                align-self: flex-start;
            }
            .expanded .dynamic-island-message {
                max-height: 100px;
                margin-top: 4px;
            }
            .expanded .dynamic-island-footer {
                max-height: 100px;
                margin-top: 12px;
            }
            .expanded .view-btn {
                display: none;
            }
            .close-btn {
                display: none;
            }
            .expanded .close-btn {
                display: inline-block;
            }


            .type-success .dynamic-island-icon { color: #34D399; }
            .type-error .dynamic-island-icon { color: #F87171; }
            .type-warning .dynamic-island-icon { color: #FBBF24; }
            .type-info .dynamic-island-icon { color: #60A5FA; }

            .notif-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 10000; opacity: 0; transition: opacity 220ms ease; }
            .notif-modal-overlay.show { opacity: 1; }
            .notif-modal-card { width: 100%; max-width: 520px; background: #ffffff; border: 1px solid #F1F5F9; border-radius: 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.20); transform: translateY(10px) scale(0.98); transition: transform 220ms ease; overflow: hidden; }
            .notif-modal-overlay.show .notif-modal-card { transform: translateY(0) scale(1); }
            .notif-modal-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 18px 18px 0 18px; }
            .notif-modal-close { width: 38px; height: 38px; border-radius: 12px; border: 1px solid #F1F5F9; background: #ffffff; color: #64748B; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: background 160ms ease, color 160ms ease; }
            .notif-modal-close:hover { background: #F8FAFC; color: #0F172A; }
            .notif-modal-body { padding: 10px 18px 18px 18px; display: flex; gap: 14px; align-items: flex-start; }
            .notif-modal-icon { width: 44px; height: 44px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,97,255,0.10); color: #0061FF; }
            .notif-modal-icon svg { width: 22px; height: 22px; }
            .notif-modal-title { font-weight: 800; font-size: 16px; color: #0F172A; margin: 0; line-height: 1.2; }
            .notif-modal-message { margin-top: 6px; font-size: 14px; color: #475569; line-height: 1.5; word-break: break-word; }
            .notif-modal-actions { padding: 0 18px 18px 18px; display: flex; justify-content: flex-end; gap: 10px; }
            .notif-btn { padding: 10px 14px; border-radius: 14px; border: 1px solid #E2E8F0; background: #ffffff; color: #0F172A; font-weight: 700; font-size: 12px; cursor: pointer; transition: background 160ms ease, border-color 160ms ease, transform 120ms ease; }
            .notif-btn:hover { background: #F8FAFC; }
            .notif-btn:active { transform: scale(0.98); }
            .notif-btn-primary { background: #0061FF; border-color: #0061FF; color: #ffffff; }
            .notif-btn-primary:hover { background: #155DFC; border-color: #155DFC; }
            .notif-type-success .notif-modal-icon { background: rgba(34,197,94,0.12); color: #22C55E; }
            .notif-type-warning .notif-modal-icon { background: rgba(249,115,22,0.12); color: #F97316; }
            .notif-type-error .notif-modal-icon { background: rgba(239,68,68,0.12); color: #EF4444; }
        `;
        document.head.appendChild(style);
    },

    /**
     * Displays a notification.
     * @param {string} title - The main title of the notification.
     * @param {string} message - The detailed message.
     * @param {string} type - The type of notification: 'info', 'success', 'warning', or 'error'.
     * @param {number} duration - How long the notification stays visible in milliseconds. 0 for permanent.
     * @param {object} options - Additional options for the notification.
     * @param {Array<object>} options.actions - Action buttons to display on the notification. Each action is an object with `label` and `onClick` properties.
     * @returns {string} The ID of the created notification.
     */
    show(title, message, type = 'info', duration = 5000, options = {}) {
        this.init();
        if ('vibrate' in navigator) window.navigator.vibrate([50, 20, 20]);

        const id = `notif_${Date.now()}_${Math.random()}`;
        const notifEl = document.createElement('div');
        notifEl.id = id;
        notifEl.className = `dynamic-island type-${type}`;
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        let actionsHtml = `
            <button class="view-btn">View</button>
            <button class="close-btn">Close</button>
            <button class="dismiss-btn">Dismiss</button>
        `;

        if (options.actions) {
            actionsHtml = options.actions.map(action => `<button class="custom-action-btn" data-action="${action.label}">${action.label}</button>`).join('') + actionsHtml;
        }

        notifEl.innerHTML = `
            <div class="dynamic-island-content-wrapper">
                <div class="dynamic-island-icon">${this.getIcon(type)}</div>
                <div class="dynamic-island-text">
                    <div class="dynamic-island-title">${title}</div>
                    <div class="dynamic-island-message">${message}</div>
                    <div class="dynamic-island-footer">
                        <div class="dynamic-island-timestamp">${time}</div>
                        <div class="dynamic-island-actions">
                            ${actionsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container.appendChild(notifEl);
        
        // Show animation
        setTimeout(() => notifEl.classList.add('show'), 50);

        const close = () => {
            notifEl.classList.remove('show');
            // Remove from DOM after animation
            setTimeout(() => {
                notifEl.remove();
                const index = this.notifications.findIndex(n => n.id === id);
                if (index > -1) this.notifications.splice(index, 1);
            }, 600);
        };

        const expand = () => notifEl.classList.add('expanded');
        const collapse = () => notifEl.classList.remove('expanded');

        notifEl.addEventListener('click', (e) => {
            if (e.target.closest('.dynamic-island-actions')) {
                return;
            }
            notifEl.classList.toggle('expanded');
        });
        
        notifEl.querySelector('.dismiss-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            close();
        });

        notifEl.querySelector('.view-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            expand();
        });

        notifEl.querySelector('.close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            collapse();
        });

        if (options.actions) {
            options.actions.forEach(action => {
                notifEl.querySelector(`[data-action="${action.label}"]`).addEventListener('click', (e) => {
                    e.stopPropagation();
                    action.onClick({ id, close, expand, collapse });
                });
            });
        }

        let timeoutId = null;
        if (duration > 0) {
            timeoutId = setTimeout(close, duration);
        }

        this.notifications.push({ id, el: notifEl, close, expand, collapse, timeoutId });
        return id;
    },

    /**
     * Updates an existing notification's content.
     * @param {string} id - The ID of the notification to update.
     * @param {object} options - The new content { title, message, type }.
     */
    update(id, { title, message, type }) {
        const notif = this.notifications.find(n => n.id === id);
        if (!notif) return;

        if (type) {
            notif.el.className = `dynamic-island show type-${type} ${notif.el.classList.contains('expanded') ? 'expanded' : ''}`;
            const iconEl = notif.el.querySelector('.dynamic-island-icon');
            if (iconEl) iconEl.innerHTML = this.getIcon(type);
        }
        if (title) {
            const titleEl = notif.el.querySelector('.dynamic-island-title');
            if (titleEl) titleEl.textContent = title;
        }
        if (message) {
            const messageEl = notif.el.querySelector('.dynamic-island-message');
            if (messageEl) messageEl.textContent = message;
        }
    },

    /**
     * Displays a confirmation dialog.
     * @param {string} message - The confirmation message.
     * @param {object} [opts] - Options for the dialog.
     * @param {string} [opts.title='Confirm'] - The title of the dialog.
     * @param {string} [opts.confirmText='Confirm'] - The text for the confirm button.
     * @param {string} [opts.cancelText='Cancel'] - The text for the cancel button.
     * @param {string} [opts.type='warning'] - The type of dialog: 'info', 'success', 'warning', or 'error'.
     * @returns {Promise<boolean>} - A promise that resolves to true if confirmed, false otherwise.
     */
    confirm(message, opts = {}) {
        this.init();
        const { title = 'Confirm', confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' } = opts;

        if (this.modalEl) {
            this.modalEl.remove();
            this.modalEl = null;
        }

        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = `notif-modal-overlay notif-type-${type}`;
            const icon = this.getIcon(type);

            overlay.innerHTML = `
                <div class="notif-modal-card" role="dialog" aria-modal="true" aria-label="${title}">
                    <div class="notif-modal-head">
                        <div></div>
                        <button type="button" class="notif-modal-close" aria-label="Close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div class="notif-modal-body">
                        <div class="notif-modal-icon">${icon}</div>
                        <div>
                            <h3 class="notif-modal-title">${title}</h3>
                            <div class="notif-modal-message">${String(message ?? '')}</div>
                        </div>
                    </div>
                    <div class="notif-modal-actions">
                        <button type="button" class="notif-btn notif-btn-cancel">${cancelText}</button>
                        <button type="button" class="notif-btn notif-btn-primary notif-btn-confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            const close = (value) => {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                    if (this.modalEl === overlay) this.modalEl = null;
                    resolve(value);
                }, 220);
            };

            overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
            overlay.querySelector('.notif-modal-close')?.addEventListener('click', () => close(false));
            overlay.querySelector('.notif-btn-cancel')?.addEventListener('click', () => close(false));
            overlay.querySelector('.notif-btn-confirm')?.addEventListener('click', () => close(true));

            document.body.appendChild(overlay);
            this.modalEl = overlay;
            setTimeout(() => overlay.classList.add('show'), 10);
        });
    },

    /**
     * Gets the SVG icon for a given notification type.
     * @param {string} type - The notification type.
     * @returns {string} The SVG icon markup.
     * @private
     */
    getIcon(type) {
        const icons = {
            success: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            error: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            warning: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            info: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
        };
        return icons[type] || icons.info;
    }
};

/**
 * General function to send POST data to GAS for CRUD operations.
 * @param {object} payload - The data to send.
 * @returns {Promise<object>} - The response result.
 */
async function postToGAS(payload) {
  try {
    // To avoid CORS preflight (OPTIONS), we send as text/plain
    // but the content is still a JSON string that GAS can parse.
    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      mode: "cors", 
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        auth_token: SECRET_KEY,
        ...payload
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error posting to GAS:", error);
    // If it's a redirect issue (common with GAS), we might still be okay
    // but for CRUD we really need the response.
    return { status: "error", message: "Network error or CORS issue. Check GAS deployment." };
  }
}

/**
 * Fetches actual row data for a specific sheet from the Google Spreadsheet.
 * @param {string} sheetName - The name of the sheet to fetch.
 * @returns {Promise<Object|null>} - The headers and row data.
 */
async function getFullSheetData(sheetName) {
  try {
    const response = await fetch(`${GAS_WEB_APP_URL}?action=getSheetData&sheetName=${encodeURIComponent(sheetName)}`);
    const result = await response.json();
    if (result.status === "success") {
      return result;
    }
    return null;
  } catch (error) {
    console.error("Error fetching full sheet data:", error);
    return null;
  }
}

/**
 * Tracks an event by sending data to the GAS backend.
 * @param {string} eventName - The name of the event to track.
 * @param {object} details - Any additional data about the event.
 */
async function trackEvent(eventName, details = {}) {
  console.log(`Tracking event: ${eventName}`, details);

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors", // Required for cross-origin requests to GAS web apps
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName: eventName,
        details: details
      }),
    });

    // NOTE: 'no-cors' mode results in an opaque response, 
    // so we can't read the response body or status.
    console.log("Event data sent successfully (opaque response).");
    NotificationSystem.show(`Success! Na-send na yung event: ${eventName}`, 'success');

  } catch (error) {
    console.error("Error sending event data:", error);
    NotificationSystem.show("May error sa pag-send ng event. Check the console.", 'error');
  }
}

/**
 * Fetches sheet names and column headers dynamically from GAS.
 * @returns {Promise<object>} - The metadata object.
 */
async function getSheetMetadata() {
  try {
    const response = await fetch(GAS_WEB_APP_URL);
    const result = await response.json();
    if (result.status === "success") {
      NotificationSystem.show("Metadata updated successfully.", "success");
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error fetching metadata:", error);
    NotificationSystem.show("Failed to fetch spreadsheet metadata.", "error");
    return null;
  }
}

// Example usage: 
// trackEvent("Button Click", { buttonId: "submit-btn" });
