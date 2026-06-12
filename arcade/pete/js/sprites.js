// Pete's Rescue Mission — all pixel art, authored as string grids.
// One character = one pixel = one palette key. Compiled once to offscreen
// canvases at boot. No image files anywhere — every sprite is code.
var SPR = {};
var SPR_WARN = [];

function compileGrid(grid, map, name) {
  var h = grid.length, w = 0, r;
  for (r = 0; r < h; r++) if (grid[r].length > w) w = grid[r].length;
  var cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  var c = cv.getContext('2d');
  for (r = 0; r < h; r++) {
    if (grid[r].length !== w) SPR_WARN.push(name + ' row ' + r + ' len ' + grid[r].length + ' != ' + w);
    for (var x = 0; x < grid[r].length; x++) {
      var ch = grid[r][x];
      if (ch === '.' || ch === ' ') continue;
      var key = map[ch];
      if (!key) { SPR_WARN.push(name + ' unknown char "' + ch + '" row ' + r); continue; }
      c.fillStyle = PAL[key] || key;
      c.fillRect(x, r, 1, 1);
    }
  }
  return cv;
}

function defSpr(name, map, frames) {
  SPR[name] = frames.map(function (g, i) { return compileGrid(g, map, name + '#' + i); });
}

// draw helper — integer-snapped, optional horizontal flip and scale
function drawSpr(ctx, name, frame, x, y, flip, scale) {
  var f = SPR[name][frame || 0];
  scale = scale || 1;
  x = Math.round(x); y = Math.round(y);
  if (flip) {
    ctx.save();
    ctx.translate(x + f.width * scale, y);
    ctx.scale(-1, 1);
    ctx.drawImage(f, 0, 0, f.width * scale, f.height * scale);
    ctx.restore();
  } else if (scale !== 1) {
    ctx.drawImage(f, x, y, f.width * scale, f.height * scale);
  } else {
    ctx.drawImage(f, x, y);
  }
}

// row-patching helper for face/eye variants
function variant(base, edits) {
  var g = base.slice();
  for (var k in edits) g[+k] = edits[k];
  return g;
}

/* ============================== PETE ==============================
   20 x 24. Egg-shaped grey plush, cream face mask + belly, rounded
   triangle ears with cream inner, grey eyebrow patches, stitched eyes,
   black nose, tiny stitched smile, blue corduroy shirt band with beige
   pointed collar and two stacked buttons. Arms are a separate sprite
   so they can swing (the helicopter engine!).                        */
var PETE_MAP = {
  G: 'peteGrey', g: 'peteGreyD', C: 'cream', c: 'creamD', K: 'stitch',
  B: 'cordBlue', b: 'cordBlueD', L: 'collar', l: 'collarD', W: 'white'
};
var PETE_TOP = [
  '..GGG..........GGG..',
  '.GGGGG........GGGGG.',
  '.GgCCgG......GgCCgG.',
  '.GGGGGGGGGGGGGGGGGG.',
  'GGGGGGGGGGGGGGGGGGGG',
  'GGGGGCCCCCCCCCCGGGGG',
  'GGGGCCCCCCCCCCCCGGGG',
  'GGGCCCCCCCCCCCCCCGGG',
  'GGGCCCCCCCCCCCCCCGGG'
];
var PETE_FACE_NORM = [
  'GGCCggCCCCCCCCggCCGG',
  'GGCCKKCCCCCCCCKKCCGG',
  'GGCCKKCWWWWWWCKKCCGG',
  'GGCCCCWWWKKWWWCCCCGG',
  'GGGCCCWWKWWKWWCCCGGG',
  'GGGCCCCCWKKWCCCCCGGG'
];
var PETE_FACE_SAD = [
  'GGCCggCCCCCCCCggCCGG',
  'GGCCKKCCCCCCCCKKCCGG',
  'GGCKKCCWWWWWWCCKKCGG',
  'GGCCCCWWWKKWWWCCCCGG',
  'GGGCCCWWKKKKWWCCCGGG',
  'GGGCCCCWKKKKWCCCCGGG'
];
var PETE_FACE_HAPPY = [
  'GGCCKKCCCCCCCCKKCCGG',
  'GGCKCCKCCCCCCKCCKCGG',
  'GGCCCCCWWWWWWCCCCCGG',
  'GGCCCCWWWKKWWWCCCCGG',
  'GGGCCCWWKWWKWWCCCGGG',
  'GGGCCCCWKKKKWCCCCGGG'
];
var PETE_BOT = [
  '.GGLLLLLLLLLLLLLLGG.',
  '.BLLLBBBBBBBBBBLLLB.',
  '.BBLBBBBBWWBBBBBLBB.',
  '.bBBBBBBBWWBBBBBBBb.',
  '.bBBBBBBBBBBBBBBBBb.',
  '.bBBBBBBBWWBBBBBBBb.',
  '.bBBBBBBBWWBBBBBBBb.',
  '..CCCCCCCCCCCCCCCC..',
  '..cCCCc......cCCCc..'
];
defSpr('pete', PETE_MAP, [
  PETE_TOP.concat(PETE_FACE_NORM, PETE_BOT),
  PETE_TOP.concat(PETE_FACE_SAD, PETE_BOT),
  PETE_TOP.concat(PETE_FACE_HAPPY, PETE_BOT)
]);

