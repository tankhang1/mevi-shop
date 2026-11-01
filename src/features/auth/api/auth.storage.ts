const TOKEN_KEY = 'accessToken';
const REDIRECT_KEY = 'redirect_path';
export const SELECTED_WORKSPACE_STORAGE_KEY = 'selectedWorkspaceId';

// sessionStorage: one session per tab, cleared when the tab closes.
export const authStorage = {
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  /** Also drops the selected workspace. */
  clearToken: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SELECTED_WORKSPACE_STORAGE_KEY);
  },

  getWorkspaceId: () => sessionStorage.getItem(SELECTED_WORKSPACE_STORAGE_KEY),
  setWorkspaceId: (id: string | number | null) => {
    if (id === null) sessionStorage.removeItem(SELECTED_WORKSPACE_STORAGE_KEY);
    else sessionStorage.setItem(SELECTED_WORKSPACE_STORAGE_KEY, String(id));
  },

  getRedirectPath: () => sessionStorage.getItem(REDIRECT_KEY),
  setRedirectPath: (path: string) => sessionStorage.setItem(REDIRECT_KEY, path),
  clearRedirectPath: () => sessionStorage.removeItem(REDIRECT_KEY),
};
