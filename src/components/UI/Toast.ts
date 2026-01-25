// ============================================================================
// Composant Toast - Notifications non-bloquantes
// ============================================================================

import type { Toast, ToastConfig } from '../../types';
import { generateId } from '../../utils/helpers';

let container: HTMLElement | null = null;
const toasts: Map<string, { element: HTMLElement; timeout: number }> = new Map();

const ICONS = {
  success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
};

/**
 * Initialise le conteneur de toasts
 */
function initContainer(): HTMLElement {
  if (container) return container;

  container = document.createElement('div');
  container.className = 'toast-container';
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', 'Notifications');
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);

  return container;
}

/**
 * Affiche un toast
 */
export function show(config: ToastConfig): string {
  const cont = initContainer();
  const id = generateId();
  const duration = config.duration ?? 4000;

  const toast: Toast = {
    ...config,
    id,
    createdAt: Date.now()
  };

  // Créer l'élément
  const element = document.createElement('div');
  element.className = `toast toast-${config.type}`;
  element.setAttribute('role', 'alert');
  element.dataset.toastId = id;

  element.innerHTML = `
    ${ICONS[config.type]}
    <div class="toast-content">
      <p class="toast-message">${escapeHtml(config.message)}</p>
      ${config.action ? `
        <button class="toast-action" type="button">
          ${escapeHtml(config.action.label)}
        </button>
      ` : ''}
    </div>
    <button class="toast-close" type="button" aria-label="Fermer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  // Event listeners
  const closeBtn = element.querySelector('.toast-close');
  closeBtn?.addEventListener('click', () => dismiss(id));

  if (config.action) {
    const actionBtn = element.querySelector('.toast-action');
    actionBtn?.addEventListener('click', () => {
      config.action!.callback();
      dismiss(id);
    });
  }

  // Ajouter au container
  cont.appendChild(element);

  // Animation d'entrée
  requestAnimationFrame(() => {
    element.classList.add('toast-enter');
  });

  // Auto-dismiss
  const timeout = window.setTimeout(() => {
    dismiss(id);
  }, duration);

  toasts.set(id, { element, timeout });

  // Limiter le nombre de toasts visibles
  if (toasts.size > 5) {
    const oldestId = toasts.keys().next().value;
    if (oldestId) dismiss(oldestId);
  }

  return id;
}

/**
 * Ferme un toast
 */
export function dismiss(id: string): void {
  const toast = toasts.get(id);
  if (!toast) return;

  clearTimeout(toast.timeout);

  toast.element.classList.remove('toast-enter');
  toast.element.classList.add('toast-exit');

  toast.element.addEventListener('animationend', () => {
    toast.element.remove();
    toasts.delete(id);
  }, { once: true });
}

/**
 * Ferme tous les toasts
 */
export function dismissAll(): void {
  toasts.forEach((_, id) => dismiss(id));
}

// Raccourcis
export function success(message: string, options?: Partial<ToastConfig>): string {
  return show({ type: 'success', message, ...options });
}

export function error(message: string, options?: Partial<ToastConfig>): string {
  return show({ type: 'error', message, duration: 6000, ...options });
}

export function warning(message: string, options?: Partial<ToastConfig>): string {
  return show({ type: 'warning', message, ...options });
}

export function info(message: string, options?: Partial<ToastConfig>): string {
  return show({ type: 'info', message, ...options });
}

/**
 * Toast avec action d'annulation
 */
export function withUndo(
  message: string,
  onUndo: () => void,
  type: ToastConfig['type'] = 'info'
): string {
  return show({
    type,
    message,
    duration: 6000,
    action: {
      label: 'Annuler',
      callback: onUndo
    }
  });
}

/**
 * Toast de chargement (reste affiché jusqu'à dismiss)
 */
export function loading(message: string): { id: string; done: (successMessage?: string) => void } {
  const id = show({
    type: 'info',
    message,
    duration: 60000 // Long timeout
  });

  return {
    id,
    done: (successMessage?: string) => {
      dismiss(id);
      if (successMessage) {
        success(successMessage);
      }
    }
  };
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialise le conteneur de toasts (export public)
 */
export function initToastContainer(): HTMLElement {
  return initContainer();
}

/**
 * Alias pour show (compatibilité)
 */
export function showToast(config: ToastConfig): string {
  return show(config);
}

// Export default pour utilisation simplifiée
export const toast = {
  show,
  dismiss,
  dismissAll,
  success,
  error,
  warning,
  info,
  withUndo,
  loading
};

export default toast;
