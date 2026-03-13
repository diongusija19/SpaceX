const baseHref = document.querySelector('base')?.getAttribute('href') || '/';
const normalizedBase = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;

export const API_BASE = `${normalizedBase}api`;
