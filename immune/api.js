/* 统一数据层客户端。所有页面只通过这里读写 node。 */
const API = (() => {
  const base = '';
  let cache = null;
  let STATIC = false;                       // 没有后端时自动翻成 true
  const LKEY = 'labos_local_v1';            // 手机上改的东西存这儿
  const readLocal = () => { try { return JSON.parse(localStorage.getItem(LKEY) || '{}'); } catch (e) { return {}; } };
  const writeLocal = o => { try { localStorage.setItem(LKEY, JSON.stringify(o)); } catch (e) {} };
  const putLocal = n => { const o = readLocal(); o[n.id] = n; writeLocal(o); };
  const delLocal = id => { const o = readLocal(); o[id] = null; writeLocal(o); };
  const applyLocal = ns => {                // 把本地改动盖到打包数据上
    const o = readLocal(); const ks = Object.keys(o);
    if (!ks.length) return ns;
    const m = new Map(ns.map(n => [n.id, n]));
    ks.forEach(k => { if (o[k] === null) m.delete(k); else m.set(k, o[k]); });
    return (cache = [...m.values()]);
  };
  const j = async (u, o) => {
    const r = await fetch(base + u, o);
    if (!r.ok) throw new Error(u + ' ' + r.status);
    return r.json();
  };
  const today = () => new Date().toLocaleDateString('sv');   // YYYY-MM-DD 本地时区

  return {
    today,
    /* ---- 读 ---- */
    /* 静态版（GitHub Pages 上没有 server.py）：先试后端，不通就读打包好的 nodes.json，
       手机上改的东西存在本浏览器里，不会串到 Mac 上。 */
    get static() { return STATIC; },
    async nodes(force) {
      if (cache && !force) return cache;
      if (!STATIC) {
        try { cache = await j('/api/nodes'); return applyLocal(cache); }
        catch (e) { STATIC = true; }
      }
      cache = await (await fetch('./nodes.json')).json();
      return applyLocal(cache);
    },
    async byId(id) { return (await this.nodes()).find(n => n.id === id); },
    async ofType(t) {
      const ts = [].concat(t);
      return (await this.nodes()).filter(n => ts.includes(n.type));
    },
    async search(q, limit = 40) {
      q = (q || '').trim().toLowerCase();
      const ns = await this.nodes();
      if (!q) return ns.slice(0, limit);
      const hit = n => {
        const s = [n.title, n.en, n.body, (n.tags || []).join(' ')].join(' ').toLowerCase();
        return s.includes(q);
      };
      return ns.filter(hit)
        .sort((a, b) => (b.title || '').toLowerCase().startsWith(q) -
                        (a.title || '').toLowerCase().startsWith(q))
        .slice(0, limit);
    },
    /* ---- 写 ---- */
    async save(node) {
      if (STATIC) { putLocal(node); cache = null;
        dispatchEvent(new CustomEvent('lab:changed', { detail: node })); return node; }
      const r = await j('/api/nodes', { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(node) });
      cache = null;
      dispatchEvent(new CustomEvent('lab:changed', { detail: node }));
      return r;
    },
    async remove(id) {
      if (STATIC) { delLocal(id); cache = null;
        dispatchEvent(new CustomEvent('lab:changed', { detail: { id } })); return { ok: true }; }
      const r = await j('/api/nodes/' + encodeURIComponent(id), { method: 'DELETE' });
      cache = null; dispatchEvent(new CustomEvent('lab:changed', { detail: { id } }));
      return r;
    },
    /* 手机上攒的改动，导出来回家合并 */
    exportLocal() { return JSON.stringify(readLocal(), null, 1); },
    clearLocal() { localStorage.removeItem(LKEY); cache = null; },
    /* 连边：在 from 上加一条指向 to 的边，重复不加 */
    async link(fromId, toId, rel = 'related', note = '') {
      const n = await this.byId(fromId);
      if (!n) throw new Error('没有 ' + fromId);
      n.links = n.links || [];
      if (!n.links.some(l => l.to === toId && l.rel === rel))
        n.links.push({ to: toId, rel, note });
      return this.save(n);
    },
    /* ---- 附属 ---- */
    papers: () => STATIC ? Promise.resolve([]) : j('/api/papers'),
    state: k => STATIC ? Promise.resolve(JSON.parse(localStorage.getItem('labstate:' + k) || 'null'))
                       : j('/api/state/' + k),
    setState: (k, v) => STATIC ? (localStorage.setItem('labstate:' + k, JSON.stringify(v)), Promise.resolve(v))
                               : j('/api/state/' + k, { method: 'PUT',
                                   headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }),
    async upload(files) {
      if (STATIC) throw new Error('静态版不能上传文件，回 Mac 上传');
      const fd = new FormData();
      [...files].forEach(f => fd.append('file', f));
      return j('/api/upload', { method: 'POST', body: fd });
    },
    /* ---- 每日指标：今天新增了几条边 / 几个 node ---- */
    async pulse(date) {
      const d = date || today(); const ns = await this.nodes();
      const made = ns.filter(n => (n.created || '') === d).length;
      const touched = ns.filter(n => (n.updated || '').startsWith(d)).length;
      return { made, touched };
    },
    uid: p => p + ':' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    esc: s => (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    /* 够用的 markdown：粗体、行内代码、代码块、表格。表格必须能渲染，
       不然贴进来的对照表会变成一堆竖线。 */
    md: s => {
      if (s == null) return '';
      const inline = t => API.esc(t)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      const lines = String(s).split('\n');
      const out = [];
      let i = 0;
      while (i < lines.length) {
        const L = lines[i];
        if (/^\s*```/.test(L)) {                       /* 代码块：原样等宽 */
          const buf = []; i++;
          while (i < lines.length && !/^\s*```/.test(lines[i])) buf.push(lines[i++]);
          i++;
          out.push('<pre class="mdpre">' + API.esc(buf.join('\n')) + '</pre>');
          continue;
        }
        if (/^\s*\|.*\|\s*$/.test(L) && i + 1 < lines.length &&
            /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {          /* 表格 */
          const cells = r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
          const head = cells(L); i += 2;
          const rows = [];
          while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
          out.push('<table class="mdt"><thead><tr>' +
            head.map(c => '<th>' + inline(c) + '</th>').join('') +
            '</tr></thead><tbody>' +
            rows.map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') +
            '</tbody></table>');
          continue;
        }
        const buf = [];
        while (i < lines.length && !/^\s*(```|\|)/.test(lines[i])) buf.push(lines[i++]);
        const txt = buf.join('\n').trim();
        if (txt) out.push('<p class="mdp">' + inline(txt).replace(/\n/g, '<br>') + '</p>');
      }
      return out.join('');
    }
  };
})();
