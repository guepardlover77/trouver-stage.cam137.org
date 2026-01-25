// ============================================================================
// Composant ThemeToggle - Sélecteur de thème (clair/sombre/auto)
// ============================================================================

import type { Theme } from '../../types';
import { store, setTheme } from '../../store';

const ICONS = {
  light: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>`,
  dark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>`,
  auto: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a10 10 0 0 1 0 20"/>
  </svg>`
};

const LABELS: Record<Theme, string> = {
  light: 'Clair',
  dark: 'Sombre',
  auto: 'Auto'
};

const NEXT_THEME: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'auto',
  auto: 'light'
};

let button: HTMLButtonElement | null = null;
let dropdown: HTMLElement | null = null;
let isDropdownOpen = false;

/**
 * Crée le bouton toggle de thème
 */
export function createThemeToggle(container: HTMLElement): HTMLButtonElement {
  // Bouton principal
  button = document.createElement('button');
  button.className = 'theme-toggle';
  button.setAttribute('type', 'button');
  button.setAttribute('aria-label', 'Changer le thème');
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');

  updateButton();

  // Dropdown
  dropdown = document.createElement('div');
  dropdown.className = 'theme-dropdown';
  dropdown.setAttribute('role', 'menu');
  dropdown.innerHTML = `
    <button class="theme-option" data-theme="light" role="menuitem">
      ${ICONS.light}
      <span>Clair</span>
    </button>
    <button class="theme-option" data-theme="dark" role="menuitem">
      ${ICONS.dark}
      <span>Sombre</span>
    </button>
    <button class="theme-option" data-theme="auto" role="menuitem">
      ${ICONS.auto}
      <span>Automatique</span>
    </button>
  `;

  // Wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'theme-toggle-wrapper';
  wrapper.appendChild(button);
  wrapper.appendChild(dropdown);

  container.appendChild(wrapper);

  // Events
  button.addEventListener('click', toggleDropdown);

  dropdown.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme') as Theme;
      selectTheme(theme);
      closeDropdown();
    });
  });

  // Fermer au clic extérieur
  document.addEventListener('click', (e) => {
    if (isDropdownOpen && !wrapper.contains(e.target as Node)) {
      closeDropdown();
    }
  });

  // Fermer avec Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDropdownOpen) {
      closeDropdown();
      button?.focus();
    }
  });

  return button;
}

/**
 * Crée un bouton toggle simple (cycle entre les thèmes)
 */
export function createSimpleThemeToggle(container: HTMLElement): HTMLButtonElement {
  button = document.createElement('button');
  button.className = 'theme-toggle theme-toggle-simple';
  button.setAttribute('type', 'button');
  button.setAttribute('aria-label', 'Changer le thème');

  updateButton();

  button.addEventListener('click', () => {
    const nextTheme = NEXT_THEME[store.theme];
    selectTheme(nextTheme);
  });

  container.appendChild(button);

  return button;
}

/**
 * Met à jour l'apparence du bouton
 */
function updateButton(): void {
  if (!button) return;

  const currentTheme = store.theme;
  button.innerHTML = ICONS[currentTheme];
  button.setAttribute('aria-label', `Thème: ${LABELS[currentTheme]}. Cliquer pour changer.`);
  button.setAttribute('title', `Thème: ${LABELS[currentTheme]}`);

  // Mettre à jour l'option active dans le dropdown
  dropdown?.querySelectorAll('.theme-option').forEach(option => {
    const isActive = option.getAttribute('data-theme') === currentTheme;
    option.classList.toggle('active', isActive);
    option.setAttribute('aria-checked', String(isActive));
  });
}

/**
 * Toggle le dropdown
 */
function toggleDropdown(): void {
  if (isDropdownOpen) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

/**
 * Ouvre le dropdown
 */
function openDropdown(): void {
  if (!dropdown || !button) return;

  isDropdownOpen = true;
  dropdown.classList.add('open');
  button.setAttribute('aria-expanded', 'true');

  // Focus sur l'option active
  const activeOption = dropdown.querySelector('.theme-option.active') as HTMLElement;
  activeOption?.focus();
}

/**
 * Ferme le dropdown
 */
function closeDropdown(): void {
  if (!dropdown || !button) return;

  isDropdownOpen = false;
  dropdown.classList.remove('open');
  button.setAttribute('aria-expanded', 'false');
}

/**
 * Sélectionne un thème
 */
function selectTheme(theme: Theme): void {
  setTheme(theme);
  updateButton();
}

/**
 * Applique le thème au document
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }

  // Mettre à jour la meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const effectiveTheme = theme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#1e293b' : '#2563eb');
  }
}

/**
 * Initialise le système de thème
 */
export function initTheme(): void {
  // Appliquer le thème initial
  applyTheme(store.theme);

  // Écouter les changements de préférence système
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (store.theme === 'auto') {
      applyTheme('auto');
    }
  });
}

/**
 * Détruit le composant
 */
export function destroyThemeToggle(): void {
  button?.parentElement?.remove();
  button = null;
  dropdown = null;
  isDropdownOpen = false;
}
