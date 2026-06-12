// Scenes — title, story cutscenes, levels, boss fight, ending.
var Scenes = (function () {
  var current = null;
  var fade = { a: 1, dir: -1, cb: null }; // 1 = black

  function go(name, params) {
    fade.dir = 1;
    fade.cb = function () {
      Particles.clear(); Dialogue.clear();
      current = makers[name](params || {});
      fade.dir = -1;
    };
  }

  /* ---------------- script runner for cutscenes ---------------- */
  function makeScript(steps, done) {
    var i = 0, t = 0, started = false;
    return {
      update: function (scene) {
        if (i >= steps.length) { if (done) { var f = done; done = null; f(scene); } return true; }
        var s = steps[i];
        if (s.wait !== undefined) {
          if (++t >= s.wait) { t = 0; i++; }
        } else if (s.say) {
          if (!started) { Dialogue.run(s.say); started = true; }
          else if (!Dialogue.busy()) { started = false; i++; }
        } else if (s.bark) {
          Dialogue.bark(s.bark[0], s.bark[1]); i++;
        } else if (s.fn) {
          s.fn(scene); i++;
        } else if (s.move) {
          var e = s.move.ent, tx = s.move.x, sp = s.move.spd || 1;
          if (Math.abs(e.x - tx) <= sp) { e.x = tx; i++; }
          else { e.x += e.x < tx ? sp : -sp; if (e.dir !== undefined) e.dir = e.x < tx ? 1 : -1; }
        } else if (s.music) { AudioSys.music(s.music); i++; }
        else if (s.stopmusic) { AudioSys.stopMusic(); i++; }
        else if (s.sfx) { AudioSys.sfx(s.sfx); i++; }
        else if (s.shake) { Cam.addShake(s.shake); i++; }
        else i++;
        return false;
      }
    };
  }

  /* ---------------- shared HUD ---------------- */
  function drawHUD(ctx, pete) {
    for (var i = 0; i < pete.maxHearts; i++) {
      drawSpr(ctx, 'heart', i < pete.hearts ? 0 : 1, 4 + i * 9, 4);
    }
    drawSpr(ctx, 'buttonPickup', 0, 4, 13);
    TextR.shadow(ctx, 'X' + Game.buttons, 12, 14, PAL.paper);
    // fluff meter — flight stamina
    TextR.draw(ctx, 'FLUFF', 4, 22, rgba(PAL.paper, 0.8));
    ctx.fillStyle = rgba(PAL.ink, 0.6);
    ctx.fillRect(4, 28, 28, 4);
    ctx.fillStyle = pete.stamina < 30 ? PAL.heartRed : PAL.tear;
    ctx.fillRect(5, 29, Math.round(26 * pete.stamina / 100), 2);
    if (AudioSys.isMuted()) TextR.draw(ctx, 'MUTED', Game.W - 24, 4, rgba(PAL.paper, 0.5));
  }

  function handlePauseMute(scene) {
    if (Input.wasPressed('mute')) AudioSys.toggleMute();
    if (Input.wasPressed('pause')) scene.paused = !scene.paused;
  }

  /* ============================ TITLE ============================ */
  function titleScene() {
    Game.buttons = 0; Game.flowers = 0; Game.spent = 0;
    AudioSys.music('title');
    var t = 0;
    return {
      update: function () {
        t++;
        if (t % 9 === 0) {
          Particles.sparkle(Math.random() * Game.W, Math.random() * 120, rgba(PAL.gold, 0.8));
        }
        if (Input.wasPressed('action')) { AudioSys.sfx('select'); go('intro'); }
      },
      render: function (ctx) {
        Levels.bg(ctx, 'quilt', t * 0.3, 0, t, null);
        // Pete, gently rocking, dreaming of the rescue
        ctx.save();
        ctx.translate(64, 142);
        ctx.rotate(Math.sin(t * 0.05) * 0.06);
        ctx.drawImage(SPR.peteBig[0], -36, -88, 72, 88);
        ctx.restore();
        // a far-off sad Cheeto, waiting
        drawSpr(ctx, 'cheeto', 1, 262, 122 + Math.round(Math.sin(t * 0.08) * 2));
        TextR.draw(ctx, '?', 290, 108, rgba(PAL.ink, 0.6), 2);

        TextR.centerShadow(ctx, "PETE'S", 200, 28, PAL.paper, 4);
        TextR.centerShadow(ctx, 'RESCUE MISSION', 200, 54, PAL.gold, 2);
        TextR.center(ctx, 'A TALE OF TWO PLUSHES, STITCHED TOGETHER', 200, 72, rgba(PAL.ink, 0.75));
        if ((t >> 5) % 2 === 0) TextR.centerShadow(ctx, 'PRESS ENTER', 200, 96, PAL.paper, 2);
        TextR.center(ctx, 'ARROWS / WASD - MOVE', 200, 128, rgba(PAL.ink, 0.7));
        TextR.center(ctx, 'TAP LEFT-RIGHT-LEFT-RIGHT FAST TO FLY!', 200, 136, rgba(PAL.ink, 0.7));
        TextR.center(ctx, 'FLYING TIRES PETE - LAND TO REST HIS ARMS', 200, 144, rgba(PAL.ink, 0.7));
        TextR.center(ctx, 'Z OR SPACE - TALK    P - PAUSE    M - MUTE', 200, 152, rgba(PAL.ink, 0.7));
      }
    };
  }

  /* ============================ INTRO ============================ */
  function introScene() {
    AudioSys.stopMusic();
    var floorLvl = {
      w: 40, h: 23, pxW: 320, pxH: 184,
      solidAtPx: function (x, y) { return y >= 150; },
      onewayAtPx: function () { return false; },
      hazardAtPx: function () { return false; }
    };
    var pete = Entities.makePete(96, 130);
    pete.controllable = false; pete.dir = 1;
    var cheeto = Entities.makeCheeto(126, 137);
    cheeto.mood = 2;
    var gm = Entities.makeGreenMan(340, 102);
    var jetX = -200, jetOn = false;
    var titleCard = 0;
    var t = 0;
    Cam.x = 0; Cam.y = 0;

    var scene = {
      update: function () {
        t++;
        pete.controllable = false;
        Entities.updatePete(pete, floorLvl);
        cheeto.update();
        if (jetOn) jetX += 3;
        if (this.script && this.script.update(this)) this.script = null;
        if (titleCard > 0) titleCard++;
        if (Input.wasPressed('skip')) go('level', { i: 0 });
      },
      render: function (ctx) {
        Levels.bg(ctx, 'night', 0, 0, t, null);
        // the bed-kingdom at night
        for (var x = 0; x < 40; x++) {
          var pi = Math.floor(x / 5) % 3;
          ctx.fillStyle = ['#7e5a6e', '#5a6680', '#6e7a5e'][pi];
          ctx.fillRect(x * 8, 150, 8, 34);
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fillRect(x * 8, 150, 8, 2);
        }
        if (gm.x < 330) Entities.renderGreenMan(gm, ctx);
        cheeto.render(ctx);
        Entities.renderPete(pete, ctx);
        if (jetOn) {
          ctx.save(); ctx.translate(jetX, 36); ctx.rotate(-0.05);
          ctx.drawImage(SPR.jetplane[0], 0, 0); ctx.restore();
        }
        Particles.render(ctx);
        Dialogue.renderBarks(ctx);
        Dialogue.renderBox(ctx);
        if (titleCard > 0) {
          var a = Math.min(1, titleCard / 30);
          ctx.fillStyle = 'rgba(10,10,20,' + a * 0.6 + ')';
          ctx.fillRect(0, 0, Game.W, Game.H);
          ctx.globalAlpha = a;
          TextR.centerShadow(ctx, "PETE'S RESCUE MISSION", 160, 80, PAL.gold, 2);
          TextR.center(ctx, 'CHAPTER ONE: THE BEDQUILT PLAINS', 160, 100, PAL.paper);
          ctx.globalAlpha = 1;
        }
        TextR.draw(ctx, 'ESC - SKIP', 4, Game.H - 8, rgba(PAL.paper, 0.4));
      }
    };

    scene.script = makeScript([
      { wait: 50 },
      { say: [['', 'LONG AGO, IN THE SAME WORKSHOP, ON THE SAME RAINY NIGHT, TWO PLUSHES WERE SEWN FROM ONE BOLT OF CLOTH.'],
              ['', 'PETE AND CHEETO. BROTHERS BY THREAD. AND OVER A THOUSAND QUIET NIGHTS ON THE BED-KINGDOM... SOMETHING MORE.']] },
      { wait: 30 },
      { bark: [cheeto, 'WAN WAN!'] },
      { wait: 40 },
      { bark: [pete, 'I AM PETE'] },
      { wait: 60 },
      { fn: function () { AudioSys.sfx('roar'); Cam.addShake(6); } },
      { move: { ent: gm, x: 220, spd: 1.4 } },
      { say: [['GREEN MAN', 'I WAS SEWN WITHOUT ARMS. DID YOU KNOW THAT, SOFT ONES? I HAVE NEVER HELD ANYTHING. NOT ONCE. NOT EVER.'],
              ['GREEN MAN', 'AND YOU TWO... HOLDING EACH OTHER EVERY NIGHT. IT CURDLED ME. IT TURNED MY HEART TO BRINE.'],
              ['GREEN MAN', 'IF I CANNOT HUG... THEN NO ONE GETS TO HOLD HIM. THE ORANGE ONE COMES WITH ME.']] },
      { fn: function () { cheeto.mood = 1; cheeto.caged = true; AudioSys.sfx('roar'); } },
      { bark: [cheeto, 'WAN!? WAN WAN!!'] },
      { fn: function (s) { s.script2 = makeScript([{ move: { ent: cheeto, x: 360, spd: 2.2 } }]); } },
      { move: { ent: gm, x: 380, spd: 2.2 } },
      { wait: 40 },
      { fn: function () { pete.cryTimer = 400; } },
      { bark: [pete, 'CHEETO!?'] },
      { wait: 80 },
      { say: [['PETE', '...'],
              ['PETE', 'I AM PETE. MR PETE. PETE PETE.'],
              ['PETE', 'AND NOBODY... NOBODY TAKES MY CHEETO.']] },
      { fn: function () { jetOn = true; AudioSys.sfx('jet'); } },
      { wait: 50 },
      { say: [['JET PLANE', 'LITTLE STITCHED ONE. THE WIND REMEMBERS EVERY TOY THAT EVER FLEW. ROCK YOUR BODY UNTIL IT REMEMBERS YOU.'],
              ['JET PLANE', 'WIGGLE, PETE. WIGGLE UNTIL YOU FLY.']] },
      { fn: function () { titleCard = 1; AudioSys.music('title'); } },
      { wait: 160 },
      { fn: function () { go('level', { i: 0 }); } }
    ]);

    // secondary mover (cheeto dragged away) piggybacks on update
    var baseUpdate = scene.update;
    scene.update = function () {
      baseUpdate.call(this);
      if (this.script2 && this.script2.update(this)) this.script2 = null;
    };
    return scene;
  }

  /* ============================ LEVEL ============================ */
  function levelScene(params) {
    var idx = params.i;
    var lvl = Levels.load(idx);
    AudioSys.music(lvl.music);
    var pete = Entities.makePete(lvl.spawn.x, lvl.spawn.y);
    var respawn = { x: lvl.spawn.x, y: lvl.spawn.y };
    var mites = [], items = [], flowers = [], checkpoints = [], triggers = [];
    var exit = null, cozy = null, uCells = [];
    var jet = Entities.makeJetPlane();
    var goT = 0, banner = 150, t = 0;

    lvl.stubs.forEach(function (s) {
      if (s.t === 'm') mites.push(Entities.makeMite(s.x, s.y));
      else if (s.t === 'o') items.push({ kind: 'button', x: s.x + 1, y: s.y + 1, w: 6, h: 6, taken: false });
      else if (s.t === '*') items.push({ kind: 'puff', x: s.x, y: s.y, w: 8, h: 6, taken: false });
      else if (s.t === 'f') flowers.push({ x: s.x - 1, y: s.y - 2, bloomed: false });
      else if (s.t === 'K') checkpoints.push({ x: s.x - 3, y: s.y + 2, w: 14, h: 6, active: false });
      else if (s.t === 'E') exit = { x: s.x - 2, y: s.y - 4, w: 12, h: 12 };
      else if (s.t === 'z') cozy = { x: s.x, y: s.y + 2 };
      else if (s.t === 'u') uCells.push(s);
      else if (s.t === '1' || s.t === '2' || s.t === '3') triggers.push({ n: s.t, x: s.x, y: s.y, fired: false });
    });

    // one updraft zone per level — Jet Plane's flight corridor
    var zone = null;
    if (uCells.length) {
      var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      uCells.forEach(function (c) {
        x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y);
        x1 = Math.max(x1, c.x + 8); y1 = Math.max(y1, c.y + 8);
      });
      zone = { x0: x0, y0: y0, x1: x1, y1: y1, top: 0, active: false, triggered: false };
    }

    Particles.setTearHandler(function (tx, ty) {
      flowers.forEach(function (f) {
        if (!f.bloomed && Math.abs(tx - (f.x + 5)) < 9 && Math.abs(ty - (f.y + 8)) < 12) {
          f.bloomed = true; Game.flowers++;
          AudioSys.sfx('bloom');
          for (var i = 0; i < 6; i++) Particles.petal(f.x + 5, f.y + 3);
        }
      });
    });

    var INTRO_LINES = [
      [['PETE', 'THE BEDQUILT PLAINS. CHEETO AND I WATCHED A THOUSAND SUNRISES FROM THAT FAR PILLOW.'],
       ['PETE', 'HOLD ON, CHEETO. I AM COMING.']],
      [['PETE', 'THE LAUNDRY ABYSS... IT SMELLS LIKE SOAP AND FEAR DOWN HERE.'],
       ['PETE', 'CHEETO HATES THE SPIN CYCLE. I HAVE TO HURRY.']],
      [['PETE', 'THE SHELF OF FORGOTTEN TOYS. EVERY TOY UP HERE WAS LOVED ONCE.'],
       ['PETE', 'THEY JUST... GOT LEFT BEHIND. NOBODY IS LEAVING CHEETO BEHIND.']]
    ];

    var scene = {
      paused: false, script: null, projectiles: [],
      gm: null, gmCheeto: null,
      dropButton: function (x, y) { items.push({ kind: 'button', x: x, y: y, w: 6, h: 6, taken: false }); },

      runTrigger: function (tr) {
        var self = this;
        if (tr.n === '1') {
          var steps = [{ say: INTRO_LINES[idx] }];
          if (idx === 0) steps.push({ say: [['', 'TIP: TAP LEFT AND RIGHT QUICKLY, OVER AND OVER. PETE WILL ROCK... AND THEN PETE WILL FLY.']] });
          this.script = makeScript(steps);
        } else if (tr.n === '2' && idx === 0) {
          this.script = makeScript([
            { say: [['', 'TIP: KEEP TAPPING IN THE AIR TO STAY UP. HOLD A DIRECTION TO STEER. PLUSHES FALL SOFTLY - NEVER BE AFRAID.'],
                    ['', "TIP: FLYING TIRES PETE'S LITTLE ARMS - WATCH THE BLUE FLUFF METER. LAND ANYWHERE TO CATCH HIS BREATH, THEN FLY AGAIN. HOP FROM PERCH TO PERCH!"]] }
          ]);
        } else if (tr.n === '2' && idx === 1) {
          this.script = makeScript([
            { say: [['PETE', 'IT IS SO DARK DOWN HERE. THE WAY OUT IS MILES ABOVE ME...'],
                    ['JET PLANE', 'THEN IT IS A GOOD THING, LITTLE ONE, THAT YOU HAVE A FRIEND WITH WINGS FOR LEGS.']] },
            { fn: function (s) { if (zone && !zone.triggered) { zone.triggered = true; jet.start({ y: pete.y }); } } },
            { bark: [pete, 'JET PLANE!!'] },
            { wait: 100 },
            { fn: function () { if (zone) zone.active = true; AudioSys.sfx('updraft'); } },
            { say: [['JET PLANE', 'MY WAKE WILL HOLD YOU. SPIN YOUR LITTLE ARMS AND RIDE IT, ALL THE WAY TO THE LIGHT.'],
                    ['JET PLANE', 'AND LITTLE ONE - MY WIND COSTS YOU NO FLUFF. REST INSIDE IT.']] }
          ]);
        } else if (tr.n === '2' && idx === 2) {
          this.script = makeScript([
            { wait: 20 },
            { say: [['PETE', 'WAIT. ON THE GROUND, THERE...'],
                    ['PETE', "CHEETO'S BLADE COZY. I KNITTED IT FOR HIM LAST WINTER. HE NEVER TAKES IT OFF."],
                    ['PETE', 'HE MUST HAVE BEEN SO SCARED.']] },
            { fn: function () { pete.cryTimer = 360; } },
            { wait: 120 },
            { say: [['', "PETE CRIED. HE COULD NOT HELP IT. AND WHERE PLUSH TEARS FALL, FORGOTTEN THINGS REMEMBER HOW TO BLOOM."]] },
            { fn: function (s) {
                lvl.clearGate(); AudioSys.sfx('bloom'); Cam.addShake(4);
                flowers.forEach(function (f) {
                  if (Math.abs(f.x - pete.x) < 140 && !f.bloomed) {
                    f.bloomed = true; Game.flowers++;
                    for (var i = 0; i < 5; i++) Particles.petal(f.x + 5, f.y + 3);
                  }
                });
              } },
            { say: [['PETE', 'THE BRAMBLE... THE FLOWERS ATE IT UP. THANK YOU, LITTLE ONES.'],
                    ['PETE', 'HOLD ON, CHEETO. MR PETE IS COMING.']] }
          ]);
        } else if (tr.n === '3' && idx === 0) {
          // Green Man's taunt at the edge of the plains
          var gm = Entities.makeGreenMan(Math.min(pete.x + 130, lvl.pxW - 150), 56);
          var ch = Entities.makeCheeto(Math.min(pete.x + 160, lvl.pxW - 110), 92);
          ch.mood = 1; ch.caged = true;
          this.gm = gm; this.gmCheeto = ch;
          this.script = makeScript([
            { fn: function () { AudioSys.sfx('roar'); Cam.addShake(5); } },
            { say: [['GREEN MAN', 'STILL WADDLING AFTER US, BUTTON-CHEST? HOW PRECIOUS.'],
                    ['CHEETO', 'WAN! WAN WAN WAN!'],
                    ['GREEN MAN', 'SILENCE. WE HAVE A JAR TO CATCH. TRY THE LAUNDRY CHUTE, PETE. I HEAR THE SPIN CYCLE IS LOVELY THIS TIME OF YEAR.']] },
            { bark: [pete, 'I AM PETE!!'] },
            { fn: function (s) { s.script2 = makeScript([{ move: { ent: ch, x: ch.x + 200, spd: 3 } }]); } },
            { move: { ent: gm, x: gm.x + 220, spd: 3 } },
            { fn: function (s) { s.gm = null; s.gmCheeto = null; } },
            { say: [['PETE', 'THE LAUNDRY CHUTE IT IS. FOR YOU, CHEETO, I WOULD WALK INTO THE WASHING MACHINE ITSELF.']] }
          ]);
        }
      },

      completeLevel: function () {
        AudioSys.sfx('pickup');
        if (idx < 2) go('level', { i: idx + 1 });
        else go('boss');
      },

      update: function () {
        handlePauseMute(this);
        if (this.paused) return;
        t++; if (banner > 0) banner--;
        pete.controllable = !this.script;

        if (this.script && this.script.update(this)) this.script = null;
        if (this.script2 && this.script2.update(this)) this.script2 = null;

        // updraft state for Pete
        pete.inUpdraft = false;
        if (zone && zone.active) {
          if (pete.x + pete.w > zone.x0 && pete.x < zone.x1 &&
              pete.y + pete.h > zone.top && pete.y < zone.y1) {
            pete.inUpdraft = true;
          }
          if (Game.frame % 2 === 0) {
            Particles.updraftStreak(zone.x0 + Math.random() * (zone.x1 - zone.x0),
                                    zone.y1 - Math.random() * 40);
          }
        }
        if (pete.y < 2) { pete.y = 2; if (pete.vy < 0) pete.vy = 0; }

        Entities.updatePete(pete, lvl);
        jet.update();
        if (this.gmCheeto) this.gmCheeto.update();

        if (!pete.dead) {
          // triggers — several stubs can share a number to widen coverage;
          // firing one retires them all
          for (var i = 0; i < triggers.length; i++) {
            var tr = triggers[i];
            if (!tr.fired && Math.abs(pete.x + 7 - tr.x) < 20 && Math.abs(pete.y - tr.y) < 60) {
              triggers.forEach(function (t2) { if (t2.n === tr.n) t2.fired = true; });
              this.runTrigger(tr);
            }
          }
          // mites
          for (i = mites.length - 1; i >= 0; i--) {
            Entities.updateMite(mites[i], lvl, pete, this);
            if (mites[i].deadFx) mites.splice(i, 1);
          }
          // pickups
          for (i = 0; i < items.length; i++) {
            var it = items[i];
            if (!it.taken && Physics.overlap(it, pete)) {
              it.taken = true;
              if (it.kind === 'button') {
                Game.buttons++; AudioSys.sfx('pickup');
                Particles.sparkle(it.x + 3, it.y + 3);
              } else {
                pete.hearts = Math.min(pete.maxHearts, pete.hearts + 1);
                AudioSys.sfx('heal');
                for (var s2 = 0; s2 < 5; s2++) Particles.heartFx(it.x + 4, it.y);
              }
            }
          }
          // checkpoints
          for (i = 0; i < checkpoints.length; i++) {
            var ck = checkpoints[i];
            if (!ck.active && Physics.overlap(ck, pete)) {
              checkpoints.forEach(function (c) { c.active = false; });
              ck.active = true;
              respawn = { x: ck.x, y: ck.y - 24 };
              AudioSys.sfx('checkpoint');
              for (var s3 = 0; s3 < 6; s3++) Particles.sparkle(ck.x + 7, ck.y, PAL.white);
            }
          }
          // exit
          if (exit && !this.script && Physics.overlap(exit, pete)) this.completeLevel();
        } else {
          // soft game over — Pete needs a moment
          goT++;
          if (goT === 1) AudioSys.stopMusic();
          if (goT > 200) {
            goT = 0;
            pete.dead = false; pete.hearts = pete.maxHearts;
            pete.x = respawn.x; pete.y = respawn.y;
            pete.vx = 0; pete.vy = 0; pete.cryTimer = 60; pete.invuln = 90;
            AudioSys.music(lvl.music);
          }
        }
        Particles.update(lvl);
      },

      render: function (ctx) {
        Levels.bg(ctx, lvl.theme, Cam.x, Cam.y, t, lvl);
        Cam.follow(pete, lvl, t < 2);
        Cam.begin(ctx);
        lvl.render(ctx);

        // updraft column glow
        if (zone && zone.active) {
          var g = ctx.createLinearGradient(0, zone.top, 0, zone.y1);
          g.addColorStop(0, 'rgba(255,255,255,0.02)');
          g.addColorStop(1, 'rgba(255,255,255,0.14)');
          ctx.fillStyle = g;
          ctx.fillRect(zone.x0, zone.top, zone.x1 - zone.x0, zone.y1 - zone.top);
        }

        flowers.forEach(function (f) { drawSpr(ctx, 'flower', f.bloomed ? 1 : 0, f.x, f.y - 4); });
        if (cozy) drawSpr(ctx, 'cozy', 0, cozy.x, cozy.y);
        checkpoints.forEach(function (c) { drawSpr(ctx, 'pillow', c.active ? 1 : 0, c.x, c.y); });
        if (exit) {
          var bob = Math.round(Math.sin(t * 0.07) * 2);
          drawSpr(ctx, 'exitStar', 0, exit.x, exit.y + bob);
          if (t % 13 === 0) Particles.sparkle(exit.x + 6, exit.y + 6 + bob);
        }
        items.forEach(function (it) {
          if (it.taken) return;
          if (it.kind === 'button') drawSpr(ctx, 'buttonPickup', (Game.frame >> 4) & 1, it.x, it.y);
          else drawSpr(ctx, 'puff', (Game.frame >> 4) & 1, it.x, it.y);
        });
        mites.forEach(function (m) { drawSpr(ctx, 'mite', (Game.frame >> 4) & 1, m.x - 1, m.y - 1, m.dir < 0); });
        if (this.gm) Entities.renderGreenMan(this.gm, ctx);
        if (this.gmCheeto) this.gmCheeto.render(ctx);
        jet.render(ctx);
        Entities.renderPete(pete, ctx);
        Particles.render(ctx);
        Dialogue.renderBarks(ctx);
        Cam.end(ctx);

        drawHUD(ctx, pete);
        Dialogue.renderBox(ctx);
        if (banner > 0) {
          ctx.globalAlpha = Math.min(1, banner / 40);
          TextR.centerShadow(ctx, lvl.name, Game.W / 2, 60, PAL.paper, 2);
          ctx.globalAlpha = 1;
        }
        if (pete.dead && goT > 30) {
          ctx.fillStyle = 'rgba(10,10,24,' + Math.min(0.55, (goT - 30) / 80) + ')';
          ctx.fillRect(0, 0, Game.W, Game.H);
          TextR.centerShadow(ctx, 'PETE NEEDS A MOMENT...', Game.W / 2, 80, PAL.tear, 1);
          TextR.center(ctx, 'IT IS OK TO CRY. IT IS OK TO TRY AGAIN.', Game.W / 2, 92, rgba(PAL.paper, 0.8));
        }
        Game.dbg = { pete: pete, lvl: lvl, scene: this, zone: zone };
        if (this.paused) {
          ctx.fillStyle = 'rgba(10,10,24,0.6)';
          ctx.fillRect(0, 0, Game.W, Game.H);
          TextR.centerShadow(ctx, 'PAUSED', Game.W / 2, 80, PAL.paper, 2);
          TextR.center(ctx, 'PETE IS RESTING', Game.W / 2, 98, rgba(PAL.paper, 0.7));
        }
      }
    };
    return scene;
  }

  /* ============================ BOSS ============================ */
  function bossScene(params) {
    var retry = !!(params && params.retry);
    var lvl = Levels.load(3);
    AudioSys.stopMusic();
    var pete = Entities.makePete(lvl.spawn.x, lvl.spawn.y);
    pete.maxHearts = 5; pete.hearts = 5; // the jar is kinder now
    var gm = null, cheeto = null;
    var hugT = -1, t = 0, goT = 0;

    lvl.stubs.forEach(function (s) {
      if (s.t === 'G') gm = Entities.makeGreenMan(s.x, s.y - 24);
      else if (s.t === 'C') { cheeto = Entities.makeCheeto(s.x, s.y); cheeto.mood = 1; cheeto.caged = true; }
    });

    var hintGiven = false;
    var scene = {
      paused: false, script: null, projectiles: [], bills: [], fireCd: 0, cardShow: 0,
      dropButton: function () {},
      onPeteHurt: function () {
        if (hintGiven || !gm.active || gm.state === 'defeated') return;
        hintGiven = true;
        Dialogue.bark(gm, 'YOUR MONEY CANNOT HURT ME. ...OW. OK. IT CAN.');
      },
      onBossDown: function () {
        AudioSys.stopMusic();
        this.projectiles = [];
        this.bills = [];
        var self = this;
        var bill = '$' + (Game.spent / 100).toFixed(2);
        this.script = makeScript([
          { wait: 60 },
          { say: [['GREEN MAN', '...YOU THREW ' + bill + " OF MAX'S MONEY AT ME."],
                  ['GREEN MAN', 'NOBODY HAS EVER SPENT A SINGLE CENT ON ME BEFORE. NOT ONE. WHY DOES IT FEEL... WARM.'],
                  ['GREEN MAN', 'DO IT THEN. FINISH ME. UNSTITCH ME. IT IS WHAT I DESERVE.'],
                  ['GREEN MAN', 'I JUST... EVERY NIGHT I WATCHED YOU TWO HOLD EACH OTHER. AND MY ARMS... I DO NOT HAVE... I NEVER...']] },
          { wait: 10 },
          { fn: function () { hugT = 0; pete.faceOverride = 2; AudioSys.sfx('hug'); } },
          { wait: 130 },
          { say: [['GREEN MAN', '...WHAT IS THIS. WHAT ARE YOU DOING. WHY IS IT WARM.'],
                  ['PETE', 'IT IS A HUG. I AM PETE. AND YOU ONLY EVER HAD TO ASK.'],
                  ['GREEN MAN', 'SNIFF. I AM SO SORRY. I AM A SOUR, LONELY LITTLE PICKLE. SNIFF. TAKE HIM. TAKE YOUR CHEETO.']] },
          { fn: function () {
              cheeto.caged = false; cheeto.mood = 2;
              cheeto.y = gm.y + 24; cheeto.x = gm.x - 30;
              AudioSys.sfx('bloom');
              for (var i = 0; i < 12; i++) Particles.confetti(cheeto.x + 9, cheeto.y);
            } },
          { bark: [cheeto, 'WAN WAN WAN!!!'] },
          { wait: 50 },
          { say: [['PETE', 'CHEETO!! OH, CHEETO. I HAVE YOU. I HAVE YOU. NEVER AGAIN.']] },
          { wait: 60 },
          { fn: function () { go('ending'); } }
        ]);
      },
      update: function () {
        handlePauseMute(this);
        if (this.paused) return;
        t++;
        pete.controllable = !this.script;
        if (this.script && this.script.update(this)) this.script = null;
        if (hugT >= 0) {
          hugT++;
          if (hugT % 10 === 0) Particles.heartFx(gm.x + 14 + (Math.random() - 0.5) * 20, gm.y + 10);
          // Pete leans into the hug
          var hx = gm.x - 12;
          pete.x += (hx - pete.x) * 0.2;
          pete.dir = 1;
        }
        if (!this.opened) {
          this.opened = true;
          var self2 = this;
          var steps;
          if (retry) {
            steps = [
              { wait: 40 },
              { say: [['GREEN MAN', 'BACK FOR MORE, BUTTON-CHEST?'],
                      ['PETE', 'EVERY TIME. FOR CHEETO? EVERY TIME.'],
                      ['', "Z / SPACE - SPEND MAX'S MONEY AT HIM UNTIL HE STOPS."]] }
            ];
          } else {
            steps = [
              { wait: 40 },
              { say: [['GREEN MAN', 'SO. THE SOFT ONE MADE IT PAST THE SOCKS AND THE SADNESS.'],
                      ['PETE', 'GIVE HIM BACK, GREEN MAN.'],
                      ['GREEN MAN', 'NO. IN THE JAR HE STAYS, WHERE NO ONE CAN HOLD HIM. IF I CANNOT BE LOVED, NOTHING SOFT DESERVES TO BE.'],
                      ['PETE', 'THAT IS THE SADDEST THING I HAVE EVER HEARD. AND I DID NOT WANT IT TO COME TO THIS.'],
                      ['PETE', 'CHEETO TOLD ME TO USE THIS ONLY IN A TRUE EMERGENCY. GREEN MAN... BEHOLD.']] },
              { fn: function () { self2.cardShow = 110; AudioSys.sfx('cardout'); } },
              { wait: 110 },
              { say: [['', "MAX'S CREDIT CARD! PRESS Z OR SPACE TO SPEND MONEY AT THE GREEN MAN. DO NOT WORRY ABOUT THE BILL. DEBT IS TEMPORARY. LOVE IS FOREVER."]] }
            ];
          }
          steps.push({ sfx: 'roar' }, { shake: 8 }, { music: 'boss' },
                     { fn: function () { gm.active = true; } });
          this.script = makeScript(steps);
        }
        if (pete.y < 18) { pete.y = 18; if (pete.vy < 0) pete.vy = 0; }
        Entities.updatePete(pete, lvl);
        Entities.updateGreenMan(gm, lvl, pete, this);
        cheeto.update();
        // caged Cheeto cheers his hero on
        if (gm.active && gm.state !== 'defeated' && hugT < 0 && Game.frame % 540 === 0) {
          Dialogue.bark(cheeto, 'WAN! WAN!');
        }
        // MAX'S CREDIT CARD — spend money at the problem
        if (this.cardShow > 0) this.cardShow--;
        if (this.fireCd > 0) this.fireCd--;
        if (gm.active && gm.state !== 'defeated' && !this.script && !pete.dead &&
            hugT < 0 && this.fireCd <= 0 && !Dialogue.busy() && Input.wasPressed('action')) {
          this.fireCd = 11;
          Game.spent += 999; // $9.99 a swipe — it's fine, it's Max's
          AudioSys.sfx('kaching');
          this.bills.push({ x: pete.x + (pete.dir > 0 ? 13 : -7), y: pete.y + 7,
                            vx: pete.dir * 3.2, vy: -0.2, w: 8, h: 5, t: 0 });
        }
        for (i = this.bills.length - 1; i >= 0; i--) {
          var bl = this.bills[i];
          bl.t++;
          bl.x += bl.vx;
          bl.y += bl.vy + Math.sin(bl.t * 0.4) * 0.3;
          var hit = gm.state !== 'defeated' && Physics.overlap(bl, gm);
          if (hit) {
            gm.hp--; gm.flash = 6;
            AudioSys.sfx('coin');
            Particles.sparkle(bl.x + 4, bl.y + 2, PAL.gold);
            if (Math.random() < 0.1) {
              Dialogue.bark(gm, ['OW.', 'STOP THAT.', 'I AM NOT FOR SALE.', 'OW. RUDE.'][(Math.random() * 4) | 0]);
            }
            if (gm.hp <= 0) {
              gm.state = 'defeated';
              this.onBossDown(); // resets the bills array — stop iterating it
              break;
            }
          }
          if (hit || bl.t > 150 || lvl.solidAtPx(bl.x + 4, bl.y + 2)) {
            if (!hit) Particles.sparkle(bl.x + 4, bl.y + 2, PAL.pickleL);
            this.bills.splice(i, 1);
          }
        }
        // brine globs
        for (var i = this.projectiles.length - 1; i >= 0; i--) {
          var pr = this.projectiles[i];
          pr.t++;
          pr.vy += pr.g;
          pr.x += pr.vx; pr.y += pr.vy;
          if (Physics.overlap(pr, pete)) {
            Entities.hurtPete(pete, 1);
            this.onPeteHurt();
            this.projectiles.splice(i, 1); continue;
          }
          if (lvl.solidAtPx(pr.x + 2, pr.y + 4) || pr.t > 300) {
            for (var s = 0; s < 4; s++)
              Particles.spawn({ x: pr.x + 2, y: pr.y + 2, vx: (Math.random() - 0.5) * 1.5,
                                vy: -Math.random(), g: 0.08, life: 20, col: PAL.brine });
            this.projectiles.splice(i, 1);
          }
        }
        if (pete.dead) {
          goT++;
          if (goT === 1) AudioSys.stopMusic();
          if (goT > 200) go('boss', { retry: true });
        }
        Particles.update(lvl);
      },
      render: function (ctx) {
        Levels.bg(ctx, 'jar', Cam.x, Cam.y, t, lvl);
        Cam.follow(pete, lvl, t < 2);
        Cam.begin(ctx);
        lvl.render(ctx);
        cheeto.render(ctx);
        Entities.renderGreenMan(gm, ctx);
        // he is gasping — free shots
        if (gm.active && gm.state === 'tired') {
          var by = gm.y - 12 + Math.round(Math.sin(t * 0.25) * 2);
          TextR.centerShadow(ctx, 'HE IS GASPING - OPEN FIRE!', gm.x + gm.w / 2, by, PAL.gold);
        }
        Entities.renderPete(pete, ctx);
        // the card, held aloft (a hero's moment)
        if (this.cardShow > 0) {
          drawSpr(ctx, 'card', 0, pete.x + 1, pete.y - 16 + Math.round(Math.sin(t * 0.2) * 1));
          if (t % 5 === 0) Particles.sparkle(pete.x + 7 + (Math.random() - 0.5) * 18, pete.y - 12, PAL.gold);
        }
        this.bills.forEach(function (bl) {
          drawSpr(ctx, 'bill', (bl.t >> 2) & 1, bl.x, bl.y, bl.vx < 0);
        });
        this.projectiles.forEach(function (pr) {
          drawSpr(ctx, 'brine', (Game.frame >> 3) & 1, pr.x, pr.y);
        });
        Particles.render(ctx);
        Dialogue.renderBarks(ctx);
        Cam.end(ctx);
        drawHUD(ctx, pete);
        // the running tab
        if (Game.spent > 0) {
          var tab = "MAX'S CARD -$" + (Game.spent / 100).toFixed(2);
          TextR.shadow(ctx, tab, Game.W - TextR.width(tab) - 4, 13, PAL.gold);
        }
        // boss health — little pickle pips
        if (gm.active && gm.state !== 'defeated') {
          TextR.centerShadow(ctx, 'THE GREEN MAN', Game.W / 2, 6, PAL.pickleL);
          var bw = 60;
          ctx.fillStyle = rgba(PAL.ink, 0.7);
          ctx.fillRect(Game.W / 2 - bw / 2 - 1, 13, bw + 2, 5);
          ctx.fillStyle = PAL.pickle;
          ctx.fillRect(Game.W / 2 - bw / 2, 14, Math.round(bw * gm.hp / gm.maxHp), 3);
        }
        Dialogue.renderBox(ctx);
        if (pete.dead && goT > 30) {
          ctx.fillStyle = 'rgba(10,10,24,' + Math.min(0.55, (goT - 30) / 80) + ')';
          ctx.fillRect(0, 0, Game.W, Game.H);
          TextR.centerShadow(ctx, 'PETE NEEDS A MOMENT...', Game.W / 2, 80, PAL.tear, 1);
          TextR.center(ctx, 'THE JAR WILL STILL BE THERE. SO WILL LOVE.', Game.W / 2, 92, rgba(PAL.paper, 0.8));
        }
        if (this.paused) {
          ctx.fillStyle = 'rgba(10,10,24,0.6)';
          ctx.fillRect(0, 0, Game.W, Game.H);
          TextR.centerShadow(ctx, 'PAUSED', Game.W / 2, 80, PAL.paper, 2);
        }
        Game.dbg = { pete: pete, lvl: lvl, scene: this, gm: gm };
      }
    };
    return scene;
  }

  /* ============================ ENDING ============================ */
  function endingScene() {
    AudioSys.music('ending');
    var t = 0, creditsY = 200, phase = 0;
    var pete = Entities.makePete(130, 130);
    pete.controllable = false; pete.faceOverride = 2; pete.dir = 1;
    var cheeto = Entities.makeCheeto(160, 137); cheeto.mood = 2;
    var gm = Entities.makeGreenMan(40, 102); gm.frame = 3;
    var jetX = -300;
    var floorLvl = {
      w: 40, h: 23, pxW: 320, pxH: 184,
      solidAtPx: function (x, y) { return y >= 150; },
      onewayAtPx: function () { return false; },
      hazardAtPx: function () { return false; }
    };
    var CREDITS = [
      ["PETE'S RESCUE MISSION", 2, 'gold'],
      ['', 1, 'paper'],
      ['STARRING', 1, 'paper'],
      ['PETE ... AS HIMSELF', 1, 'paper'],
      ['CHEETO ... AS THE BELOVED', 1, 'paper'],
      ['THE GREEN MAN ... AS THE LONELY', 1, 'paper'],
      ['JET PLANE ... AS THE WIND', 1, 'paper'],
      ['', 1, 'paper'],
      ['BUTTONS FOUND: ', 1, 'gold'],
      ['FLOWERS BLOOMED: ', 1, 'petal'],
      ["CHARGED TO MAX'S CARD: ", 1, 'gold'],
      ['', 1, 'paper'],
      ['EVERY STITCH OF ART AND SOUND', 1, 'paper'],
      ['IN THIS GAME IS PURE CODE', 1, 'paper'],
      ['', 1, 'paper'],
      ['FOR MAX', 1, 'gold'],
      ['', 1, 'paper'],
      ['THE END', 2, 'paper'],
      ['I AM PETE', 1, 'gold']
    ];
    var scene = {
      update: function () {
        t++;
        Entities.updatePete(pete, floorLvl);
        cheeto.update();
        if (this.script && this.script.update(this)) this.script = null;
        if (phase === 1) {
          jetX += 2.2;
          creditsY -= 0.25;
          if (t % 20 === 0) Particles.confetti(Math.random() * Game.W, -4);
          if (t % 30 === 0) Particles.petal(Math.random() * Game.W, -4);
          if (Input.wasPressed('action') && creditsY < -20) go('title');
        }
        if (!this.script && phase === 0) {
          var self = this;
          this.script = makeScript([
            { wait: 60 },
            { say: [['', 'THE GREEN MAN GOT HIS FIRST HUG THAT MORNING. AND THEN ANOTHER. AND THEN SEVENTEEN MORE. CHEETO INSISTED.']] },
            { bark: [cheeto, 'WAN!'] },
            { wait: 30 },
            { bark: [pete, 'I AM PETE'] },
            { wait: 50 },
            { say: [['', 'PETE CRIED ONE MORE TIME THAT DAY, WATCHING THE SUN COME UP OVER THE BEDQUILT PLAINS.'],
                    ['', 'HAPPY TEARS THIS TIME.']] },
            { fn: function () { pete.cryTimer = 600; pete.faceOverride = 2; phase = 1; } }
          ]);
        }
        Particles.update(floorLvl);
      },
      render: function (ctx) {
        Levels.bg(ctx, 'sunrise', 0, 0, t, null);
        for (var x = 0; x < 40; x++) {
          var pi = Math.floor(x / 5) % 3;
          ctx.fillStyle = ['#c98ba0', '#8ba3c9', '#a3bb8b'][pi];
          ctx.fillRect(x * 8, 150, 8, 34);
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.fillRect(x * 8, 150, 8, 2);
        }
        Entities.renderGreenMan(gm, ctx);
        cheeto.render(ctx);
        Entities.renderPete(pete, ctx);
        if (phase === 1) {
          ctx.save(); ctx.translate(jetX, 30); ctx.rotate(-0.04);
          ctx.drawImage(SPR.jetplane[0], 0, 0); ctx.restore();
          if (jetX > Game.W + 200) jetX = -400;
        }
        Particles.render(ctx);
        Dialogue.renderBarks(ctx);
        if (phase === 1) {
          var y = creditsY;
          for (var i = 0; i < CREDITS.length; i++) {
            var line = CREDITS[i][0];
            if (i === 8) line += Game.buttons;
            if (i === 9) line += Game.flowers;
            if (i === 10) line += '$' + (Game.spent / 100).toFixed(2);
            if (y > -10 && y < 150 && line) {
              TextR.centerShadow(ctx, line, Game.W / 2, Math.round(y), PAL[CREDITS[i][2]], CREDITS[i][1]);
            }
            y += CREDITS[i][1] * 8 + 4;
          }
          if (creditsY < -140 && (t >> 5) % 2 === 0) {
            TextR.centerShadow(ctx, 'PRESS ENTER', Game.W / 2, 120, PAL.paper);
          }
        }
        Dialogue.renderBox(ctx);
      }
    };
    return scene;
  }

  var makers = {
    title: titleScene, intro: introScene, level: levelScene,
    boss: bossScene, ending: endingScene
  };

  return {
    go: go,
    update: function () {
      if (fade.dir === 1) {
        fade.a = Math.min(1, fade.a + 0.06);
        if (fade.a >= 1 && fade.cb) { var f = fade.cb; fade.cb = null; f(); }
        return; // world holds its breath during fade-out
      }
      if (fade.dir === -1 && fade.a > 0) fade.a = Math.max(0, fade.a - 0.05);
      if (current) current.update();
    },
    render: function (ctx) {
      if (current) current.render(ctx);
      if (fade.a > 0) {
        ctx.fillStyle = 'rgba(8,8,16,' + fade.a + ')';
        ctx.fillRect(0, 0, Game.W, Game.H);
      }
    }
  };
})();