// Pete's arm: blue corduroy sleeve + cream paw. Pivot near top-center.
defSpr('peteArm', PETE_MAP, [[
  '.BBB.',
  'BBBBB',
  'BBBBB',
  'bBBBb',
  'bBBBb',
  'CCCCC',
  'CCCCC',
  '.CCC.'
]]);

/* ====================== PETE TITLE PORTRAIT =======================
   36 x 44 — the dapper close-up for the title screen, with the
   X-stitched buttons and pointed collar fully visible.              */
defSpr('peteBig', PETE_MAP, [[
  '....GGGG....................GGGG....',
  '...GGGGGG..................GGGGGG...',
  '..GGgCCgGG................GGgCCgGG..',
  '..GGgCCCgG................GgCCCgGG..',
  '..GGgCCCgGG..............GGgCCCgGG..',
  '..GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG..',
  '.GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG..',
  '.GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG.',
  'GGGGGGGGCCCCCCCCCCCCCCCCCCCCGGGGGGGG',
  'GGGGGGCCCCCCCCCCCCCCCCCCCCCCCCGGGGGG',
  'GGGGGCCCCCCCCCCCCCCCCCCCCCCCCCCGGGGG',
  'GGGGCCCCCCCCCCCCCCCCCCCCCCCCCCCCGGGG',
  'GGGGCCggggCCCCCCCCCCCCCCCCggggCCGGGG',
  'GGGCCCggggCCCCCCCCCCCCCCCCggggCCCGGG',
  'GGGCCCKKKKCCCCCCCCCCCCCCCCKKKKCCCGGG',
  'GGGCCCKKKKCCCCCCCCCCCCCCCCKKKKCCCGGG',
  'GGGCCCKWKKCCCWWWWWWWWWWCCCKWKKCCCGGG',
  'GGGCCCCCCCCWWWWWWWWWWWWWWCCCCCCCCGGG',
  'GGGCCCCCCCWWWWWWKKKKWWWWWWCCCCCCCGGG',
  'GGGCCCCCCCWWWWWKKKKKKWWWWWCCCCCCCGGG',
  'GGGGCCCCCCWWWWWWKKKKWWWWWWCCCCCGGGGG',
  'GGGGCCCCCCWWWKWWWWWWWWKWWWCCCCCGGGGG',
  'GGGGGCCCCCWWWWKKWWWWKKWWWWCCCCGGGGGG',
  'GGGGGGCCCCCWWWWWKKKKWWWWWCCCCGGGGGGG',
  '.GGGGGGCCCCCWWWWWWWWWWWWCCCCGGGGGGG.',
  '.GGGGGGGGCCCCCCCCCCCCCCCCGGGGGGGGG..',
  '..GGLLLLLLLLLLLLLLLLLLLLLLLLLLGG....',
  '..GLLLLLLLLLLLLLLLLLLLLLLLLLLLLG....',
  '..BLLLLLLlBBBBBBBBBBBBlLLLLLLLLB....',
  '..BBLLLLlBBBBBBBBBBBBBBlLLLLLBBB....',
  '..BBBLLlBBBBBBBBBBBBBBBBlLLBBBBB....',
  '..BBBBlBBBBBBBWWWBBBBBBBBlBBBBBb....',
  '..bBBBBBBBBBBBWKWBBBBBBBBBBBBBBb....',
  '..bBBBBBBBBBBBKWKBBBBBBBBBBBBBBb....',
  '..bBBBBBBBBBBBWWWBBBBBBBBBBBBBBb....',
  '..bBBBBBBBBBBBBBBBBBBBBBBBBBBBBb....',
  '..bBBBBBBBBBBBWWWBBBBBBBBBBBBBBb....',
  '..bBBBBBBBBBBBWKWBBBBBBBBBBBBBBb....',
  '..bBBBBBBBBBBBKWKBBBBBBBBBBBBBBb....',
  '..bBBBBBBBBBBBWWWBBBBBBBBBBBBBBb....',
  '...CCCCCCCCCCCCCCCCCCCCCCCCCCCC.....',
  '...CCCCCCCCCCCCCCCCCCCCCCCCCCCC.....',
  '...cCCCCCCc..........cCCCCCCc.......',
  '....cccccc............cccccc........'
]]);

