// src/core/ModuleRegistry.js
export const ModuleRegistry = {
  _modules: new Map(),

  register(module) {
    if (!module.id || !module.view) throw new Error(`[ModuleRegistry] Module missing: id, view`);
    this._modules.set(module.id, { nav: true, ...module });
    return this;
  },

  getNavItems() {
    return [...this._modules.values()].filter(m => m.nav !== false);
  },

  renderView(viewId, state) {
    const module = this._modules.get(viewId);
    if (!module) {
      console.warn(`[ModuleRegistry] Unknown view: "${viewId}"`);
      return `<div style="padding:40px;opacity:0.4;font-size:0.75rem;">MODUL NICHT GEFUNDEN: ${viewId}</div>`;
    }
    return module.view(state);
  },

  activate(viewId)   { this._modules.get(viewId)?.onActivate?.(); },
  deactivate(viewId) { this._modules.get(viewId)?.onDeactivate?.(); },
  has(viewId)        { return this._modules.has(viewId); },
};
