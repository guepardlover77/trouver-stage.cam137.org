// ============================================================================
// Liste virtuelle pour afficher de grandes listes avec performance
// ============================================================================

import type { VirtualListOptions, VirtualListState } from '../types';

export interface VirtualListConfig {
  container: HTMLElement;
  itemHeight: number;
  renderItem: (index: number) => HTMLElement;
  totalItems: number;
  overscan?: number;
  onScroll?: (state: VirtualListState) => void;
}

export class VirtualList {
  private container: HTMLElement;
  private scrollContainer: HTMLElement;
  private contentContainer: HTMLElement;
  private itemHeight: number;
  private renderItem: (index: number) => HTMLElement;
  private totalItems: number;
  private overscan: number;
  private onScroll?: (state: VirtualListState) => void;

  private state: VirtualListState = {
    startIndex: 0,
    endIndex: 0,
    offsetY: 0,
    visibleItems: []
  };

  private renderedItems: Map<number, HTMLElement> = new Map();
  private rafId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(config: VirtualListConfig) {
    this.container = config.container;
    this.itemHeight = config.itemHeight;
    this.renderItem = config.renderItem;
    this.totalItems = config.totalItems;
    this.overscan = config.overscan ?? 5;
    this.onScroll = config.onScroll;

    this.scrollContainer = document.createElement('div');
    this.scrollContainer.className = 'virtual-list-scroll';
    this.scrollContainer.style.cssText = `
      overflow-y: auto;
      height: 100%;
      position: relative;
    `;

    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'virtual-list-content';
    this.contentContainer.style.cssText = `
      position: relative;
      width: 100%;
    `;

    this.scrollContainer.appendChild(this.contentContainer);
    this.container.appendChild(this.scrollContainer);

    this.init();
  }

  private init(): void {
    // Hauteur totale du contenu
    this.updateTotalHeight();

    // Écouter le scroll
    this.scrollContainer.addEventListener('scroll', this.handleScroll, { passive: true });

    // Observer le redimensionnement
    this.resizeObserver = new ResizeObserver(() => {
      this.scheduleUpdate();
    });
    this.resizeObserver.observe(this.scrollContainer);

    // Premier rendu
    this.update();
  }

  private updateTotalHeight(): void {
    this.contentContainer.style.height = `${this.totalItems * this.itemHeight}px`;
  }

  private handleScroll = (): void => {
    this.scheduleUpdate();
  };

  private scheduleUpdate(): void {
    if (this.rafId !== null) {
      return;
    }

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.update();
    });
  }

  private update(): void {
    const scrollTop = this.scrollContainer.scrollTop;
    const containerHeight = this.scrollContainer.clientHeight;

    // Calculer les indices visibles
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.overscan);
    const visibleCount = Math.ceil(containerHeight / this.itemHeight);
    const endIndex = Math.min(
      this.totalItems - 1,
      startIndex + visibleCount + this.overscan * 2
    );

    // Mettre à jour l'état
    this.state = {
      startIndex,
      endIndex,
      offsetY: startIndex * this.itemHeight,
      visibleItems: Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i)
    };

    // Rendre les éléments
    this.renderVisibleItems();

    // Callback
    this.onScroll?.(this.state);
  }

  private renderVisibleItems(): void {
    const { startIndex, endIndex, offsetY } = this.state;

    // Supprimer les éléments hors de vue
    for (const [index, element] of this.renderedItems) {
      if (index < startIndex || index > endIndex) {
        element.remove();
        this.renderedItems.delete(index);
      }
    }

    // Créer un fragment pour les nouveaux éléments
    const fragment = document.createDocumentFragment();

    // Rendre les éléments visibles
    for (let i = startIndex; i <= endIndex; i++) {
      if (!this.renderedItems.has(i)) {
        const element = this.renderItem(i);
        element.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: ${this.itemHeight}px;
          transform: translateY(${i * this.itemHeight}px);
        `;
        element.dataset.virtualIndex = String(i);
        this.renderedItems.set(i, element);
        fragment.appendChild(element);
      }
    }

    // Ajouter les nouveaux éléments
    this.contentContainer.appendChild(fragment);
  }

  /**
   * Met à jour le nombre total d'items
   */
  public setTotalItems(count: number): void {
    this.totalItems = count;
    this.updateTotalHeight();
    this.update();
  }

  /**
   * Met à jour la fonction de rendu
   */
  public setRenderItem(renderItem: (index: number) => HTMLElement): void {
    this.renderItem = renderItem;
    this.clear();
    this.update();
  }

  /**
   * Scroll vers un index spécifique
   */
  public scrollToIndex(index: number, align: 'start' | 'center' | 'end' = 'start'): void {
    const containerHeight = this.scrollContainer.clientHeight;
    let scrollTop = index * this.itemHeight;

    if (align === 'center') {
      scrollTop -= (containerHeight - this.itemHeight) / 2;
    } else if (align === 'end') {
      scrollTop -= containerHeight - this.itemHeight;
    }

    this.scrollContainer.scrollTop = Math.max(0, scrollTop);
  }

  /**
   * Force le re-rendu de tous les éléments visibles
   */
  public refresh(): void {
    this.clear();
    this.update();
  }

  /**
   * Efface tous les éléments rendus
   */
  public clear(): void {
    for (const element of this.renderedItems.values()) {
      element.remove();
    }
    this.renderedItems.clear();
  }

  /**
   * Retourne l'état actuel
   */
  public getState(): VirtualListState {
    return { ...this.state };
  }

  /**
   * Retourne la position de scroll
   */
  public getScrollTop(): number {
    return this.scrollContainer.scrollTop;
  }

  /**
   * Définit la position de scroll
   */
  public setScrollTop(scrollTop: number): void {
    this.scrollContainer.scrollTop = scrollTop;
  }

  /**
   * Détruit le composant
   */
  public destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    this.scrollContainer.removeEventListener('scroll', this.handleScroll);
    this.resizeObserver?.disconnect();
    this.clear();
    this.container.innerHTML = '';
  }
}

/**
 * Crée une liste virtuelle
 */
export function createVirtualList(config: VirtualListConfig): VirtualList {
  return new VirtualList(config);
}

/**
 * Hook pour calculer la hauteur optimale d'un item
 */
export function measureItemHeight(
  renderItem: () => HTMLElement,
  container?: HTMLElement
): number {
  const tempContainer = container || document.createElement('div');
  const wasHidden = tempContainer.style.visibility;

  if (!container) {
    tempContainer.style.cssText = `
      position: absolute;
      visibility: hidden;
      pointer-events: none;
    `;
    document.body.appendChild(tempContainer);
  } else {
    tempContainer.style.visibility = 'hidden';
  }

  const item = renderItem();
  tempContainer.appendChild(item);

  const height = item.offsetHeight;

  item.remove();

  if (!container) {
    tempContainer.remove();
  } else {
    tempContainer.style.visibility = wasHidden;
  }

  return height;
}
