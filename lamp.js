(function () {
  function mix(a, b, t) { return a.map((v, i) => Math.round(v + (b[i] - v) * t)); }
  function rgb(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a == null ? 1 : a) + ')'; }
  function Lamp(cv, o) {
    o = o || {};
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const s = { on: !!o.on, g: o.on ? 1 : 0, p: null, v: { x: 0, y: 0 }, drag: false, t: 0, hover: false, blinkT: 2 + Math.random() * 3, blink: 0, flick: 0 };
    const c = cv.getContext('2d'); let w = 0, h = 0, G = null, raf = 0, last = performance.now(), dead = false;
    function size() { const r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); w = r.width; h = r.height; cv.width = Math.max(1, w * d); cv.height = Math.max(1, h * d); c.setTransform(d, 0, 0, d, 0, 0); geo(); }
    function geo() {
      const k = Math.min(w / 420, h / 520) * (o.scale || 1), bx = w * (o.cx || 0.5), by = h * (o.baseY || 0.9), st = by - 330 * k, sb = st + 120 * k;
      const anchor = { x: bx + 70 * k, y: sb - 4 * k }, L = 115 * k;
      G = { k, bx, by, st, sb, anchor, L, rest: { x: anchor.x, y: anchor.y + L } };
      if (!s.p) s.p = { x: G.rest.x, y: G.rest.y };
    }
    const ro = window.ResizeObserver ? new ResizeObserver(size) : null; ro ? ro.observe(cv) : window.addEventListener('resize', size); size();
    function pt(e) { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function near(q) { return Math.hypot(q.x - s.p.x, q.y - s.p.y) < 26 * G.k + 12; }
    function toggle(v) { s.on = v == null ? !s.on : !!v; s.flick = s.on ? 1 : 0; if (o.onToggle) o.onToggle(s.on); }
    function down(e) { const q = pt(e); if (!near(q)) return; s.drag = true; s.moved = 0; s.start = q; try { cv.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); }
    function move(e) {
      const q = pt(e); s.hover = near(q); cv.style.cursor = s.drag ? 'grabbing' : s.hover ? 'grab' : 'default';
      if (!s.drag) return; s.moved = Math.max(s.moved, Math.hypot(q.x - s.start.x, q.y - s.start.y));
      const A = G.anchor, k = G.k; s.p = { x: Math.max(A.x - 60 * k, Math.min(A.x + 60 * k, q.x)), y: Math.max(A.y + 40 * k, Math.min(A.y + G.L + 90 * k, q.y)) };
    }
    function up() { if (!s.drag) return; s.drag = false; const pulled = s.p.y - G.rest.y; if (pulled > 28 * G.k || s.moved < 4) { toggle(); s.v.y = -6; } }
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.style.touchAction = 'none';
    function frame(now) {
      if (dead) return; raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now; s.t += dt;
      const r = cv.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      if (!G || Math.abs(r.width - w) > 1 || Math.abs(r.height - h) > 1) size();
      s.g += ((s.on ? 1 : 0) - s.g) * (reduce ? 1 : Math.min(1, dt * 6));
      if (!s.drag) { const K = 70, D = 7; for (let i = 0; i < 2; i++) { const ax = -K * (s.p.x - G.rest.x) - D * s.v.x, ay = -K * (s.p.y - G.rest.y) - D * s.v.y; s.v.x += ax * dt / 2; s.v.y += ay * dt / 2; s.p.x += s.v.x * dt * 60 / 2; s.p.y += s.v.y * dt * 60 / 2; } }
      s.blinkT -= dt; if (s.blinkT < 0) { s.blink = 1; s.blinkT = 2.5 + Math.random() * 3.5; } s.blink = Math.max(0, s.blink - dt * 7);
      s.flick = Math.max(0, s.flick - dt * 2.2);
      draw();
    }
    function draw() {
      const { k, bx, by, st, sb, anchor } = G, t = s.t; let g = s.g;
      if (s.flick > 0.55 && !reduce) g *= (Math.sin(t * 90) > 0 ? 1 : 0.45);
      c.clearRect(0, 0, w, h);
      if (g > 0.01) {
        const rg = c.createRadialGradient(bx, sb, 0, bx, sb, Math.max(w, h) * 1.1); rg.addColorStop(0, 'rgba(120,230,255,' + 0.22 * g + ')'); rg.addColorStop(0.5, 'rgba(63,160,255,' + 0.08 * g + ')'); rg.addColorStop(1, 'rgba(63,160,255,0)'); c.fillStyle = rg; c.fillRect(0, 0, w, h);
        c.beginPath(); c.moveTo(bx - 108 * k, sb); c.lineTo(bx + 108 * k, sb); c.lineTo(bx + 270 * k, by + 14 * k); c.lineTo(bx - 270 * k, by + 14 * k); c.closePath();
        const cg = c.createLinearGradient(0, sb, 0, by + 14 * k); cg.addColorStop(0, 'rgba(210,248,255,' + 0.38 * g + ')'); cg.addColorStop(1, 'rgba(120,220,255,' + 0.04 * g + ')'); c.fillStyle = cg; c.fill();
        const fg = c.createRadialGradient(bx, by, 0, bx, by, 300 * k); fg.addColorStop(0, 'rgba(160,240,255,' + 0.3 * g + ')'); fg.addColorStop(1, 'rgba(160,240,255,0)'); c.fillStyle = fg; c.save(); c.translate(bx, by); c.scale(1, 0.18); c.beginPath(); c.arc(0, 0, 300 * k, 0, 6.283); c.restore(); c.fill();
      }
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.save(); c.translate(bx, by + 8 * k); c.scale(1, 0.2); c.beginPath(); c.arc(0, 0, 90 * k, 0, 6.283); c.restore(); c.fill();
      const sg = c.createLinearGradient(bx - 6 * k, 0, bx + 6 * k, 0); sg.addColorStop(0, '#16264F'); sg.addColorStop(0.5, rgb(mix([42, 66, 128], [120, 200, 255], g * 0.6))); sg.addColorStop(1, '#16264F');
      c.fillStyle = sg; c.fillRect(bx - 5 * k, sb - 6 * k, 10 * k, by - sb - 4 * k);
      c.fillStyle = '#1E3366'; c.beginPath(); c.arc(bx, sb + (by - sb) * 0.55, 9 * k, 0, 6.283); c.fill(); c.strokeStyle = 'rgba(190,220,255,0.3)'; c.lineWidth = 1; c.stroke();
      const bg = c.createLinearGradient(0, by - 16 * k, 0, by + 10 * k); bg.addColorStop(0, '#22386E'); bg.addColorStop(1, '#0B1430');
      c.fillStyle = bg; c.beginPath(); c.ellipse(bx, by - 2 * k, 76 * k, 16 * k, 0, 0, 6.283); c.fill(); c.strokeStyle = 'rgba(150,190,255,0.35)'; c.stroke();
      c.fillStyle = rgb([190, 230, 255], 0.12 + 0.25 * g); c.beginPath(); c.ellipse(bx, by - 6 * k, 56 * k, 8 * k, 0, 0, 6.283); c.fill();
      c.fillStyle = rgb([235, 252, 255], 0.12 + 0.88 * g); c.beginPath(); c.ellipse(bx, sb, 104 * k, 12 * k, 0, 0, 6.283); c.fill();
      const tw = 50 * k, bw = 116 * k, r0 = 10 * k;
      c.beginPath(); c.moveTo(bx - tw + r0, st); c.lineTo(bx + tw - r0, st); c.quadraticCurveTo(bx + tw, st, bx + tw + 2 * k, st + r0); c.lineTo(bx + bw, sb - 4 * k); c.quadraticCurveTo(bx + bw + 2 * k, sb, bx + bw - 6 * k, sb); c.lineTo(bx - bw + 6 * k, sb); c.quadraticCurveTo(bx - bw - 2 * k, sb, bx - bw, sb - 4 * k); c.lineTo(bx - tw - 2 * k, st + r0); c.quadraticCurveTo(bx - tw, st, bx - tw + r0, st); c.closePath();
      const hg = c.createLinearGradient(0, st, 0, sb); hg.addColorStop(0, rgb(mix([24, 40, 84], [47, 120, 255], g))); hg.addColorStop(1, rgb(mix([14, 24, 56], [127, 231, 255], g)));
      c.fillStyle = hg; c.shadowColor = rgb([63, 224, 255], 0.8 * g); c.shadowBlur = 40 * g; c.fill(); c.shadowBlur = 0;
      c.strokeStyle = rgb([190, 220, 255], 0.3 + 0.4 * g); c.lineWidth = 1.5; c.stroke();
      c.save(); c.clip(); const sh = c.createLinearGradient(bx - bw, 0, bx + bw, 0); sh.addColorStop(0, 'rgba(255,255,255,0.10)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); c.fillStyle = sh; c.fillRect(bx - bw, st, bw * 2, sb - st); c.restore();
      const ey = st + 66 * k, ex = 24 * k, ink = g > 0.5 ? '#03122B' : '#7F9BCB';
      if (g > 0.5) {
        const sy = Math.max(0.1, 1 - s.blink);
        [-1, 1].forEach(d => { c.save(); c.translate(bx + d * ex, ey); c.scale(1, sy); c.fillStyle = ink; c.beginPath(); c.arc(0, 0, 6.5 * k, 0, 6.283); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(2 * k, -2 * k, 2 * k, 0, 6.283); c.fill(); c.restore(); });
        c.strokeStyle = ink; c.lineWidth = 2.4 * k; c.lineCap = 'round'; c.beginPath(); c.arc(bx, ey + 10 * k, 9 * k, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.35)'; [-1, 1].forEach(d => { c.beginPath(); c.ellipse(bx + d * (ex + 14 * k), ey + 12 * k, 7 * k, 4 * k, 0, 0, 6.283); c.fill(); });
      } else {
        c.strokeStyle = ink; c.lineWidth = 2.2 * k; c.lineCap = 'round';
        [-1, 1].forEach(d => { c.beginPath(); c.arc(bx + d * ex, ey - 2 * k, 6.5 * k, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); });
        c.beginPath(); c.moveTo(bx - 5 * k, ey + 16 * k); c.lineTo(bx + 5 * k, ey + 16 * k); c.stroke();
        if (!reduce) { const zt = (t * 0.5) % 1; c.fillStyle = 'rgba(160,190,240,' + (1 - zt) * 0.7 + ')'; c.font = '600 ' + Math.round(12 * k + zt * 6 * k) + 'px "Readex Pro", system-ui, sans-serif'; c.fillText('z', bx + bw * 0.55 + zt * 14 * k, st - zt * 30 * k); }
      }
      const P = s.p; c.strokeStyle = 'rgba(190,220,255,0.75)'; c.lineWidth = 1.6 * k; c.beginPath(); c.moveTo(anchor.x, anchor.y); c.quadraticCurveTo(anchor.x + (P.x - anchor.x) * 0.25, (anchor.y + P.y) / 2, P.x, P.y); c.stroke();
      const kr = 8 * k, kg = c.createRadialGradient(P.x - 2 * k, P.y - 2 * k, 0, P.x, P.y, kr * 1.4); kg.addColorStop(0, '#E6FBFF'); kg.addColorStop(0.5, '#3FE0FF'); kg.addColorStop(1, '#2F6BFF');
      if (s.hover || s.drag) { c.strokeStyle = 'rgba(63,224,255,0.45)'; c.lineWidth = 2; c.beginPath(); c.arc(P.x, P.y, kr + 7 * k, 0, 6.283); c.stroke(); }
      c.fillStyle = kg; c.shadowColor = '#3FE0FF'; c.shadowBlur = 14; c.beginPath(); c.arc(P.x, P.y + 2 * k, kr, 0, 6.283); c.fill(); c.shadowBlur = 0;
      if (!s.on && !s.drag) {
        const bob = reduce ? 0 : Math.sin(t * 3) * 4 * k, a = reduce ? 0.9 : 0.55 + 0.4 * Math.sin(t * 3);
        c.fillStyle = 'rgba(200,230,255,' + a + ')'; c.font = '500 ' + Math.max(12, Math.round(13 * k)) + 'px "Readex Pro", system-ui, sans-serif'; c.textAlign = 'left';
        c.fillText(o.hint || 'Pull the cord', P.x + 18 * k, P.y + 6 * k + bob);
        c.strokeStyle = 'rgba(200,230,255,' + a + ')'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(P.x + 4 * k, P.y + 20 * k + bob); c.lineTo(P.x + 4 * k, P.y + 34 * k + bob); c.lineTo(P.x, P.y + 29 * k + bob); c.moveTo(P.x + 4 * k, P.y + 34 * k + bob); c.lineTo(P.x + 8 * k, P.y + 29 * k + bob); c.stroke();
      }
    }
    raf = requestAnimationFrame(frame);
    return {
      setOn(v) { if (!!v !== s.on) toggle(v); },
      isOn() { return s.on; },
      destroy() { dead = true; cancelAnimationFrame(raf); ro && ro.disconnect(); cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); }
    };
  }
  window.WWLamp = Lamp;
})();
