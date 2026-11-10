/* RetailVerse API client. The FastAPI service is the source of truth when available. */
(() => {
  const configured = window.RETAILVERSE_API_BASE;
  const base = (configured || (location.port === '5173' ? 'http://localhost:8000' : '')).replace(/\/$/, '');
  async function request(path, { method = 'GET', body, query } = {}) {
    const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null)).toString() : '';
    const response = await fetch(`${base}/api${path}${qs}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Role': window.RetailVerseRole?.() || 'marketing' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || `API request failed (${response.status})`);
    return data;
  }
  const enc = encodeURIComponent;
  const api = {
    base,
    request,
    health: () => request('/health'), llm: () => request('/llm'), meta: () => request('/meta'), reset: () => request('/reset', { method: 'POST' }),
    plan: () => request('/plan'), createItem: body => request('/plan/items', { method: 'POST', body }),
    patchItem: (id, body) => request(`/plan/items/${enc(id)}`, { method: 'PATCH', body }), deleteItem: id => request(`/plan/items/${enc(id)}`, { method: 'DELETE' }),
    undo: () => request('/plan/undo', { method: 'POST' }), redo: () => request('/plan/redo', { method: 'POST' }), audit: limit => request('/audit', { query: { limit } }),
    forecast: query => request('/forecast', { query }), inventory: query => request('/inventory', { query }), segments: () => request('/segments'), marketPulse: () => request('/market-pulse'),
    simulate: body => request('/simulate', { method: 'POST', body }), optimize: body => request('/optimize', { method: 'POST', body }),
    constraints: item_id => request('/constraints', { query: { item_id } }), conflicts: () => request('/conflicts'),
    suggestTransfer: item_id => request('/transfers/suggest', { query: { item_id } }), explainDiscount: (item_id, levels) => request('/explain/discount', { query: { item_id, levels: levels?.join(',') } }),
    chat: body => request('/copilot/chat', { method: 'POST', body }), chatHistory: () => request('/copilot/history'), proposals: status => request('/proposals', { query: { status } }),
    proposal: id => request(`/proposals/${enc(id)}`), acceptChange: (pid, cid, patch) => request(`/proposals/${enc(pid)}/changes/${enc(cid)}/accept`, { method: 'POST', body: patch ? { patch } : {} }),
    rejectChange: (pid, cid) => request(`/proposals/${enc(pid)}/changes/${enc(cid)}/reject`, { method: 'POST' }),
    acceptProposal: id => request(`/proposals/${enc(id)}/accept`, { method: 'POST' }), rejectProposal: id => request(`/proposals/${enc(id)}/reject`, { method: 'POST' }),
    simulation: (id, runs = 2000) => request(`/simulation/${enc(id)}`, { query: { runs } }), stress: body => request('/simulation/stress', { method: 'PUT', body }),
    crisis: id => request(`/simulation/${enc(id)}/crisis`, { method: 'POST' }), clearCrisis: () => request('/simulation/crisis', { method: 'DELETE' }),
    approvals: () => request('/approvals'), approval: id => request(`/approvals/${enc(id)}`), readiness: (id, body) => request(`/approvals/${enc(id)}/readiness`, { method: 'PATCH', body }),
    submitApproval: id => request(`/approvals/${enc(id)}/submit`, { method: 'POST' }), override: (id, reason) => request(`/approvals/${enc(id)}/override`, { method: 'POST', body: { reason } }),
    approve: id => request(`/approvals/${enc(id)}/approve`, { method: 'POST' }), rejectApproval: (id, reason) => request(`/approvals/${enc(id)}/reject`, { method: 'POST', body: { reason } }),
    goLive: id => request(`/approvals/${enc(id)}/go-live`, { method: 'POST' }), creativeDraft: (item_id, tone) => request('/creative/draft', { method: 'POST', body: { item_id, tone } }),
    creativeCheck: (text, item_id) => request('/creative/check', { method: 'POST', body: { text, item_id } }),
    warroom: () => request('/warroom'), warStep: () => request('/warroom/step', { method: 'POST' }), warTransferSim: () => request('/warroom/transfer/simulate', { method: 'POST' }),
    warTransferApprove: () => request('/warroom/transfer/approve', { method: 'POST' }), warReset: () => request('/warroom/reset', { method: 'POST' }),
    learning: () => request('/learning'), addLearningGuardrail: () => request('/learning/guardrail', { method: 'POST' }),
    governance: () => request('/governance'), updateGovernance: body => request('/governance', { method: 'PUT', body }), governanceTest: body => request('/governance/test', { method: 'POST', body }),
    control: () => request('/control'), executiveBrief: () => request('/control/executive-brief')
  };
  window.RetailVerseAPI = api;
})();
