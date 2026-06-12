// Keyboard input + the tap detector that powers Pete's wiggle engine.
var Input = (function () {
  var down = {};            // currently held logical keys
  var pressed = {};         // edge-triggered this frame
  var taps = [];            // {dir:-1|1, time:ms} — left/right keydown events

  var MAP = {
    ArrowLeft: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right',
    ArrowUp: 'up', w: 'up', W: 'up',
    ArrowDown: 'down', s: 'down', S: 'down',
    ' ': 'action', Enter: 'action', z: 'action', Z: 'action', x: 'action', X: 'action',
    p: 'pause', P: 'pause', m: 'mute', M: 'mute', Escape: 'skip'
  };

  function kd(e) {
    AudioSys.unlock();
    var k = MAP[e.key];
    if (k === undefined && e.key.indexOf('Arrow') === 0) k = null;
    if (k !== undefined) e.preventDefault();
    if (!k || e.repeat) return;
    if (!down[k]) {
      pressed[k] = true;
      if (k === 'left') taps.push({ dir: -1, time: performance.now() });
      if (k === 'right') taps.push({ dir: 1, time: performance.now() });
    }
    down[k] = true;
  }
  function ku(e) {
    var k = MAP[e.key];
    if (k) down[k] = false;
  }
  function init() {
    addEventListener('keydown', kd);
    addEventListener('keyup', ku);
  }
  function endFrame() {
    pressed = {};
    if (taps.length > 8) taps.splice(0, taps.length - 8);
  }
  return {
    init: init,
    endFrame: endFrame,
    held: function (k) { return !!down[k]; },
    wasPressed: function (k) { return !!pressed[k]; },
    consumeTaps: function () { var t = taps; taps = []; return t; }
  };
})();
