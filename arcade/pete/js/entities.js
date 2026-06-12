// All actors. Pete's "helicopter engine": rapid alternating left/right taps
// rock him side to side; enough rocking spins him up into flight.
var Entities = (function () {

  var PETE_LINES = ['I AM PETE', 'MR PETE', 'PETE PETE!', 'I AM PETE!!', 'IT IS I, PETE'];
  var PETE_HURT_LINES = ['OUCH...', 'PETE IS OK...', 'SNIFF...'];

  /* ============================ PETE ============================ */
  function makePete(x, y) {
    return {
      type: 'pete', x: x, y: y, w: 14, h: 20, vx: 0, vy: 0, dir: 1,
      state: 'ground', onGround: false,
      spin: 0, rotor: 0, lastTapDir: 0, lastTapTime: 0,
      tilt: 0, hearts: 3, maxHearts: 3,
      stamina: 100, exhausted: false,   // fluff — little arms tire fast
      invuln: 0, cryTimer: 0, barkCd: 0,
      controllable: true, faceOverride: -1, dead: false,
      inUpdraft: false
    };
  }

  function bark(p, line) {
    if (p.barkCd > 0) return;
    Dialogue.bark(p, line || PETE_LINES[(Math.random() * PETE_LINES.length) | 0]);
    p.barkCd = 110;
  }

  function hurtPete(p, n) {
    if (p.invuln > 0 || p.dead) return;
    p.hearts -= n;
    p.invuln = 120; p.cryTimer = 150;
    p.vx = -p.dir * 1.6; p.vy = -1.4;
    AudioSys.sfx('hurt');
    Cam.addShake(5);
    if (p.hearts <= 0) { p.dead = true; p.cryTimer = 9999; }
    else if (Math.random() < 0.7) {
      p.barkCd = 0;
      bark(p, PETE_HURT_LINES[(Math.random() * PETE_HURT_LINES.length) | 0]);
    }
  }

  function updatePete(p, lvl) {
    if (p.barkCd > 0) p.barkCd--;
    if (p.invuln > 0) p.invuln--;
    if (p.cryTimer > 0 && !p.dead) p.cryTimer--;

    // crying — tears fall from both stitched eyes
    if (p.cryTimer > 0 && Game.frame % 7 === 0) {
      Particles.tear(p.x + 3, p.y + 7);
      Particles.tear(p.x + 11, p.y + 7);
      if (Game.frame % 21 === 0) AudioSys.sfx('tear');
    }

    if (p.dead) { // sit and weep — scene runs the soft game-over
      p.vx *= 0.8; p.vy += 0.22; if (p.vy > 1.5) p.vy = 1.5;
      Physics.step(p, lvl);
      return;
    }

    var ctl = p.controllable && !Dialogue.busy();

    // ---- the wiggle tap detector ----
    var taps = ctl ? Input.consumeTaps() : [];
    for (var i = 0; i < taps.length; i++) {
      var tp = taps[i];
      var quick = (tp.time - p.lastTapTime) < 300;
      if (tp.dir !== p.lastTapDir && quick) {
        if (p.state === 'ground' && p.onGround) {
          p.spin = Math.min(100, p.spin + 17);
          AudioSys.sfx('wiggle');
          Particles.dust(p.x + 7 - tp.dir * 6, p.y + 19);
        } else if (p.state === 'heli') {
          p.rotor = Math.min(100, p.rotor + 13);
        }
      } else if (p.state === 'ground' && p.onGround) {
        p.spin = Math.min(100, p.spin + 4);
      }
      p.lastTapDir = tp.dir; p.lastTapTime = tp.time;
    }

    var L = ctl && Input.held('left'), R = ctl && Input.held('right');
    var U = ctl && Input.held('up'), D = ctl && Input.held('down');

    if (p.state === 'ground') {
      p.spin = Math.max(0, p.spin - 0.45);
      // catching his breath — fluff regenerates while grounded
      if (p.onGround) p.stamina = Math.min(100, p.stamina + 1.0);
      if (p.exhausted && p.stamina > 50) p.exhausted = false;
      var target = (R ? 0.9 : 0) - (L ? 0.9 : 0);
      if (p.spin > 25) target *= 0.25; // rocking in place beats walking
      p.vx += (target - p.vx) * 0.15;
      if (L) p.dir = -1; if (R) p.dir = 1;
      p.vy += 0.22;
      if (p.vy > 1.5) p.vy = 1.5; // plushes drift, they do not plummet

      if (p.spin >= 97) {
        if (p.stamina < 30) { // too puffed to lift off
          p.spin = 80;
          bark(p, 'HUFF... PUFF...');
        } else { // LIFTOFF
          p.state = 'heli'; p.rotor = 70; p.spin = 0; p.vy = -1.7;
          AudioSys.sfx('liftoff');
          p.barkCd = 0; bark(p);
          for (var d = 0; d < 8; d++) Particles.dust(p.x + 2 + Math.random() * 10, p.y + 18);
        }
      }

      // tilt: rocking > waddling > idle breathing
      if (p.spin > 4) p.tilt = Math.sin(Game.frame * 0.62) * (p.spin / 100) * 0.55;
      else if (Math.abs(p.vx) > 0.2 && p.onGround) p.tilt = Math.sin(Game.frame * 0.3) * 0.09;
      else p.tilt *= 0.8;
    } else if (p.state === 'heli') {
      p.rotor = Math.max(0, p.rotor - 0.25);
      // flying costs fluff — Jet Plane's wind costs nothing
      if (!p.inUpdraft) {
        p.stamina -= 0.55;
        if (p.stamina <= 0) {
          p.stamina = 0; p.rotor = 0;
          if (!p.exhausted) { p.exhausted = true; p.barkCd = 0; bark(p, 'PUFF... PUFF...'); }
        }
      }
      var lift = -(0.30 + (U ? 0.10 : 0)) * (p.rotor / 100);
      p.vy += 0.22 + lift;
      if (D) p.vy += 0.06;
      if (p.vy < -1.8) p.vy = -1.8;
      if (p.vy > 1.5) p.vy = 1.5;
      var steer = (R ? 1.2 : 0) - (L ? 1.2 : 0);
      if (steer) p.vx += (steer - p.vx) * 0.1;
      else p.vx *= 0.95;
      if (R) p.dir = 1; if (L) p.dir = -1;
      p.tilt = p.vx * 0.12;
      if (Game.frame % 11 === 0 && p.rotor > 5) AudioSys.sfx('whup');
      if (Game.frame % 5 === 0) Particles.dust(p.x + 3 + Math.random() * 8, p.y + 21);
      if (p.rotor <= 0) p.state = 'ground';
    }

    // updraft columns (Jet Plane's gift) — the wind even restores fluff
    if (p.inUpdraft) {
      p.vy -= 0.5;
      if (p.vy < -2.6) p.vy = -2.6;
      p.rotor = Math.min(100, p.rotor + 2);
      p.stamina = Math.min(100, p.stamina + 2);
      if (p.state === 'ground' && !p.onGround) p.state = 'heli';
    }

    var wasAir = !p.onGround;
    Physics.step(p, lvl);
    if (p.onGround && wasAir) {
      if (p.state === 'heli') { p.state = 'ground'; p.rotor = 0; }
      Particles.dust(p.x + 3, p.y + 19); Particles.dust(p.x + 11, p.y + 19);
      if (ctl && Math.random() < 0.12) bark(p);
    }

    // hazards — pins, soap, brine
    if (lvl.hazardAtPx(p.x + 7, p.y + p.h - 1) || lvl.hazardAtPx(p.x + 2, p.y + p.h - 4) ||
        lvl.hazardAtPx(p.x + 12, p.y + p.h - 4)) {
      hurtPete(p, 1);
    }
  }

  function peteFace(p) {
    if (p.faceOverride >= 0) return p.faceOverride;
    return (p.cryTimer > 0 || p.dead) ? 1 : 0;
  }

  function renderPete(p, ctx) {
    if (p.invuln > 0 && (Game.frame >> 2) % 2 === 0 && !p.dead) return; // hurt blink
    var cx = p.x + p.w / 2, feet = p.y + p.h;
    var bob = (p.state === 'ground' && Math.abs(p.vx) < 0.2 && p.spin < 5)
      ? Math.round(Math.sin(Game.frame * 0.06) * 1) : 0;

    if (p.onGround) {
      ctx.fillStyle = PAL.shadow;
      ctx.fillRect(Math.round(p.x), Math.round(feet - 1), p.w, 2);
    }
    ctx.save();
    ctx.translate(Math.round(cx), Math.round(feet));
    ctx.rotate(p.tilt);

    if (p.state === 'heli') {
      // rotor blur — Pete's little arms, a proud propeller
      var ra = 0.35 + (p.rotor / 100) * 0.45;
      ctx.strokeStyle = rgba(PAL.cordBlue, ra);
      ctx.beginPath(); ctx.ellipse(0, -27, 13, 2.5, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = rgba(PAL.cream, ra * 0.7);
      ctx.beginPath(); ctx.ellipse(0, -27, 9, 1.5, 0, 0, Math.PI * 2); ctx.stroke();
      var side = ((Game.frame >> 1) & 1) ? 1 : -1;
      ctx.save();
      ctx.translate(side * 8, -27); ctx.rotate(Math.PI / 2 * side);
      ctx.drawImage(SPR.peteArm[0], -2, -4);
      ctx.restore();
    }

    // body (sprite is 20x24, hitbox 14x20)
    ctx.drawImage(SPR.pete[peteFace(p)], -10, -24 + bob);

    if (p.state !== 'heli') {
      // swinging arms — the engine of the whole legend
      var swing;
      if (p.spin > 4) swing = Math.sin(Game.frame * 0.62) * (0.4 + (p.spin / 100) * 1.5);
      else if (Math.abs(p.vx) > 0.2 && p.onGround) swing = Math.sin(Game.frame * 0.3) * 0.35;
      else swing = Math.sin(Game.frame * 0.06) * 0.06;
      var sides = [-1, 1];
      for (var s = 0; s < 2; s++) {
        var sd = sides[s];
        ctx.save();
        ctx.translate(sd * 9, -10 + bob);
        ctx.rotate(sd * 0.15 + swing * 0.9);
        ctx.drawImage(SPR.peteArm[0], -2, -1);
        ctx.restore();
      }
    }
    ctx.restore();

    // gauges: gold = spin-up, blue = fluff (red when nearly out of puff)
    var gx = Math.round(p.x - 1), gy = Math.round(p.y - 7);
    if (p.spin > 0 && p.state === 'ground') {
      ctx.fillStyle = rgba(PAL.ink, 0.6);
      ctx.fillRect(gx, gy, 16, 3);
      ctx.fillStyle = PAL.gold;
      ctx.fillRect(gx + 1, gy + 1, Math.round(14 * p.spin / 100), 1);
      gy -= 4;
    }
    if (p.stamina < 96 || p.state === 'heli') {
      ctx.fillStyle = rgba(PAL.ink, 0.6);
      ctx.fillRect(gx, gy, 16, 3);
      ctx.fillStyle = p.stamina < 30 ? PAL.heartRed : PAL.tear;
      ctx.fillRect(gx + 1, gy + 1, Math.round(14 * p.stamina / 100), 1);
    }
  }

  /* ============================ CHEETO ============================ */
  function makeCheeto(x, y) {
    return {
      type: 'cheeto', x: x, y: y, w: 18, h: 13, mood: 1, caged: false, t: 0,
      update: function () {
        this.t++;
        if (this.mood === 2 && this.t % 9 === 0) Particles.heartFx(this.x + 9, this.y - 3);
      },
      render: function (ctx) {
        var bob = Math.round(Math.sin(this.t * (this.mood === 2 ? 0.3 : 0.1)) * 2);
        // sprite is 24x26, anchored to the entity's feet
        drawSpr(ctx, 'cheeto', this.mood, this.x - 3, this.y + this.h - 26 + bob);
        if (this.caged) {
          var cx = this.x - 7, cy = this.y + this.h - 30, cw = 32, ch = 34;
          ctx.fillStyle = PAL.ink;
          ctx.fillRect(cx + cw / 2, cy - 8, 1, 8); // chain
          ctx.fillRect(cx, cy, cw, 2); ctx.fillRect(cx, cy + ch - 2, cw, 2);
          for (var b = 0; b <= cw; b += 5) ctx.fillRect(cx + b, cy, 2, ch);
        }
      }
    };
  }

  /* =========================== GREEN MAN =========================== */
  function makeGreenMan(x, y) {
    return {
      type: 'gm', x: x, y: y, w: 28, h: 48, vx: 0, vy: 0, onGround: false,
      hp: 24, maxHp: 24, state: 'idle', t: 60, hops: 0, dir: -1,
      sclY: 1, flash: 0, frame: 0, active: false
    };
  }

  function updateGreenMan(g, lvl, p, scene) {
    if (!g.active) return;
    g.t--;
    if (g.flash > 0) g.flash--;
    var phase = g.hp > 16 ? 1 : (g.hp > 8 ? 2 : 3);
    g.dir = p.x > g.x ? 1 : -1;
    g.sclY += (1 - g.sclY) * 0.15;

    if (g.state === 'idle') {
      g.frame = 0;
      if (g.t <= 0) { g.state = 'hop'; g.hops = 3 + (phase === 3 ? 1 : 0); }
    } else if (g.state === 'hop') {
      if (g.onGround && g.vy === 0) {
        if (g.hops <= 0) {
          g.state = (phase >= 2 && Math.random() < 0.5) ? 'rollwind' : 'spit';
          g.t = g.state === 'spit' ? 30 : 40;
        } else {
          g.vy = -(2.6 + phase * 0.25);
          g.vx = g.dir * (0.75 + phase * 0.2);
          g.hops--;
          g.sclY = 1.25;
        }
      }
    } else if (g.state === 'spit') {
      g.frame = 1; g.vx = 0;
      if (g.t === 20 || g.t === 12 || g.t === 4 || (phase >= 2 && g.t === 28)) {
        AudioSys.sfx('spit');
        var dx = (p.x + 7) - (g.x + 14), dy = (p.y) - (g.y + 8);
        var tf = 64 + Math.random() * 20;
        scene.projectiles.push({
          x: g.x + 14, y: g.y + 8, w: 4, h: 4,
          vx: dx / tf, vy: dy / tf - 0.08 * tf / 2 * 0.5, g: 0.05, t: 0
        });
      }
      if (g.t <= 0) { g.state = 'tired'; g.t = 160 - phase * 20; AudioSys.sfx('roar'); }
    } else if (g.state === 'rollwind') {
      g.frame = 1; g.vx = 0; g.sclY = 0.85;
      if (g.t <= 0) { g.state = 'roll'; g.vx = g.dir * 2.6; g.t = 200; AudioSys.sfx('roar'); }
    } else if (g.state === 'roll') {
      g.frame = 0; g.sclY = 0.8;
      if (g.vx === 0 || g.t <= 0) { // hit a wall
        Cam.addShake(8); AudioSys.sfx('bonk');
        g.state = 'tired'; g.t = 160 - phase * 20;
      }
    } else if (g.state === 'tired') {
      g.frame = 2; g.vx = 0;
      if (Game.frame % 18 === 0) Particles.dust(g.x + 14, g.y - 2);
      // gasping sweat — the tell that he is bonkable
      if (Game.frame % 14 === 0) {
        Particles.tear(g.x + 6, g.y + 8);
        Particles.tear(g.x + 22, g.y + 8);
      }
      if (g.t <= 0) { g.state = 'idle'; g.t = 40; }
    } else if (g.state === 'hurt') {
      g.frame = 2;
      if (g.t <= 0) { g.state = 'idle'; g.t = 50 - phase * 8; }
    } else if (g.state === 'defeated') {
      g.frame = 3; g.vx = 0;
      if (Game.frame % 8 === 0) {
        Particles.tear(g.x + 8, g.y + 14);
        Particles.tear(g.x + 20, g.y + 14);
      }
      return;
    }

    g.vy += 0.18;
    if (g.vy > 3) g.vy = 3;
    var wasAir = !g.onGround;
    Physics.step(g, lvl);
    if (g.onGround && wasAir) { g.sclY = 0.72; Cam.addShake(4); AudioSys.sfx('bonk'); }

    // contact stings — except when he is gasping for air (or done)
    if (Physics.overlap(g, p) && g.state !== 'tired' && g.state !== 'defeated' &&
        g.state !== 'hurt') {
      hurtPete(p, 1);
      if (scene.onPeteHurt) scene.onPeteHurt();
    }
  }

  function renderGreenMan(g, ctx) {
    if (g.flash > 0 && (Game.frame >> 2) % 2 === 0) return;
    var feet = g.y + g.h;
    ctx.fillStyle = PAL.shadow;
    ctx.fillRect(Math.round(g.x + 2), Math.round(feet - 1), g.w - 4, 2);
    ctx.save();
    ctx.translate(Math.round(g.x + g.w / 2), Math.round(feet));
    ctx.scale(g.dir === 1 ? -1 : 1, g.sclY);
    ctx.drawImage(SPR.greenman[g.frame], -16, -52, 32, 52);
    ctx.restore();
  }

  /* ============================ LINT MITE ============================ */
  function makeMite(x, y) {
    return {
      type: 'mite', x: x, y: y - 2, w: 8, h: 6, vx: 0.35, vy: 0, dir: 1,
      onGround: false, pushed: 0, t: (Math.random() * 60) | 0, deadFx: false
    };
  }
  function updateMite(m, lvl, p, scene) {
    m.t++;
    if (m.pushed > 0) m.pushed--;
    // Pete's rotor wash sends lint flying
    if (p.state === 'heli' && p.rotor > 30) {
      var dx = (m.x + 4) - (p.x + 7), dy = (m.y + 3) - (p.y + 10);
      var d2 = dx * dx + dy * dy;
      if (d2 < 1600) {
        m.vx = (dx > 0 ? 1 : -1) * 2.2;
        m.vy = -0.6;
        m.pushed = 30;
      }
    }
    if (m.pushed <= 0) {
      m.vx = m.dir * 0.35;
      // turn at ledges and walls
      var aheadX = m.dir > 0 ? m.x + m.w + 1 : m.x - 1;
      if (m.onGround &&
          (!lvl.solidAtPx(aheadX, m.y + m.h + 2) || lvl.solidAtPx(aheadX, m.y + 2))) {
        m.dir *= -1;
      }
    }
    m.vy += 0.2; if (m.vy > 2) m.vy = 2;
    var pvx = m.vx;
    Physics.step(m, lvl);
    if (m.pushed > 0 && pvx !== 0 && m.vx === 0) { // smacked a wall
      m.deadFx = true;
      Particles.poof(m.x + 4, m.y + 3);
      AudioSys.sfx('poof');
      if (Math.random() < 0.4) scene.dropButton(m.x, m.y);
    }
    if (m.pushed <= 0 && Physics.overlap(m, p)) hurtPete(p, 1);
  }

  /* ============================ JET PLANE ============================ */
  // The wise aerial guardian. Flies across the sky; his wake becomes an
  // updraft column that carries Pete to impossible heights.
  function makeJetPlane() {
    return {
      type: 'jet', active: false, x: 0, y: 0, t: 0, zone: null,
      start: function (zone) {
        this.active = true; this.zone = zone;
        this.x = Cam.x - 80; this.y = zone.y - 90;
        this.t = 0;
        AudioSys.sfx('jet');
      },
      update: function () {
        if (!this.active) return;
        this.t++;
        this.x += 2.4;
        this.y += Math.sin(this.t * 0.05) * 0.4;
        if (this.t % 3 === 0) {
          Particles.spawn({
            x: this.x + 4, y: this.y + 10 + Math.random() * 8,
            vx: -0.5, vy: (Math.random() - 0.5) * 0.4,
            life: 28, col: rgba(PAL.jetGrey, 0.7), w: 2, h: 1
          });
        }
        if (this.x > Cam.x + Game.W + 120) this.active = false;
      },
      render: function (ctx) {
        if (!this.active) return;
        var bob = Math.sin(this.t * 0.1) * 2;
        ctx.save();
        ctx.translate(Math.round(this.x), Math.round(this.y + bob));
        ctx.rotate(-0.06);
        ctx.drawImage(SPR.jetplane[0], 0, 0);
        ctx.restore();
      }
    };
  }

  return {
    makePete: makePete, updatePete: updatePete, renderPete: renderPete,
    hurtPete: hurtPete, bark: bark, PETE_LINES: PETE_LINES,
    makeCheeto: makeCheeto,
    makeGreenMan: makeGreenMan, updateGreenMan: updateGreenMan, renderGreenMan: renderGreenMan,
    makeMite: makeMite, updateMite: updateMite,
    makeJetPlane: makeJetPlane
  };
})();