/* ============================= CHEETO =============================
   24 x 26 — drawn from the real plush, in profile facing right.
   One huge embroidered eye (black outline, white ring, brown iris),
   a giant open mouth with deep red interior and white corner fangs,
   a broad white felt chainsaw blade with a jagged grey back edge
   rising from the forehead, and the brown handle arcing off the
   back of his head. Stubby legs dangle underneath.                  */
var CHEETO_MAP = {
  O: 'cheeto', d: 'cheetoD', L: 'cheetoL', S: 'blade', s: 'bladeD',
  H: 'handle', h: 'handleD', K: 'stitch', W: 'white', R: 'mouthRed',
  r: 'mouthRedD', I: 'handle'
};
var CHEETO_BASE = [
  '.............sSS........',
  '............sSWWS.......',
  '.............SWWWS......',
  '............sSWWWS......',
  '...hHHh......SWWWS......',
  '..hHHHHh....sSWWWS......',
  '..hHh.hHh....SWWWS......',
  '.hHh...hHh..sSWWSS......',
  '.hHh....hHhOOSSSSOOO....',
  '.hHh..OOOOOOOOOOOOOOO...',
  '..hOOOOOOOOOOOOOOOOOOO..',
  '..OOOOOOOOOOOOOOOOOOOO..',
  '.OOOOOOOOKKKKOOOOOOOOOO.',
  '.OOOOOOOKWWWWKOOOOOOOOO.',
  'OOOOOOOKWWIIWWKOOOOOOOOO',
  'OOOOOOOKWIIIIWKOOOOOOOOO',
  '.OOOOOOOKWWWWKOOOOOOOOO.',
  '.OOOOOOOOKKKKOOOOOOOOOO.',
  '.OOOOOOOOKKKKKKKKKKKKK..',
  '.OOOOOOOKWRRRRRRRRRRWK..',
  '..OOOOOOKRRRRRRRRRRRRK..',
  '..OOOOOOKRRRRrrrrRRRRK..',
  '...OOOOOOKRRrrrrrrRRK...',
  '....OOOOOKKKKKKKKKKK....',
  '.....dOOd...dOOd........',
  '......dd.....dd.........'
];
defSpr('cheeto', CHEETO_MAP, [
  CHEETO_BASE,
  // sad / distressed: iris sunk to the bottom of the eye, worried
  variant(CHEETO_BASE, {
    14: 'OOOOOOOKWWWWWWKOOOOOOOOO',
    15: 'OOOOOOOKWIIIIWKOOOOOOOOO',
    16: '.OOOOOOOKIIIIKOOOOOOOOO.'
  }),
  // happy: eye closed in a joyful arc
  variant(CHEETO_BASE, {
    12: '.OOOOOOOOOOOOOOOOOOOOOO.',
    13: '.OOOOOOOOKKKKOOOOOOOOOO.',
    14: 'OOOOOOOKKOOOOKKOOOOOOOOO',
    15: 'OOOOOOOOOOOOOOOOOOOOOOOO',
    16: '.OOOOOOOOOOOOOOOOOOOOOO.',
    17: '.OOOOOOOOOOOOOOOOOOOOOO.'
  })
]);

/* =========================== GREEN MAN ============================
   16 x 26 — the armless, legless pickle villain. Drawn 2x in the
   boss fight. Bumpy rind, angry unibrow. He has never had a hug.    */
