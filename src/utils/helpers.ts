// ============================================================================
// Utilitaires généraux
// ============================================================================

/**
 * Debounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle une fonction
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Normalise le texte pour la recherche (supprime accents, minuscules)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Vérifie si un niveau correspond au filtre
 */
export function niveauMatches(niveau: string, min: number, max: number): boolean {
  if (!niveau) return true;

  // Gérer les ranges comme "2-3"
  const rangeMatch = niveau.match(/(\d)\s*-\s*(\d)/);
  if (rangeMatch) {
    const niveauMin = parseInt(rangeMatch[1], 10);
    const niveauMax = parseInt(rangeMatch[2], 10);
    return niveauMin <= max && niveauMax >= min;
  }

  // Niveau simple
  const match = niveau.match(/(\d)/);
  if (match) {
    const n = parseInt(match[1], 10);
    return n >= min && n <= max;
  }

  return true;
}

/**
 * Formate une date en français
 */
export function formatDateFR(date: Date = new Date()): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Génère un nom de fichier avec timestamp
 */
export function generateFileName(prefix: string, extension: string): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Génère un ID unique
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Attend un certain temps
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clone profondément un objet
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Set) {
    return new Set(Array.from(obj).map(item => deepClone(item))) as unknown as T;
  }

  if (obj instanceof Map) {
    return new Map(
      Array.from(obj.entries()).map(([key, value]) => [deepClone(key), deepClone(value)])
    ) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}

/**
 * Formate un numéro de téléphone français
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Nettoyer le numéro
  const cleaned = phone.replace(/\D/g, '');

  // Format français : XX XX XX XX XX
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  return phone;
}

/**
 * Tronque un texte avec ellipse
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalise la première lettre
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formate un code postal
 */
export function formatPostalCode(code: string): string {
  return code.padStart(5, '0');
}

/**
 * Extrait le département d'un code postal
 */
export function getDepartmentFromPostalCode(code: string): string {
  if (!code) return '';
  const dept = code.slice(0, 2);
  // Cas spéciaux pour les DOM-TOM
  if (dept === '97' || dept === '98') {
    return code.slice(0, 3);
  }
  return dept;
}

/**
 * Valide une adresse email
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valide un numéro de téléphone français
 */
export function isValidFrenchPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return /^0[1-9]\d{8}$/.test(cleaned);
}

/**
 * Crée un élément DOM avec des attributs
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes?: Record<string, string>,
  children?: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'className') {
        element.className = value;
      } else if (key.startsWith('data-')) {
        element.dataset[key.slice(5)] = value;
      } else {
        element.setAttribute(key, value);
      }
    }
  }

  if (children) {
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

/**
 * Échappe les caractères HTML
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Parse les paramètres URL
 */
export function parseUrlParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Met à jour l'URL sans recharger la page
 */
export function updateUrlParams(params: Record<string, string | null>): void {
  const url = new URL(window.location.href);

  for (const [key, value] of Object.entries(params)) {
    if (value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  }

  window.history.replaceState({}, '', url.toString());
}

/**
 * Vérifie si on est sur mobile
 */
export function isMobile(): boolean {
  return window.innerWidth < 768;
}

/**
 * Vérifie si on est en mode tactile
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Demande la permission de notification
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Affiche une notification système
 */
export function showNotification(title: string, options?: NotificationOptions): void {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

/**
 * Copie du texte dans le presse-papier
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback pour les navigateurs plus anciens
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * Partage via Web Share API
 */
export async function share(data: ShareData): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Erreur de partage:', error);
      }
      return false;
    }
  }
  return false;
}
