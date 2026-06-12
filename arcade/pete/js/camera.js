// Smooth-follow camera with screen shake and level-bounds clamping.
var Cam = (function () {
  var c = { x: 0, y: 0, shake: 0, sx: 0, sy: 0 };

  function follow(target, lvl, instant) {
    var tx = target.x + target.w / 2 - Game.W / 2;
    var ty = target.y + target.h / 2 - Game.H / 2 - 12; // look slightly above
    if (instant) { c.x = tx; c.y = ty; }
    else {
      c.x += (tx - c.x) * 0.12;
      c.y += (ty - c.y) * 0.1;
    }
    var maxX = lvl.w * Physics.TILE - Game.W;
    var maxY = lvl.h * Physics.TILE - Game.H;
    c.x = Math.max(0, Math.min(maxX, c.x));
    c.y = Math.max(0, Math.min(maxY, c.y));
    if (c.shake > 0) {
      c.shake--;
      c.sx = (Math.random() - 0.5) * Math.min(6, c.shake);
      c.sy = (Math.random() - 0.5) * Math.min(6, c.shake);
    } else { c.sx = 0; c.sy = 0; }
  }

  function begin(ctx) {
    ctx.save();
    ctx.translate(-Math.round(c.x + c.sx), -Math.round(c.y + c.sy));
  }
  function end(ctx) { ctx.restore(); }

  return {
    follow: follow, begin: begin, end: end,
    get x() { return c.x; }, get y() { return c.y; },
    set x(v) { c.x = v; }, set y(v) { c.y = v; },
    addShake: function (n) { c.shake = Math.max(c.shake, n); }
  };
})();
