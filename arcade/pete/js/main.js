// Bootstrap — fixed-timestep loop on a 320x180 canvas, integer-scaled.
var Game = {
  W: 320, H: 180,
  frame: 0,
  buttons: 0,
  flowers: 0,
  spent: 0 // cents charged to Max's credit card
};

(function () {
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  Game.ctx = ctx;

  function fit() {
    var s = Math.max(1, Math.min(
      Math.floor(window.innerWidth / Game.W),
      Math.floor(window.innerHeight / Game.H)
    ));
    canvas.style.width = (Game.W * s) + 'px';
    canvas.style.height = (Game.H * s) + 'px';
  }
  window.addEventListener('resize', fit);
  fit();

  if (SPR_WARN.length) console.warn('Sprite grid warnings:', SPR_WARN);

  Input.init();
  Scenes.go('title');

  var last = 0, acc = 0, STEP = 1000 / 60;
  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min(60, now - last);
    last = now;
    acc += dt;
    while (acc >= STEP) {
      Game.frame++;
      Dialogue.update();
      Scenes.update();
      Input.endFrame();
      acc -= STEP;
    }
    ctx.clearRect(0, 0, Game.W, Game.H);
    Scenes.render(ctx);
  }
  requestAnimationFrame(loop);
})();
