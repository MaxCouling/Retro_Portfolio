// AABB entity-vs-tilemap collision, tuned soft and floaty for plushes.
var Physics = (function () {
  var TILE = 8;

  // sample points along an edge every <=TILE px (corners always included)
  function samples(a, b) {
    var pts = [a];
    for (var v = a + TILE; v < b; v += TILE) pts.push(v);
    pts.push(b);
    return pts;
  }

  // moves entity by its velocity, resolving against level solids.
  // entity: {x,y,w,h,vx,vy,onGround}
  function step(e, lvl) {
    var i, pts;
    // ---- horizontal ----
    var nx = e.x + e.vx;
    if (e.vx > 0) {
      pts = samples(e.y, e.y + e.h - 1);
      for (i = 0; i < pts.length; i++) {
        if (lvl.solidAtPx(nx + e.w, pts[i])) {
          nx = (((nx + e.w) / TILE) | 0) * TILE - e.w - 0.01;
          e.vx = 0; break;
        }
      }
    } else if (e.vx < 0) {
      pts = samples(e.y, e.y + e.h - 1);
      for (i = 0; i < pts.length; i++) {
        if (lvl.solidAtPx(nx, pts[i])) {
          nx = (((nx / TILE) | 0) + 1) * TILE + 0.01;
          e.vx = 0; break;
        }
      }
    }
    e.x = nx;

    // ---- vertical ----
    var prevBottom = e.y + e.h;
    var ny = e.y + e.vy;
    e.onGround = false;
    if (e.vy >= 0) {
      pts = samples(e.x, e.x + e.w - 1);
      for (i = 0; i < pts.length; i++) {
        var by = ny + e.h;
        var tileTop = ((by / TILE) | 0) * TILE;
        if (lvl.solidAtPx(pts[i], by) ||
            (lvl.onewayAtPx(pts[i], by) && prevBottom <= tileTop + 0.01)) {
          ny = tileTop - e.h;
          e.vy = 0; e.onGround = true; break;
        }
      }
    } else {
      pts = samples(e.x, e.x + e.w - 1);
      for (i = 0; i < pts.length; i++) {
        if (lvl.solidAtPx(pts[i], ny)) {
          ny = (((ny / TILE) | 0) + 1) * TILE + 0.01;
          e.vy = 0; break;
        }
      }
    }
    e.y = ny;
  }

  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  return { TILE: TILE, step: step, overlap: overlap };
})();
