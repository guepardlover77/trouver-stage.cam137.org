// ============================================================================
// Composant Skeleton - Placeholders de chargement animés
// ============================================================================

/**
 * Crée un élément skeleton
 */
export function createSkeleton(
  type: 'text' | 'circle' | 'rect' | 'card' | 'list-item',
  options: {
    width?: string;
    height?: string;
    className?: string;
    count?: number;
  } = {}
): HTMLElement {
  const { width, height, className = '', count = 1 } = options;

  const container = document.createElement('div');
  container.className = `skeleton-container ${className}`;

  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = `skeleton skeleton-${type}`;
    skeleton.setAttribute('aria-hidden', 'true');

    if (width) skeleton.style.width = width;
    if (height) skeleton.style.height = height;

    if (type === 'card') {
      skeleton.innerHTML = createCardSkeleton();
    } else if (type === 'list-item') {
      skeleton.innerHTML = createListItemSkeleton();
    }

    container.appendChild(skeleton);
  }

  return container;
}

/**
 * Template skeleton pour une carte
 */
function createCardSkeleton(): string {
  return `
    <div class="skeleton skeleton-rect" style="height: 120px; border-radius: 8px 8px 0 0;"></div>
    <div class="skeleton-card-content">
      <div class="skeleton skeleton-text" style="width: 70%; height: 20px;"></div>
      <div class="skeleton skeleton-text" style="width: 50%; height: 14px;"></div>
      <div class="skeleton skeleton-text" style="width: 90%; height: 14px;"></div>
    </div>
  `;
}

/**
 * Template skeleton pour un élément de liste
 */
function createListItemSkeleton(): string {
  return `
    <div class="skeleton-list-item-content">
      <div class="skeleton skeleton-circle" style="width: 40px; height: 40px;"></div>
      <div class="skeleton-list-item-text">
        <div class="skeleton skeleton-text" style="width: 60%; height: 16px;"></div>
        <div class="skeleton skeleton-text" style="width: 40%; height: 12px;"></div>
      </div>
    </div>
  `;
}

/**
 * Crée un skeleton pour la liste de résultats
 */
export function createResultsListSkeleton(count: number = 10): HTMLElement {
  const container = document.createElement('div');
  container.className = 'skeleton-results-list';
  container.setAttribute('aria-busy', 'true');
  container.setAttribute('aria-label', 'Chargement des résultats...');

  for (let i = 0; i < count; i++) {
    const item = document.createElement('div');
    item.className = 'skeleton-result-item';
    item.innerHTML = `
      <div class="skeleton-result-header">
        <div class="skeleton skeleton-text" style="width: 70%; height: 18px;"></div>
        <div class="skeleton skeleton-circle" style="width: 24px; height: 24px;"></div>
      </div>
      <div class="skeleton skeleton-text" style="width: 85%; height: 14px; margin-top: 8px;"></div>
      <div class="skeleton skeleton-text" style="width: 50%; height: 14px; margin-top: 4px;"></div>
      <div class="skeleton-result-footer">
        <div class="skeleton skeleton-text" style="width: 80px; height: 20px; border-radius: 10px;"></div>
        <div class="skeleton skeleton-text" style="width: 60px; height: 20px; border-radius: 10px;"></div>
      </div>
    `;
    container.appendChild(item);
  }

  return container;
}

/**
 * Crée un skeleton pour le panel de détail
 */
export function createDetailPanelSkeleton(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'skeleton-detail-panel';
  container.setAttribute('aria-busy', 'true');
  container.innerHTML = `
    <div class="skeleton-detail-header">
      <div class="skeleton skeleton-text" style="width: 80%; height: 24px;"></div>
      <div class="skeleton skeleton-text" style="width: 50%; height: 16px; margin-top: 8px;"></div>
    </div>

    <div class="skeleton-detail-section">
      <div class="skeleton skeleton-text" style="width: 100px; height: 12px;"></div>
      <div class="skeleton skeleton-text" style="width: 90%; height: 16px; margin-top: 4px;"></div>
    </div>

    <div class="skeleton-detail-section">
      <div class="skeleton skeleton-text" style="width: 80px; height: 12px;"></div>
      <div class="skeleton skeleton-text" style="width: 60%; height: 16px; margin-top: 4px;"></div>
    </div>

    <div class="skeleton-detail-section">
      <div class="skeleton skeleton-text" style="width: 100px; height: 12px;"></div>
      <div class="skeleton skeleton-text" style="width: 70%; height: 16px; margin-top: 4px;"></div>
    </div>

    <div class="skeleton-detail-actions">
      <div class="skeleton skeleton-rect" style="width: 100%; height: 36px; border-radius: 6px;"></div>
      <div class="skeleton skeleton-rect" style="width: 100%; height: 36px; border-radius: 6px; margin-top: 8px;"></div>
    </div>
  `;

  return container;
}

/**
 * Crée un skeleton pour les filtres
 */
export function createFiltersSkeleton(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'skeleton-filters';
  container.innerHTML = `
    <div class="skeleton skeleton-rect" style="width: 100%; height: 40px; border-radius: 6px;"></div>
    <div class="skeleton-filter-group" style="margin-top: 16px;">
      <div class="skeleton skeleton-text" style="width: 80px; height: 14px;"></div>
      <div class="skeleton skeleton-rect" style="width: 100%; height: 36px; border-radius: 6px; margin-top: 8px;"></div>
    </div>
    <div class="skeleton-filter-group" style="margin-top: 16px;">
      <div class="skeleton skeleton-text" style="width: 60px; height: 14px;"></div>
      <div class="skeleton skeleton-rect" style="width: 100%; height: 36px; border-radius: 6px; margin-top: 8px;"></div>
    </div>
  `;

  return container;
}

/**
 * Crée un skeleton pour les statistiques
 */
export function createStatsSkeleton(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'skeleton-stats';
  container.innerHTML = `
    <div class="skeleton-stat-cards">
      ${Array(4).fill(null).map(() => `
        <div class="skeleton-stat-card">
          <div class="skeleton skeleton-text" style="width: 60px; height: 32px;"></div>
          <div class="skeleton skeleton-text" style="width: 80px; height: 14px; margin-top: 8px;"></div>
        </div>
      `).join('')}
    </div>
    <div class="skeleton-chart" style="margin-top: 24px;">
      <div class="skeleton skeleton-rect" style="width: 100%; height: 200px; border-radius: 8px;"></div>
    </div>
  `;

  return container;
}

/**
 * Affiche un skeleton dans un conteneur
 */
export function showSkeleton(
  container: HTMLElement,
  type: 'results' | 'detail' | 'filters' | 'stats' | 'custom',
  options?: Parameters<typeof createSkeleton>[1]
): HTMLElement {
  container.innerHTML = '';

  let skeleton: HTMLElement;

  switch (type) {
    case 'results':
      skeleton = createResultsListSkeleton(options?.count || 10);
      break;
    case 'detail':
      skeleton = createDetailPanelSkeleton();
      break;
    case 'filters':
      skeleton = createFiltersSkeleton();
      break;
    case 'stats':
      skeleton = createStatsSkeleton();
      break;
    default:
      skeleton = createSkeleton('rect', options);
  }

  container.appendChild(skeleton);
  return skeleton;
}

/**
 * Cache le skeleton et affiche le contenu
 */
export function hideSkeleton(container: HTMLElement): void {
  const skeleton = container.querySelector('.skeleton-container, [class^="skeleton-"]');
  if (skeleton) {
    skeleton.remove();
  }
  container.removeAttribute('aria-busy');
}