var GM_MAP = {
  P: 'pickle', p: 'pickleD', L: 'pickleL', K: 'stitch', W: 'white', R: 'mouthRed'
};
var GM_BASE = [
  '.....PPPPPP.....',
  '....PPPPPPPP....',
  '...PPpPPPPpPP...',
  '..PPPPPPPPPPPP..',
  '..PPPPPPPPPPPP..',
  '.PPKKKKKKKKKKPP.',
  '.PPWWKPPPPKWWPP.',
  '.PPWWWPPPPWWWPP.',
  '.PpPPPPPPPPPPpP.',
  '.PPPPKKKKKKPPPP.',
  '.PPPPPPPPPPPPPP.',
  '.PLPPPPpPPPPPLP.',
  '.PPPPPPPPPPPPPP.',
  '.PPpPPPPPPPpPPP.',
  '.PPPPPPpPPPPPPP.',
  '.PLPPPPPPPPPPLP.',
  '.PPPPPPPPPPPPPP.',
  '.PPpPPPPPPpPPPP.',
  '.PPPPPPPPPPPPPP.',
  '.PPPPPpPPPPPPPP.',
  '.PPPPPPPPPPpPPP.',
  '..PPPPPPPPPPPP..',
  '..PPpPPPPPPPPP..',
  '..PPPPPPPPPPPP..',
  '...PPPPPPPPPP...',
  '....PPPPPPPP....'
];
defSpr('greenman', GM_MAP, [
  GM_BASE,
  // spitting: mouth wide, red interior
  variant(GM_BASE, {
    9:  '.PPPKKKKKKKKPPP.',
    10: '.PPPKRRRRRRKPPP.',
    11: '.PLPPKKKKKKPPPLP'
  }),
  // tired: droopy eyes, gasping mouth
  variant(GM_BASE, {
    5:  '.PPPPPPPPPPPPPP.',
    6:  '.PPKKWPPPPWKKPP.',
    7:  '.PPWWWPPPPWWWPP.',
    9:  '.PPPPKKKKKKPPPP.',
    10: '.PPPPKRRRRKPPPP.'
  }),
  // crying: squeezed-shut eyes (tears come from particles)
  variant(GM_BASE, {
    5:  '.PPPPPPPPPPPPPP.',
    6:  '.PPKKKPPPPKKKPP.',
    7:  '.PPPPPPPPPPPPPP.',
    9:  '.PPPPKKKKKKPPPP.',
    10: '.PPPKKPPPPKKPPP.'
  })
]);

/* =========================== JET PLANE ============================
   52 x 22 — the majestic long-haired black German Shepherd, soaring
   in profile. Drawn big in the sky with a flowing fur trail.        */
var JET_MAP = {
  J: 'jetBlack', j: 'jetGrey', d: 'jetDark', B: 'jetBrown', K: 'stitch', T: 'collar'
};
// pad ragged rows with transparency — the silhouette is what matters here
function padRows(g) {
  var w = 0;
  g.forEach(function (r) { if (r.length > w) w = r.length; });
  return g.map(function (r) { while (r.length < w) r += '.'; return r; });
}
defSpr('jetplane', JET_MAP, [padRows([
  '......................................JJ....JJ......',
  '.....................................JjJ....JjJ.....',
  '.....................................JJJJ..JJJJ.....',
  'J....................................JjJJJJJJjJ.....',
  'JJ..J................................JJJJJJJJJJJ....',
  'JJJ.JJ..J...........................JJJJJJJJJJJJ....',
  '.JJJJJJJJ..........................JJJJBBJJJJjJJJ...',
  '.JJjJJJJJJJ.....................JJJJJJJJJJJJJJJJJJ..',
  '..JJjjJJJJJJJJ..............JJJJJJJJJJJJJJJJJJJjjJK.',
  '..JJJjjJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJK',
  '...JJJjjjJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ..',
  '....JJJjjjjJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ....',
  '.....JJJJjjjJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ......',
  '......JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ.........',
  '....JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ............',
  '...JJJJ..JJJJJJJJJJJJJJJJJJJJJJJJJJJ...............',
  '..JJJ......JJJJJ...JJJJJJ....JJJJJ..................',
  '.JJ.........JJJJ....JJJJJ.....JJJJ..................',
  'JJ...........dJJJ....dJJJ......dJJJ.................',
  '..............dJJ.....dJJ.......dJJ.................',
  '...............dd......dd........dd.................',
  '....................................................'
])]);

/* ======================= SMALL SPRITES & PROPS ===================== */
var UI_MAP = {
  R: 'heartRed', r: 'heartDark', K: 'stitch', W: 'white', G: 'gold',
  g: 'goldD', P: 'white', C: 'cream', c: 'creamD', B: 'cordBlue',
  s: 'blade', S: 'bladeD', L: 'petal', l: 'leaf', E: 'peteGreyD',
  e: 'peteGrey', d: 'pickleD', p: 'pickle'
};

defSpr('heart', UI_MAP, [
  ['.RR.RR.', 'RRRRRRR', 'RWRRRRR', '.RRRRR.', '..RRR..', '...R...'],
  ['.rr.rr.', 'r..r..r', 'r.....r', '.r...r.', '..r.r..', '...r...']
]);

