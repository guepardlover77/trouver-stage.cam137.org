// ============================================================================
// Composant d'authentification admin
// ============================================================================

const ADMIN_CODE_KEY = 'admin_code_hash';
const SESSION_KEY = 'admin_session';
const DEFAULT_CODE = 'admin2024';

/**
 * Hash simple pour le code d'accès (non cryptographique, juste obfuscation)
 */
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

/**
 * Vérifie si le code stocké existe, sinon initialise avec le défaut
 */
function ensureCodeExists(): void {
  if (!localStorage.getItem(ADMIN_CODE_KEY)) {
    localStorage.setItem(ADMIN_CODE_KEY, hashCode(DEFAULT_CODE));
  }
}

/**
 * Vérifie si l'utilisateur est authentifié pour la session
 */
export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

/**
 * Vérifie le code d'accès
 */
export function verifyCode(code: string): boolean {
  ensureCodeExists();
  const storedHash = localStorage.getItem(ADMIN_CODE_KEY);
  return hashCode(code) === storedHash;
}

/**
 * Authentifie l'utilisateur pour la session
 */
export function authenticate(code: string): boolean {
  if (verifyCode(code)) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    return true;
  }
  return false;
}

/**
 * Déconnecte l'utilisateur
 */
export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Change le code d'accès
 */
export function changeCode(oldCode: string, newCode: string): boolean {
  if (!verifyCode(oldCode)) {
    return false;
  }
  if (newCode.length < 4) {
    return false;
  }
  localStorage.setItem(ADMIN_CODE_KEY, hashCode(newCode));
  return true;
}

/**
 * Crée le modal d'authentification
 */
export function createAuthModal(onSuccess: () => void): HTMLElement {
  const modal = document.createElement('div');
  modal.className = 'admin-auth-modal';
  modal.innerHTML = `
    <div class="admin-auth-content">
      <div class="admin-auth-header">
        <i class="fas fa-lock"></i>
        <h3>Accès Administration</h3>
      </div>
      <p class="admin-auth-desc">Entrez le code d'accès pour gérer les lieux de stage.</p>
      <div class="admin-auth-input-group">
        <input type="password"
               class="admin-auth-input"
               placeholder="Code d'accès"
               autocomplete="off"
               id="adminCodeInput">
        <button type="button" class="admin-auth-toggle" title="Afficher/masquer">
          <i class="fas fa-eye"></i>
        </button>
      </div>
      <p class="admin-auth-error" style="display: none;">
        <i class="fas fa-exclamation-circle"></i>
        Code incorrect
      </p>
      <div class="admin-auth-buttons">
        <button type="button" class="admin-auth-btn admin-auth-btn-cancel">
          Annuler
        </button>
        <button type="button" class="admin-auth-btn admin-auth-btn-submit">
          <i class="fas fa-unlock"></i> Valider
        </button>
      </div>
    </div>
  `;

  const input = modal.querySelector('.admin-auth-input') as HTMLInputElement;
  const toggleBtn = modal.querySelector('.admin-auth-toggle') as HTMLButtonElement;
  const errorEl = modal.querySelector('.admin-auth-error') as HTMLElement;
  const cancelBtn = modal.querySelector('.admin-auth-btn-cancel') as HTMLButtonElement;
  const submitBtn = modal.querySelector('.admin-auth-btn-submit') as HTMLButtonElement;

  // Toggle password visibility
  toggleBtn.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggleBtn.innerHTML = `<i class="fas fa-eye${isPassword ? '-slash' : ''}"></i>`;
  });

  // Validate on submit
  const validate = () => {
    const code = input.value.trim();
    if (authenticate(code)) {
      modal.remove();
      onSuccess();
    } else {
      errorEl.style.display = 'flex';
      input.classList.add('error');
      input.focus();
      input.select();
    }
  };

  submitBtn.addEventListener('click', validate);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validate();
    }
    // Clear error on input
    errorEl.style.display = 'none';
    input.classList.remove('error');
  });

  // Cancel
  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Focus input when shown
  setTimeout(() => input.focus(), 100);

  return modal;
}

/**
 * Affiche le modal d'authentification si nécessaire
 */
export function requireAuth(onSuccess: () => void): void {
  if (isAuthenticated()) {
    onSuccess();
    return;
  }

  const modal = createAuthModal(onSuccess);
  document.body.appendChild(modal);
}

/**
 * Crée le formulaire de changement de code
 */
export function createChangeCodeForm(container: HTMLElement): void {
  container.innerHTML = `
    <div class="admin-change-code">
      <h4><i class="fas fa-key"></i> Changer le code d'accès</h4>
      <div class="admin-form-group">
        <label for="oldCodeInput">Code actuel</label>
        <input type="password" id="oldCodeInput" class="admin-input" autocomplete="off">
      </div>
      <div class="admin-form-group">
        <label for="newCodeInput">Nouveau code (min. 4 caractères)</label>
        <input type="password" id="newCodeInput" class="admin-input" autocomplete="off">
      </div>
      <div class="admin-form-group">
        <label for="confirmCodeInput">Confirmer le nouveau code</label>
        <input type="password" id="confirmCodeInput" class="admin-input" autocomplete="off">
      </div>
      <p class="admin-change-code-message" style="display: none;"></p>
      <button type="button" class="admin-btn admin-btn-primary" id="changeCodeBtn">
        <i class="fas fa-save"></i> Enregistrer
      </button>
    </div>
  `;

  const oldInput = container.querySelector('#oldCodeInput') as HTMLInputElement;
  const newInput = container.querySelector('#newCodeInput') as HTMLInputElement;
  const confirmInput = container.querySelector('#confirmCodeInput') as HTMLInputElement;
  const messageEl = container.querySelector('.admin-change-code-message') as HTMLElement;
  const submitBtn = container.querySelector('#changeCodeBtn') as HTMLButtonElement;

  submitBtn.addEventListener('click', () => {
    const oldCode = oldInput.value.trim();
    const newCode = newInput.value.trim();
    const confirmCode = confirmInput.value.trim();

    messageEl.style.display = 'block';

    if (!oldCode || !newCode || !confirmCode) {
      messageEl.className = 'admin-change-code-message error';
      messageEl.textContent = 'Tous les champs sont obligatoires';
      return;
    }

    if (newCode !== confirmCode) {
      messageEl.className = 'admin-change-code-message error';
      messageEl.textContent = 'Les codes ne correspondent pas';
      return;
    }

    if (newCode.length < 4) {
      messageEl.className = 'admin-change-code-message error';
      messageEl.textContent = 'Le nouveau code doit faire au moins 4 caractères';
      return;
    }

    if (changeCode(oldCode, newCode)) {
      messageEl.className = 'admin-change-code-message success';
      messageEl.textContent = 'Code modifié avec succès';
      oldInput.value = '';
      newInput.value = '';
      confirmInput.value = '';
    } else {
      messageEl.className = 'admin-change-code-message error';
      messageEl.textContent = 'Code actuel incorrect';
    }
  });
}
