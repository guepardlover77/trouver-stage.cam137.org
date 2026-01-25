// ============================================================================
// Système de réactivité simple basé sur Proxy
// ============================================================================

type Subscriber<T> = (newValue: T, oldValue: T, path: string) => void;

interface ReactiveOptions {
  deep?: boolean;
}

/**
 * Crée un objet réactif qui notifie les subscribers lors des changements
 */
export function reactive<T extends object>(
  target: T,
  options: ReactiveOptions = { deep: true }
): T {
  const subscribers = new Set<Subscriber<any>>();

  const handler: ProxyHandler<T> = {
    get(obj: T, prop: string | symbol): any {
      const value = Reflect.get(obj, prop);

      // Rendre récursivement réactif les objets imbriqués
      // Exclure Map, Set, WeakMap, WeakSet car leurs méthodes ne fonctionnent pas avec Proxy
      if (
        options.deep &&
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Map) &&
        !(value instanceof Set) &&
        !(value instanceof WeakMap) &&
        !(value instanceof WeakSet)
      ) {
        return reactive(value, options);
      }

      return value;
    },

    set(obj: T, prop: string | symbol, value: any): boolean {
      const oldValue = Reflect.get(obj, prop);

      if (oldValue === value) {
        return true;
      }

      const result = Reflect.set(obj, prop, value);

      if (result) {
        // Notifier tous les subscribers
        subscribers.forEach(subscriber => {
          subscriber(value, oldValue, String(prop));
        });
      }

      return result;
    },

    deleteProperty(obj: T, prop: string | symbol): boolean {
      const oldValue = Reflect.get(obj, prop);
      const result = Reflect.deleteProperty(obj, prop);

      if (result) {
        subscribers.forEach(subscriber => {
          subscriber(undefined, oldValue, String(prop));
        });
      }

      return result;
    }
  };

  const proxy = new Proxy(target, handler);

  // Ajouter des méthodes pour gérer les subscriptions
  (proxy as any).$subscribe = (subscriber: Subscriber<any>) => {
    subscribers.add(subscriber);
    return () => subscribers.delete(subscriber);
  };

  (proxy as any).$subscribers = subscribers;

  return proxy;
}

/**
 * Crée une valeur réactive simple (ref)
 */
export function ref<T>(initialValue: T) {
  const subscribers = new Set<Subscriber<T>>();

  let _value = initialValue;

  return {
    get value(): T {
      return _value;
    },

    set value(newValue: T) {
      if (_value === newValue) return;
      const oldValue = _value;
      _value = newValue;
      subscribers.forEach(sub => sub(newValue, oldValue, 'value'));
    },

    subscribe(subscriber: Subscriber<T>): () => void {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    }
  };
}

/**
 * Crée une valeur calculée (computed)
 */
export function computed<T>(getter: () => T, deps: any[] = []) {
  const subscribers = new Set<Subscriber<T>>();
  let cachedValue: T;
  let isDirty = true;

  // Observer les dépendances
  deps.forEach(dep => {
    if (dep && typeof dep === 'object' && '$subscribe' in dep) {
      (dep as any).$subscribe(() => {
        isDirty = true;
        const newValue = getter();
        if (newValue !== cachedValue) {
          const oldValue = cachedValue;
          cachedValue = newValue;
          subscribers.forEach(sub => sub(newValue, oldValue, 'computed'));
        }
      });
    }
  });

  return {
    get value(): T {
      if (isDirty) {
        cachedValue = getter();
        isDirty = false;
      }
      return cachedValue;
    },

    subscribe(subscriber: Subscriber<T>): () => void {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    }
  };
}

/**
 * Observe les changements sur un objet réactif
 */
export function watch<T>(
  source: { value: T } | (() => T),
  callback: (newValue: T, oldValue: T) => void,
  options: { immediate?: boolean } = {}
) {
  let oldValue: T;

  const getter = typeof source === 'function' ? source : () => source.value;

  const run = () => {
    const newValue = getter();
    if (newValue !== oldValue) {
      callback(newValue, oldValue);
      oldValue = newValue;
    }
  };

  if (options.immediate) {
    oldValue = getter();
    callback(oldValue, undefined as any);
  }

  // Si c'est un ref ou reactive, s'abonner
  if (typeof source === 'object' && 'subscribe' in source) {
    return (source as any).subscribe((newVal: T, oldVal: T) => {
      callback(newVal, oldVal);
    });
  }

  return () => {}; // Cleanup function
}

/**
 * Batch multiple updates pour éviter les re-renders multiples
 */
let batchQueue: (() => void)[] = [];
let isBatching = false;

export function batch(fn: () => void) {
  if (isBatching) {
    batchQueue.push(fn);
    return;
  }

  isBatching = true;
  fn();

  while (batchQueue.length > 0) {
    const queued = batchQueue.shift();
    queued?.();
  }

  isBatching = false;
}

/**
 * Crée un effet qui s'exécute quand les dépendances changent
 */
export function effect(fn: () => void | (() => void)) {
  let cleanup: (() => void) | void;

  const run = () => {
    if (cleanup) cleanup();
    cleanup = fn();
  };

  run();

  return () => {
    if (cleanup) cleanup();
  };
}
