/**
 * The theme's storage key and the script that applies a stored choice. Kept apart
 * from `theme.ts` so the root layout, a server component, can import it without React hooks.
 */

export const THEME_STORAGE_KEY = "knowyou:theme";

/**
 * Runs in <head> before the body paints, so a stored choice never flashes the
 * other theme. Keep it in step with `readStored` and `apply` in `theme.ts`.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
