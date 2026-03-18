const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxrIIji4YOVRzUbnw8w9Cpl3rfibbPlTgXArv0dpgYgT9u5sS-qOAPrkK9-xtOcBP1A/exec";
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
 */
const NotificationSystem = {
    container: null,
    notifications: [],

    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center pointer-events-none w-full max-w-md px-4';
        document.body.appendChild(this.container);

        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            /* Dark Mode Support & Better Light Theme Readability */
            :root {
                --sidebar-bg: #155DFC;
                --page-bg: #F8FAFC; /* Softer gray-white */
                --card-bg: #ffffff;
                --card-inner-bg: #F1F5F9; /* High contrast inner background */
                --text-primary: #0F172A; /* Slate 900 for max readability */
                --text-secondary: #475569; /* Slate 600 for subtext */
                --border-color: #E2E8F0; /* Slate 200 */
                --accent-color: #155DFC;
            }

            .dark {
                --page-bg: #0F172A;
                --card-bg: #1E293B;
                --card-inner-bg: #334155;
                --text-primary: #F8FAFC;
                --text-secondary: #94A3B8;
                --border-color: #334155;
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

            .card-theme {
                background-color: var(--card-bg);
                border: 1px solid var(--border-color);
            }

            .card-inner-theme {
                background-color: var(--card-inner-bg);
            }

            .text-theme-primary { color: var(--text-primary); }
            .text-theme-secondary { color: var(--text-secondary); }

            /* Better input styles for readability */
            input, select, textarea {
                color: var(--text-primary) !important;
            }
            input::placeholder {
                color: var(--text-secondary) !important;
                opacity: 0.7;
            }

            .fade-in {
                animation: fadeIn 0.5s ease-out forwards;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .dynamic-island {
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-radius: 50px;
                padding: 10px 20px;
                color: white;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                transform: scale(0.5) translateY(-50px);
                opacity: 0;
                pointer-events: auto;
                cursor: pointer;
                min-width: 180px;
                max-width: 90vw;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .dark .dynamic-island {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255,255,255,0.2);
            }
            .dynamic-island.show {
                transform: scale(1) translateY(0);
                opacity: 1;
            }
            .dynamic-island.expand {
                border-radius: 24px;
                padding: 20px;
                flex-direction: column;
                align-items: flex-start;
            }
            .dynamic-island-icon {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
            }
            .dynamic-island-content {
                flex-grow: 1;
                font-size: 14px;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .dynamic-island.expand .dynamic-island-content {
                white-space: normal;
                margin-top: 8px;
            }
            .type-success .dynamic-island-icon { color: #10b981; }
            .type-error .dynamic-island-icon { color: #ef4444; }
            .type-warning .dynamic-island-icon { color: #f59e0b; }
            .type-info .dynamic-island-icon { color: #3b82f6; }
        `;
        document.head.appendChild(style);
    },

  show(message, type = 'info', duration = 4000) {
    this.init();
    
    // Haptic Feedback
    if ('vibrate' in navigator) {
      window.navigator.vibrate(50);
    }

    const notification = document.createElement('div');
    notification.className = `dynamic-island type-${type}`;
    
    const icon = this.getIcon(type);
    notification.innerHTML = `
      <div class="dynamic-island-icon">${icon}</div>
      <div class="dynamic-island-content">${message}</div>
    `;

    notification.onclick = () => notification.classList.toggle('expand');

    this.container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
      notification.classList.remove('show');
      notification.style.transform = 'scale(0.5) translateY(-50px)';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, duration);
  },

  getIcon(type) {
    const icons = {
      success: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
      error: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
      warning: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
      info: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
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
