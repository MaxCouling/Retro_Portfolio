// Speech bubbles (barks) in world space + queued bottom textboxes for story.
var Dialogue = (function () {
  var barks = [];        // {ent, text, t, life}
  var queue = [];        // {who, text}
  var cur = null;
  var onDone = null;

  var WHO_COL = {
    'PETE': PAL.cordBlueL, 'CHEETO': PAL.cheeto, 'GREEN MAN': PAL.pickleL,
    'JET PLANE': PAL.peteGrey, '': PAL.paper
  };

  function bark(ent, text) {
    barks.push({ ent: ent, text: text, t: 0, life: 80 });
    AudioSys.sfx('bark');
  }

  // lines: [['PETE','...'], ...]; cb fires after the last box closes
  function run(lines, cb) {
    for (var i = 0; i < lines.length; i++) queue.push({ who: lines[i][0], text: lines[i][1] });
    onDone = cb || null;
  }
  function busy() { return !!cur || queue.length > 0; }

  function wrap(text, maxChars) {
    var words = text.split(' '), lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      if ((line + ' ' + words[i]).trim().length > maxChars) { lines.push(line.trim()); line = words[i]; }
      else line += ' ' + words[i];
    }
    if (line.trim()) lines.push(line.trim());
    return lines;
  }

  function update() {
    for (var i = barks.length - 1; i >= 0; i--) {
      barks[i].t++;
      if (barks[i].t > barks[i].life) barks.splice(i, 1);
    }
    if (!cur && queue.length) { cur = queue.shift(); cur.n = 0; cur.lines = wrap(cur.text, 66); }
    if (cur) {
      cur.n += 0.8;
      var total = cur.text.length;
      if (Input.wasPressed('action')) {
        if (cur.n < total) cur.n = total;
        else {
          cur = null;
          AudioSys.sfx('select');
          if (!queue.length && onDone) { var f = onDone; onDone = null; f(); }
        }
      }
    }
  }

  // world-space bubbles — call inside camera transform
  function renderBarks(ctx) {
    for (var i = 0; i < barks.length; i++) {
      var b = barks[i];
      var bw = TextR.width(b.text) + 6;
      var x = Math.round(b.ent.x + b.ent.w / 2 - bw / 2);
      var y = Math.round(b.ent.y - 14 - (b.t < 6 ? (6 - b.t) : 0));
      var a = b.t > b.life - 15 ? (b.life - b.t) / 15 : 1;
      ctx.globalAlpha = a;
      ctx.fillStyle = PAL.paper;
      ctx.fillRect(x, y, bw, 9);
      ctx.fillStyle = PAL.ink;
      ctx.fillRect(x, y - 1, bw, 1); ctx.fillRect(x, y + 9, bw, 1);
      ctx.fillRect(x - 1, y, 1, 9); ctx.fillRect(x + bw, y, 1, 9);
      // tail
      ctx.fillStyle = PAL.paper;
      ctx.fillRect(x + bw / 2 - 1, y + 9, 2, 2);
      TextR.draw(ctx, b.text, x + 3, y + 2, PAL.ink);
      ctx.globalAlpha = 1;
    }
  }

  // screen-space textbox — call outside camera transform
  function renderBox(ctx) {
    if (!cur) return;
    var x = 8, y = Game.H - 46, w = Game.W - 16, h = 40;
    ctx.fillStyle = rgba(PAL.ink, 0.92);
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = PAL.paper;
    ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
    if (cur.who) TextR.draw(ctx, cur.who, x + 5, y + 4, WHO_COL[cur.who] || PAL.gold);
    var shown = 0, n = Math.floor(cur.n);
    for (var l = 0; l < cur.lines.length; l++) {
      var line = cur.lines[l];
      var take = Math.max(0, Math.min(line.length, n - shown));
      if (take > 0) TextR.draw(ctx, line.slice(0, take), x + 5, y + 12 + l * 7, PAL.paper);
      shown += line.length;
    }
    if (cur.n >= cur.text.length && (Game.frame >> 4) % 2 === 0) {
      TextR.draw(ctx, '>', x + w - 8, y + h - 8, PAL.gold);
    }
  }

  return {
    bark: bark, run: run, busy: busy, update: update,
    renderBarks: renderBarks, renderBox: renderBox,
    clear: function () { barks = []; queue = []; cur = null; onDone = null; }
  };
})();
