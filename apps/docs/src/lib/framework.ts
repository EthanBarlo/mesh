// The site-wide framework choice. Shared by the home page's switch and the
// docs' <Frameworks> tabs (Fumadocs groupId "framework", persisted), so a
// choice made on one carries into the other. Not a client module: the root
// layout inlines `frameworkScript`.

export const frameworkIds = ['react', 'vue', 'svelte'] as const;
export type FrameworkId = (typeof frameworkIds)[number];

/** Storage key; Fumadocs uses the tab groupId. */
export const frameworkKey = 'framework';

/**
 * Runs in <head> before first paint: copies the stored choice onto
 * <html data-framework> so CSS can show the matching variant before React
 * hydrates. Reads storage the way Fumadocs' tabs do (session, then local).
 */
export const frameworkScript = `try{var k=${JSON.stringify(frameworkKey)},v=sessionStorage.getItem(k);if(v===null)v=localStorage.getItem(k);if(v==="react"||v==="vue"||v==="svelte")document.documentElement.setAttribute("data-framework",v)}catch(e){}`;
