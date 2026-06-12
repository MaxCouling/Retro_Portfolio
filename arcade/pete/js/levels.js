// Levels — tilemaps built with a tiny DSL, painted procedurally per theme.
// Tile chars: '#' solid  '%' solid alt  '=' one-way platform
//             '~' hazard 'D' bloom-gate (solid until Pete's tears clear it)
// Entity chars (extracted at load): P spawn, E exit, K checkpoint, * puff,
// o button, m mite, f flower, u updraft/Jet-Plane zone, z cozy item,
// C cheeto, G green man, 1/2/3 story triggers.
var Levels = (function () {
  var T = 8; // tile px

  function NB(w, h) {
    var g = [];
    for (var y = 0; y < h; y++) g.push(new Array(w).fill('.'));
    var b = {
      w: w, h: h, g: g,
      put: function (x, y, c) { if (x >= 0 && x < w && y >= 0 && y < h) g[y][x] = c; },
      rect: function (x0, y0, x1, y1, c) {
        for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) b.put(xx, yy, c);
      },
      ground: function (x0, x1, top, c) { b.rect(x0, top, x1, h - 1, c || '#'); },
      row: function (y, x0, x1, c) { b.rect(x0, y, x1, y, c); },
      col: function (x, y0, y1, c) { b.rect(x, y0, x, y1, c); },
      oneway: function (x, y, len) { b.rect(x, y, x + len - 1, y, '='); }
    };
    return b;
  }

  /* ===================== tile painters ===================== */
  function fr(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function above(g, tx, ty) { return ty > 0 ? g[ty - 1][tx] : '.'; }
  var QUILT_COLS = [['#c98ba0', '#e0aebf'], ['#8ba3c9', '#aec3e0'], ['#a3bb8b', '#c2d6ae']];

  var PAINT = {
    quilt: {
      '#': function (c, x, y, g, tx, ty) {
        var pi = (Math.floor(tx / 5) + Math.floor(ty / 4)) % 3;
        fr(c, x, y, 8, 8, QUILT_COLS[pi][0]);
        if (tx % 5 === 0) for (var i = 0; i < 8; i += 2) fr(c, x, y + i, 1, 1, '#6e5566');
        if (ty % 4 === 0) for (var j = 0; j < 8; j += 2) fr(c, x + j, y, 1, 1, '#6e5566');
        if (above(g, tx, ty) === '.' || above(g, tx, ty) === '~') {
          fr(c, x, y, 8, 2, QUILT_COLS[pi][1]);
          for (var k = 0; k < 8; k += 3) fr(c, x + k, y, 1, 1, '#fff7ee');
        }
      },
      '%': function (c, x, y, g, tx, ty) {
        fr(c, x, y, 8, 8, '#f5f2e8');
        fr(c, x, y + 6, 8, 2, '#d8d2c0');
        if (above(g, tx, ty) === '.') fr(c, x, y, 8, 1, '#ffffff');
      },
      '=': function (c, x, y) {
        fr(c, x, y, 8, 3, '#dcc9a0');
        fr(c, x, y, 8, 1, '#f0e2c0');
        fr(c, x, y + 3, 8, 1, 'rgba(40,30,40,0.25)');
        fr(c, x + 3, y + 1, 1, 1, '#a08a5a');
      },
      '~': function (c, x, y) {
        fr(c, x, y + 5, 8, 3, '#a04848');
        fr(c, x, y + 5, 8, 1, '#bb6060');
        var hs = [3, 1, 2];
        for (var i = 0; i < 3; i++) {
          fr(c, x + 1 + i * 3, y + hs[i], 1, 5 - hs[i], '#9aa0a6');
          fr(c, x + 1 + i * 3, y + hs[i] - 1, 1, 1, '#f0f0f0');
        }
      }
    },
    laundry: {
      '#': function (c, x, y, g, tx, ty) {
        fr(c, x, y, 8, 8, '#3e4a5c');
        if (tx % 4 === 0) fr(c, x, y, 1, 8, '#2a3240');
        if (ty % 4 === 0) fr(c, x, y, 8, 1, '#2a3240');
        if ((tx + ty) % 3 === 0) fr(c, x + 5, y + 5, 1, 1, '#222a36');
        if (above(g, tx, ty) === '.') fr(c, x, y, 8, 1, '#55657c');
      },
      '%': function (c, x, y, g, tx, ty) {
        fr(c, x, y, 8, 8, '#4c8a8a');
        fr(c, x + 4, y + 4, 4, 4, '#3a6a6a');
        if (above(g, tx, ty) === '.') fr(c, x, y, 8, 1, '#66a8a8');
      },
      '=': function (c, x, y) {
        fr(c, x, y, 8, 1, '#c9b890');
        fr(c, x, y + 1, 8, 2, '#7a6a4a');
      },
      '~': function (c, x, y, g, tx) {
        fr(c, x, y + 1, 8, 7, '#8fcfe4');
        fr(c, x, y + 1, 8, 1, '#c5ecf6');
        fr(c, x + ((tx * 5) % 6), y + 4, 2, 2, '#e8f8ff');
      }
    },
    shelf: {
      '#': function (c, x, y, g, tx, ty) {
        fr(c, x, y, 8, 8, '#8a6238');
        fr(c, x + ((tx * 3) % 5), y + 2, 4, 1, '#74502c');
        fr(c, x + ((tx * 7) % 4), y + 5, 3, 1, '#74502c');
        if (tx % 6 === 0) fr(c, x, y, 1, 8, '#5e4022');
        if (above(g, tx, ty) === '.') fr(c, x, y, 8, 1, '#a87c4a');
      },
      '%': function (c, x, y, g, tx, ty) {
        var spines = ['#a04848', '#487aa0', '#7a9a4a', '#9a7a3a', '#7a4a9a'];
        fr(c, x, y, 8, 8, spines[tx % 5]);
        fr(c, x, y, 1, 8, 'rgba(0,0,0,0.3)');
        fr(c, x + 3, y + 2, 3, 1, 'rgba(255,255,255,0.25)');
        if (above(g, tx, ty) === '.') fr(c, x, y, 8, 2, '#e8e0c8');
      },
      '=': function (c, x, y) {
        fr(c, x, y, 8, 3, '#e8d27a');
        for (var i = 0; i < 8; i += 2) fr(c, x + i, y, 1, 1, '#3a3a3a');
      },
      '~': function (c, x, y, g, tx) {
        fr(c, x, y + 3, 8, 5, '#6a6a5e');
        fr(c, x + ((tx * 3) % 5), y + 2, 2, 2, '#7e7e70');
        fr(c, x + ((tx * 5) % 6), y + 5, 1, 1, '#8e8e80');
      },
      'D': function (c, x, y, g, tx, ty) {
        fr(c, x, y, 8, 8, '#5a5a4c');
        fr(c, x + ((tx + ty) % 4), y + 1, 1, 4, '#3e3e34');
        fr(c, x + 4, y + ((tx * 3 + ty) % 5), 3, 1, '#3e3e34');
        fr(c, x + ((tx * 5 + ty) % 7), y + ((ty * 3) % 7), 1, 1, '#8a8a72');
      }
    },
    jar: {
      '#': function (c, x, y, g, tx, ty) {
        fr(c, x, y, 8, 8, '#6ab8a0');
        fr(c, x, y + 7, 8, 1, '#3f7a64');
        fr(c, x + 7, y, 1, 8, '#3f7a64');
        if ((tx + ty) % 4 === 0) fr(c, x + 2, y + 2, 1, 3, '#b8e8d4');
        if (above(g, tx, ty) === '.') fr(c, x, y, 8, 1, '#94d8c0');
      },
      '%': function (c, x, y, g, tx, ty) {
        fr(c, x, y, 8, 8, '#4c8129');
        fr(c, x + ((tx * 3) % 6), y + ((ty * 5) % 6), 2, 2, '#67a83f');
        if (above(g, tx, ty) === '.') fr(c, x, y, 8, 1, '#67a83f');
      },
      '=': function (c, x, y) {
        fr(c, x, y, 8, 2, '#b8e8d4');
        fr(c, x, y + 2, 8, 1, 'rgba(63,122,100,0.5)');
      },
      '~': function (c, x, y, g, tx) {
        fr(c, x, y + 2, 8, 6, '#9db83a');
        fr(c, x, y + 2, 8, 1, '#b8d44e');
        fr(c, x + ((tx * 7) % 6), y + 5, 1, 1, '#7a9426');
      }
    }
  };

  /* ===================== backgrounds (drawn each frame) ===================== */
  function vGrad(ctx, c0, c1) {
    var g = ctx.createLinearGradient(0, 0, 0, Game.H);
    g.addColorStop(0, c0); g.addColorStop(1, c1);
    ctx.fillStyle = g; ctx.fillRect(0, 0, Game.W, Game.H);
  }
  function hump(ctx, x, y, r, col) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.fill();
  }
  function wrapX(x, span) { return ((x % span) + span) % span - span / 2; }

  function bg(ctx, theme, camx, camy, t, lvl) {
    var i, x;
    if (theme === 'quilt') {
      vGrad(ctx, '#ffd9b0', '#ffeed9');
      ctx.fillStyle = 'rgba(255,244,200,0.6)';
      ctx.beginPath(); ctx.arc(52, 34, 16, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff4c8';
      ctx.beginPath(); ctx.arc(52, 34, 11, 0, 7); ctx.fill();
      for (i = 0; i < 6; i++) {
        x = wrapX(i * 110 - camx * 0.15 + 60, 660) + Game.W / 2;
        hump(ctx, x, 128 - camy * 0.05, 46, '#f7f1e2');
        hump(ctx, x + 40, 132 - camy * 0.05, 30, '#efe6d2');
      }
      for (i = 0; i < 7; i++) {
        x = wrapX(i * 95 - camx * 0.4 + 30, 665) + Game.W / 2;
        hump(ctx, x, 168 - camy * 0.1, 52, QUILT_COLS[i % 3][0]);
        hump(ctx, x, 168 - camy * 0.1, 52, 'rgba(255,255,255,0.18)');
      }
    } else if (theme === 'laundry') {
      vGrad(ctx, '#222c3e', '#0d1320');
      // porthole window of light near the top of the abyss
      var py = 60 - camy * 0.35;
      ctx.fillStyle = 'rgba(180,210,240,0.12)';
      ctx.beginPath(); ctx.arc(Game.W / 2, py, 70, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(200,225,250,0.18)';
      ctx.beginPath(); ctx.arc(Game.W / 2, py, 44, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(220,240,255,0.2)';
      ctx.fillRect(Game.W / 2 - 2, py - 44, 4, 88);
      ctx.fillRect(Game.W / 2 - 44, py - 2, 88, 4);
      // hanging sock silhouettes
      for (i = 0; i < 6; i++) {
        x = wrapX(i * 70 - camx * 0.3 + 20, 420) + Game.W / 2;
        var sy = -10 - camy * 0.25 + (i % 2) * 14;
        ctx.fillStyle = 'rgba(10,16,26,0.7)';
        ctx.fillRect(x, sy, 3, 30 + (i % 3) * 8);
        ctx.fillRect(x - 4, sy + 28 + (i % 3) * 8, 10, 9);
      }
      // depth fog
      ctx.fillStyle = 'rgba(5,8,16,' + Math.min(0.45, camy / (lvl ? lvl.h * T : 600) * 0.6) + ')';
      ctx.fillRect(0, 0, Game.W, Game.H);
    } else if (theme === 'shelf') {
      vGrad(ctx, '#8a7152', '#5e4a36');
      // window light shaft
      ctx.fillStyle = 'rgba(255,240,200,0.10)';
      ctx.beginPath();
      ctx.moveTo(30, 0); ctx.lineTo(110, 0); ctx.lineTo(190, Game.H); ctx.lineTo(80, Game.H);
      ctx.closePath(); ctx.fill();
      // forgotten toy silhouettes
      for (i = 0; i < 5; i++) {
        x = wrapX(i * 130 - camx * 0.2 + 50, 650) + Game.W / 2;
        ctx.fillStyle = 'rgba(40,28,18,0.5)';
        ctx.beginPath(); ctx.arc(x, 140 - camy * 0.06, 26, 0, 7); ctx.fill();      // teddy body
        ctx.beginPath(); ctx.arc(x, 110 - camy * 0.06, 17, 0, 7); ctx.fill();      // head
        ctx.beginPath(); ctx.arc(x - 13, 97 - camy * 0.06, 6, 0, 7); ctx.fill();   // ears
        ctx.beginPath(); ctx.arc(x + 13, 97 - camy * 0.06, 6, 0, 7); ctx.fill();
      }
      // drifting dust motes
      ctx.fillStyle = 'rgba(255,240,210,0.35)';
      for (i = 0; i < 14; i++) {
        var mx = (i * 53 + t * 0.12 + i * i) % 340 - 10;
        var my = (i * 37 + Math.sin((t + i * 40) / 90) * 8) % 190;
        ctx.fillRect(mx, my, 1, 1);
      }
    } else if (theme === 'jar') {
      vGrad(ctx, '#1e3a30', '#0f241c');
      // colossal jar
      ctx.strokeStyle = 'rgba(150,220,190,0.25)';
      ctx.lineWidth = 3;
      ctx.strokeRect(24, 18, Game.W - 48, Game.H);
      ctx.fillStyle = 'rgba(150,220,190,0.10)';
      ctx.fillRect(24, 18, Game.W - 48, Game.H);
      ctx.fillStyle = 'rgba(150,220,190,0.18)';
      ctx.fillRect(10, 10, Game.W - 20, 8); // lid rim
      ctx.fillStyle = 'rgba(220,255,240,0.10)';
      ctx.fillRect(50, 18, 14, Game.H); // glass shine
      ctx.fillRect(250, 18, 8, Game.H);
      // rising brine bubbles
      ctx.fillStyle = 'rgba(157,184,58,0.45)';
      for (i = 0; i < 10; i++) {
        var bx = 40 + (i * 61) % 240;
        var by = 190 - ((t * (0.3 + i * 0.05) + i * 67) % 200);
        ctx.fillRect(bx, by, 2, 2);
      }
    } else if (theme === 'night') { // intro bedroom
      vGrad(ctx, '#101a30', '#1c2a48');
      ctx.fillStyle = '#fdf6d8';
      for (i = 0; i < 24; i++) {
        ctx.globalAlpha = 0.3 + ((i * 7) % 5) / 7 + Math.sin((t + i * 30) / 50) * 0.15;
        ctx.fillRect((i * 47) % 320, (i * 29) % 90, 1, 1);
      }
      ctx.globalAlpha = 1;
      // window + moon
      ctx.fillStyle = '#0a1226'; ctx.fillRect(228, 18, 64, 52);
      ctx.fillStyle = '#28406a'; ctx.fillRect(230, 20, 60, 48);
      ctx.fillStyle = '#fdf6d8';
      ctx.beginPath(); ctx.arc(262, 40, 11, 0, 7); ctx.fill();
      ctx.fillStyle = '#28406a';
      ctx.beginPath(); ctx.arc(266, 37, 9, 0, 7); ctx.fill();
      ctx.fillStyle = '#0a1226';
      ctx.fillRect(258, 20, 2, 48); ctx.fillRect(230, 42, 60, 2);
    } else if (theme === 'sunrise') { // ending
      vGrad(ctx, '#ffb86e', '#ffe2b8');
      ctx.fillStyle = '#fff0c0';
      ctx.beginPath(); ctx.arc(160, 120, 34, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,240,192,0.4)';
      ctx.beginPath(); ctx.arc(160, 120, 48, 0, 7); ctx.fill();
      for (i = 0; i < 5; i++) {
        x = wrapX(i * 100 + t * 0.05, 500) + Game.W / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.fillRect(x - 18, 36 + i * 9, 36, 5);
        ctx.fillRect(x - 10, 33 + i * 9, 20, 3);
      }
    }
  }

  /* ===================== level definitions ===================== */
  var defs = [
    {
      name: 'THE BEDQUILT PLAINS', theme: 'quilt', music: 'plains',
      build: function () {
        var b = NB(220, 26);
        b.ground(0, 219, 21);
        // gentle quilt hills (reachable only by flight — that is the point)
        b.ground(24, 35, 18); b.ground(60, 75, 17); b.ground(108, 124, 16);
        b.ground(150, 170, 18); b.ground(188, 219, 15);
        // pillow outcrops
        b.rect(61, 15, 64, 16, '%'); b.rect(110, 13, 114, 15, '%');
        // floating pillow platforms (one-way)
        b.oneway(42, 15, 6); b.oneway(80, 12, 5); b.oneway(95, 14, 6);
        b.oneway(132, 10, 6); b.oneway(160, 13, 5); b.oneway(176, 10, 5);
        // pin-cushion strips on the surface
        b.row(20, 50, 54, '~'); b.row(20, 100, 104, '~'); b.row(17, 151, 155, '~');
        // story + actors
        b.put(4, 19, 'P');
        b.put(8, 20, '1'); b.put(22, 20, '2'); b.put(200, 13, '3'); b.put(210, 8, '3');
        b.put(212, 13, 'E');
        b.put(70, 15, 'K'); b.put(148, 19, 'K');
        b.put(46, 19, 'm'); b.put(90, 19, 'm'); b.put(140, 19, 'm'); b.put(166, 16, 'm');
        var ox = [12, 16, 30, 44, 45, 46, 67, 82, 96, 120, 133, 134, 161, 178, 195];
        var oy = [19, 19, 16, 13, 13, 13, 15, 10, 12, 14, 8, 8, 11, 8, 13];
        for (var i = 0; i < ox.length; i++) b.put(ox[i], oy[i], 'o');
        b.put(36, 19, '*'); b.put(126, 14, '*'); b.put(182, 19, '*');
        b.put(28, 16, 'f'); b.put(58, 19, 'f'); b.put(88, 19, 'f');
        b.put(118, 14, 'f'); b.put(157, 16, 'f'); b.put(196, 13, 'f');
        return b;
      }
    },
    {
      name: 'THE LAUNDRY ABYSS', theme: 'laundry', music: 'laundry',
      build: function () {
        var b = NB(44, 78);
        b.col(0, 0, 77, '#'); b.col(1, 0, 77, '#');
        b.col(42, 0, 77, '#'); b.col(43, 0, 77, '#');
        b.ground(2, 41, 72);
        // the great drum wall — the only way to the exit shaft is DOWN,
        // through the bottom of the abyss
        b.rect(30, 0, 31, 62, '#');
        // descent: alternating ledges (left shaft)
        b.rect(2, 10, 12, 11, '#');                 // start ledge
        b.oneway(16, 14, 6); b.rect(24, 18, 29, 19, '#');
        b.oneway(20, 23, 6); b.rect(2, 27, 13, 28, '#');
        b.oneway(17, 32, 5); b.rect(24, 36, 29, 37, '#');
        b.row(35, 25, 27, '~');                      // soap pool on ledge
        b.oneway(18, 41, 6); b.rect(2, 45, 12, 46, '#');
        b.row(44, 5, 8, '~');
        b.oneway(16, 50, 5); b.rect(24, 54, 29, 55, '#');
        b.oneway(14, 59, 6); b.rect(2, 63, 10, 64, '#');
        // sock shelf decorations
        b.rect(26, 17, 29, 17, '%'); b.rect(5, 26, 7, 26, '%'); b.rect(26, 53, 28, 53, '%');
        // bottom pool room
        b.row(71, 14, 28, '~');
        // right shaft: one-way perches only, so Jet Plane's updraft can
        // carry Pete straight up through them to the exit
        b.oneway(33, 50, 6); b.oneway(33, 30, 6);
        b.oneway(33, 10, 9);                         // exit ledge
        b.put(4, 8, 'P');
        b.put(7, 9, '1');
        b.put(5, 70, 'K');
        b.put(6, 70, '2'); b.put(15, 70, '2'); b.put(24, 70, '2');
        b.rect(34, 66, 37, 69, 'u');                 // Jet Plane updraft zone
        b.put(37, 7, 'E');
        b.put(8, 44, 'm'); b.put(7, 25, 'm'); b.put(27, 52, 'm'); b.put(20, 70, 'm');
        var pts = [[18, 12], [21, 12], [26, 16], [22, 21], [6, 25], [19, 30], [26, 35],
                   [20, 39], [7, 43], [18, 48], [23, 52], [16, 57], [5, 61], [10, 70], [30, 70],
                   [35, 14], [35, 29], [35, 44], [35, 59]];
        for (var i = 0; i < pts.length; i++) b.put(pts[i][0], pts[i][1], 'o');
        b.put(28, 35, '*'); b.put(8, 61, '*'); b.put(38, 70, '*');
        b.put(10, 9, 'f'); b.put(33, 70, 'f');
        return b;
      }
    },
    {
      name: 'THE SHELF OF FORGOTTEN TOYS', theme: 'shelf', music: 'shelf',
      build: function () {
        var b = NB(200, 30);
        b.ground(0, 199, 24);
        // book stacks
        b.rect(20, 20, 24, 23, '%'); b.rect(25, 17, 28, 23, '%');
        b.rect(48, 19, 53, 23, '%'); b.rect(70, 16, 76, 23, '%');
        b.rect(120, 18, 126, 23, '%'); b.rect(142, 15, 147, 23, '%');
        b.rect(166, 19, 172, 23, '%');
        // ruler platforms
        b.oneway(34, 14, 6); b.oneway(58, 12, 5); b.oneway(84, 13, 6);
        b.oneway(110, 11, 5); b.oneway(132, 10, 6); b.oneway(154, 11, 5);
        // dust drifts (hazard-free texture is '~' here? no — dust hurts: lint!)
        b.row(23, 60, 63, '~'); b.row(23, 100, 103, '~'); b.row(23, 152, 155, '~');
        // the dust-bramble gate — floor to ceiling; only tears clear it
        b.rect(98, 0, 99, 23, 'D');
        b.put(4, 22, 'P');
        b.put(8, 23, '1');
        b.put(93, 23, 'z');                          // Cheeto's dropped cozy
        b.put(92, 23, '2');                          // the saddest beat
        b.put(95, 14, '2'); b.put(95, 5, '2');       // catch high-flyers too
        b.put(40, 23, 'K'); b.put(130, 23, 'K');
        b.rect(180, 19, 183, 23, 'u');               // Jet Plane carries Pete up
        b.rect(188, 8, 199, 9, '#');                 // high exit shelf
        b.put(193, 6, 'E');
        b.put(30, 22, 'm'); b.put(66, 22, 'm'); b.put(116, 22, 'm'); b.put(160, 22, 'm');
        var pts = [[14, 22], [27, 15], [36, 12], [50, 17], [60, 10], [73, 14], [86, 11],
                   [105, 22], [112, 9], [123, 16], [134, 8], [145, 13], [156, 9], [170, 17], [186, 22]];
        for (var i = 0; i < pts.length; i++) b.put(pts[i][0], pts[i][1], 'o');
        b.put(44, 22, '*'); b.put(108, 22, '*'); b.put(176, 22, '*');
        // a whole field of wilted flowers — they bloom under Pete's tears
        var fx = [12, 32, 46, 56, 68, 80, 90, 104, 114, 128, 138, 150, 162, 176, 186];
        for (var j = 0; j < fx.length; j++) b.put(fx[j], 23, 'f');
        return b;
      }
    },
    {
      name: 'THE JAR FORTRESS', theme: 'jar', music: 'boss',
      build: function () {
        var b = NB(40, 23);
        b.ground(0, 39, 19);
        b.col(0, 0, 22, '#'); b.col(1, 0, 22, '#');
        b.col(38, 0, 22, '#'); b.col(39, 0, 22, '#');
        b.rect(2, 0, 37, 1, '#'); // jar lid
        b.oneway(8, 14, 5); b.oneway(27, 14, 5);
        b.put(5, 16, 'P');
        b.put(29, 16, 'G');
        b.put(19, 5, 'C');
        return b;
      }
    }
  ];

  /* ===================== loader ===================== */
  var ENT_CHARS = 'PEK*omfuzCG123';
  function load(index) {
    var def = defs[index];
    var b = def.build();
    var lvl = {
      index: index, name: def.name, theme: def.theme, music: def.music,
      w: b.w, h: b.h, pxW: b.w * T, pxH: b.h * T,
      grid: b.g, stubs: [], spawn: { x: 16, y: 16 }
    };
    for (var y = 0; y < b.h; y++) {
      for (var x = 0; x < b.w; x++) {
        var ch = b.g[y][x];
        if (ENT_CHARS.indexOf(ch) >= 0) {
          if (ch === 'P') lvl.spawn = { x: x * T, y: y * T };
          else lvl.stubs.push({ t: ch, x: x * T, y: y * T });
          b.g[y][x] = '.';
        }
      }
    }
    lvl.tileAt = function (tx, ty) {
      if (tx < 0 || tx >= lvl.w) return '#';
      if (ty < 0) return '.';
      if (ty >= lvl.h) return '#';
      return lvl.grid[ty][tx];
    };
    lvl.solidAtPx = function (px, py) {
      var ch = lvl.tileAt(Math.floor(px / T), Math.floor(py / T));
      return ch === '#' || ch === '%' || ch === 'D';
    };
    lvl.onewayAtPx = function (px, py) {
      return lvl.tileAt(Math.floor(px / T), Math.floor(py / T)) === '=';
    };
    lvl.hazardAtPx = function (px, py) {
      return lvl.tileAt(Math.floor(px / T), Math.floor(py / T)) === '~';
    };

    // pre-render all tiles to one big canvas
    lvl.tileCv = document.createElement('canvas');
    lvl.tileCv.width = lvl.pxW; lvl.tileCv.height = lvl.pxH;
    var tc = lvl.tileCv.getContext('2d');
    lvl.paintTile = function (tx, ty) {
      tc.clearRect(tx * T, ty * T, T, T);
      var ch = lvl.grid[ty][tx];
      var p = PAINT[lvl.theme][ch];
      if (p) p(tc, tx * T, ty * T, lvl.grid, tx, ty);
    };
    for (y = 0; y < lvl.h; y++) for (x = 0; x < lvl.w; x++) lvl.paintTile(x, y);

    lvl.setTile = function (tx, ty, ch) {
      lvl.grid[ty][tx] = ch;
      // repaint neighborhood so edge highlights stay correct
      for (var yy = Math.max(0, ty - 1); yy <= Math.min(lvl.h - 1, ty + 1); yy++)
        for (var xx = Math.max(0, tx - 1); xx <= Math.min(lvl.w - 1, tx + 1); xx++)
          lvl.paintTile(xx, yy);
    };
    lvl.clearGate = function () {
      for (var ty = 0; ty < lvl.h; ty++)
        for (var tx = 0; tx < lvl.w; tx++)
          if (lvl.grid[ty][tx] === 'D') lvl.setTile(tx, ty, '.');
    };
    lvl.render = function (ctx) { ctx.drawImage(lvl.tileCv, 0, 0); };
    return lvl;
  }

  return { defs: defs, load: load, bg: bg, T: T };
})();
