// Particle pool — tears, dust, bubbles, sparkles, petals, confetti.
var Particles = (function () {
  var list = [];
  // assigned by level scenes: called when a tear lands on the ground (bloom checks)
  var onTearLand = null;

  function spawn(o) {
    list.push({
      x: o.x, y: o.y, vx: o.vx || 0, vy: o.vy || 0, g: o.g || 0,
      life: o.life || 60, t: 0, w: o.w || 1, h: o.h || 1,
      col: o.col || '#fff', type: o.type || 'rect', drag: o.drag || 1
    });
  }

  // ---- recipes ----
  function tear(x, y) {
    spawn({ x: x, y: y, vx: (Math.random() - 0.5) * 0.5, vy: 0.3, g: 0.09,
            life: 120, w: 1, h: 2, col: PAL.tear, type: 'tear' });
  }
  function splash(x, y) {
    for (var i = 0; i < 3; i++)
      spawn({ x: x, y: y, vx: (Math.random() - 0.5) * 1.2, vy: -Math.random() * 0.8,
              g: 0.08, life: 18, col: PAL.tearD });
  }
  function dust(x, y) {
    spawn({ x: x, y: y, vx: (Math.random() - 0.5) * 0.6, vy: -0.2 - Math.random() * 0.3,
            g: -0.005, life: 25, col: rgba(PAL.cream, 0.7), w: 2, h: 2, drag: 0.95 });
  }
  function sparkle(x, y, col) {
    spawn({ x: x, y: y, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8,
            life: 30 + Math.random() * 20, col: col || PAL.gold, type: 'sparkle' });
  }
  function bubble(x, y) {
    spawn({ x: x, y: y, vx: (Math.random() - 0.5) * 0.3, vy: -0.4 - Math.random() * 0.4,
            life: 80, col: rgba(PAL.tear, 0.6), type: 'bubble', w: 2 + (Math.random() * 3 | 0) });
  }
  function poof(x, y) {
    for (var i = 0; i < 8; i++)
      spawn({ x: x, y: y, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
              life: 25, col: PAL.peteGrey, w: 2, h: 2, drag: 0.9 });
  }
  function petal(x, y) {
    spawn({ x: x, y: y, vx: (Math.random() - 0.5) * 0.8, vy: -0.5 - Math.random(),
            g: 0.02, life: 70, col: PAL.petal, w: 2, h: 2, drag: 0.98 });
  }
  function heartFx(x, y) {
    spawn({ x: x, y: y, vx: (Math.random() - 0.5) * 0.4, vy: -0.5,
            life: 50, col: PAL.heartRed, type: 'heart' });
  }
  function updraftStreak(x, y) {
    spawn({ x: x, y: y, vx: 0, vy: -2.5 - Math.random() * 2, life: 30,
            col: rgba(PAL.white, 0.5), w: 1, h: 6 });
  }
  function confetti(x, y) {
    var cols = [PAL.gold, PAL.petal, PAL.tear, PAL.pickleL, PAL.cheeto];
    spawn({ x: x, y: y, vx: (Math.random() - 0.5) * 2, vy: -1 - Math.random() * 2,
            g: 0.05, life: 90, col: cols[(Math.random() * cols.length) | 0], w: 2, h: 2, drag: 0.99 });
  }

  function update(level) {
    for (var i = list.length - 1; i >= 0; i--) {
      var p = list[i];
      p.t++;
      p.vx *= p.drag; p.vy *= p.drag;
      p.vy += p.g;
      p.x += p.vx; p.y += p.vy;
      if (p.type === 'tear' && level && p.vy > 0 && level.solidAtPx(p.x, p.y + 2)) {
        splash(p.x, p.y);
        if (onTearLand) onTearLand(p.x, p.y);
        AudioSys.sfx('splash');
        list.splice(i, 1);
        continue;
      }
      if (p.t >= p.life) list.splice(i, 1);
    }
  }

  function render(ctx) {
    for (var i = 0; i < list.length; i++) {
      var p = list[i], x = Math.round(p.x), y = Math.round(p.y);
      if (p.type === 'sparkle') {
        drawSpr(ctx, 'sparkle', (p.t >> 3) & 1, x - 2, y - 2);
      } else if (p.type === 'bubble') {
        ctx.strokeStyle = p.col;
        ctx.strokeRect(x - p.w / 2, y - p.w / 2, p.w, p.w);
      } else if (p.type === 'heart') {
        drawSpr(ctx, 'heart', 0, x - 3, y - 3);
      } else {
        ctx.fillStyle = p.col;
        ctx.fillRect(x, y, p.w, p.h);
      }
    }
  }

  return {
    spawn: spawn, tear: tear, splash: splash, dust: dust, sparkle: sparkle,
    bubble: bubble, poof: poof, petal: petal, heartFx: heartFx,
    updraftStreak: updraftStreak, confetti: confetti,
    update: update, render: render,
    clear: function () { list = []; },
    setTearHandler: function (fn) { onTearLand = fn; },
    count: function () { return list.length; }
  };
})();