defSpr('buttonPickup', UI_MAP, [
  ['.GGGG.', 'GGKGKG', 'GGGGGG', 'GGKGKG', '.GGGG.', '......'],
  ['.gggg.', 'ggKgKg', 'gggggg', 'ggKgKg', '.gggg.', '......']
]);

// stuffing puff — heals one heart
defSpr('puff', UI_MAP, [
  ['..WWW...', '.WWWWWW.', 'WWWWWWWW', 'WWWWWWWW', '.WWWWWC.', '..CWWC..'],
  ['..WWWW..', '.WWWWWW.', 'WWWWWWWW', 'WWWWWWWW', '.CWWWWW.', '...CWC..']
]);

// exit star door
defSpr('exitStar', UI_MAP, [[
  '.....GG.....',
  '.....GG.....',
  '....GGGG....',
  'GGGGGGGGGGGG',
  '.GGGGGGGGGG.',
  '..GGGGGGGG..',
  '...GGGGGG...',
  '...GGGGGG...',
  '..GGG..GGG..',
  '.GG......GG.',
  '............',
  '............'
]]);

// wilted (grey) and bloomed flower
defSpr('flower', UI_MAP, [
  [
    '..........',
    '...EEE....',
    '..EEEEE...',
    '...EEE....',
    '....e.....',
    '....l.....',
    '....l.....',
    '...ll.....',
    '....l.....',
    '....l.....'
  ],
  [
    '...LLL....',
    '..LLLLL...',
    '.LLLGLLL..',
    '..LLLLL...',
    '...LLL....',
    '....l.....',
    '....l.....',
    '...ll.....',
    '....l.....',
    '....l.....'
  ]
]);

// checkpoint pillow — a soft spot to rest
defSpr('pillow', UI_MAP, [
  ['..WWWWWWWWWW..', '.WWWWWWWWWWWW.', 'WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', '.cWWWWWWWWWWc.', '..cccccccccc..'],
  ['..CCCCCCCCCC..', '.CWWWWWWWWWWC.', 'CWWWWWWWWWWWWC', 'CWWWWWWWWWWWWC', '.cCWWWWWWWWCc.', '..cccccccccc..']
]);

// lint mite — small grumpy dust enemy
defSpr('mite', UI_MAP, [
  ['..EEEE....', '.EEEEEE...', 'EEKEEKEE..', 'EEEEEEEE..', '.EeEEeE...', '..e..e....'],
  ['..EEEE....', '.EEEEEE...', 'EEKEEKEE..', 'EEEEEEEE..', '.eEEEEe...', '.e....e...']
]);

// brine glob projectile
defSpr('brine', { B: 'brine', b: 'brineD' }, [
  ['.BB.', 'BBBB', 'bBBb', '.bb.'],
  ['.bB.', 'BBbB', 'bBBB', '.Bb.']
]);

// Cheeto's dropped chainsaw-blade cozy (story item, level 3)
defSpr('cozy', UI_MAP, [[
  '..ssssss..',
  '.sSSSSSSs.',
  '.sSBBBBSs.',
  '.sSBSSBSs.',
  '.sSSSSSSs.',
  '..ssssss..'
]]);

// little white bone collectible? no — sparkle for shines
defSpr('sparkle', UI_MAP, [
  ['..W..', '.WWW.', 'WWWWW', '.WWW.', '..W..'],
  ['..W..', '..W..', 'WWWWW', '..W..', '..W..']
]);

// MAX'S CREDIT CARD — the ultimate weapon. Emergency use only.
defSpr('card', { G: 'gold', B: 'cordBlue', W: 'white', K: 'stitch', g: 'goldD' }, [[
  'GGGGGGGGGGGG',
  'GBBBBBBBBBBG',
  'GBWWWWWWWWBG',
  'GBBBBBBBBBBG',
  'GBggBBBBBBBG',
  'GBggBBBBBBBG',
  'GBBBBBBBBBBG',
  'GBKKKKKBBBBG',
  'GGGGGGGGGGGG'
]]);

// flying money — debt in motion
defSpr('bill', { G: '#7ab55a', g: '#4e8a3a', W: 'cream', K: 'stitch' }, [
  ['gggggggg', 'gGGWWGGg', 'gGWKKWGg', 'gGGWWGGg', 'gggggggg'],
  ['gggggggg', 'gGWWWWGg', 'gGWKKWGg', 'gGGGGGGg', 'gggggggg']
]);
