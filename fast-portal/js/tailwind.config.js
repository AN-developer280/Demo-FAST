/* Tailwind (CDN) config: colours come from the CSS variables in css/theme.css, so light/dark themes still work. Preflight is off so our own CSS is not reset. */
tailwind.config={corePlugins:{preflight:false},theme:{extend:{colors:{fast:{ac:'var(--ac)',ac2:'var(--ac2)',bd:'var(--bd)',mu:'var(--mu)',pr:'var(--pr)',tx:'var(--tx)'}}}}};
