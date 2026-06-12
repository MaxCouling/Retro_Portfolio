// Procedural WebAudio chiptune — every sound synthesized, no audio files.
var AudioSys = (function () {
  var ctx = null, sfxGain = null, musGain = null, noiseBuf = null;
  var muted = false;
  var seq = { track: null, step: 0, nextTime: 0, timer: null };

  var SEMI = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  function freq(n) {
    var m = /^([A-G]#?)(\d)$/.exec(n);
    if (!m) return 0;
    var midi = SEMI[m[1]] + 12 * (+m[2] + 1);
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function unlock() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.9; sfxGain.connect(ctx.destination);
    musGain = ctx.createGain(); musGain.gain.value = 0.8; musGain.connect(ctx.destination);
    // 1s of white noise, reused for hats / whooshes / roars
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    seq.timer = setInterval(schedule, 50);
  }

  function tone(opt) { // {wave,f0,f1,t,dur,vol,dest,slideExp}
    if (!ctx || muted) return;
    var t = opt.t || ctx.currentTime;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = opt.wave || 'square';
    o.frequency.setValueAtTime(opt.f0, t);
    if (opt.f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, opt.f1), t + opt.dur);
    g.gain.setValueAtTime(opt.vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + opt.dur);
    o.connect(g); g.connect(opt.dest || sfxGain);
    o.start(t); o.stop(t + opt.dur + 0.02);
  }

  function noise(opt) { // {t,dur,vol,hp,lp}
    if (!ctx || muted) return;
    var t = opt.t || ctx.currentTime;
    var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    var g = ctx.createGain();
    g.gain.setValueAtTime(opt.vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + opt.dur);
    var f = ctx.createBiquadFilter();
    f.type = opt.lp ? 'lowpass' : 'highpass';
    f.frequency.value = opt.lp || opt.hp || 1000;
    s.connect(f); f.connect(g); g.connect(opt.dest || sfxGain);
    s.start(t); s.stop(t + opt.dur + 0.02);
  }

  var SFX = {
    bark:    function (t) { tone({ wave: 'square', f0: 420, f1: 160, dur: 0.08, vol: 0.12, t: t });
                            tone({ wave: 'square', f0: 380, f1: 140, dur: 0.09, vol: 0.12, t: t + 0.11 }); },
    bigbark: function (t) { tone({ wave: 'sawtooth', f0: 220, f1: 70, dur: 0.25, vol: 0.16, t: t });
                            tone({ wave: 'sawtooth', f0: 200, f1: 60, dur: 0.3, vol: 0.16, t: t + 0.28 }); },
    wiggle:  function (t) { noise({ t: t, dur: 0.05, vol: 0.04, hp: 2500 }); },
    whup:    function (t) { noise({ t: t, dur: 0.06, vol: 0.05, lp: 700 });
                            tone({ wave: 'triangle', f0: 130, f1: 90, dur: 0.05, vol: 0.05, t: t }); },
    liftoff: function (t) { tone({ wave: 'triangle', f0: 180, f1: 740, dur: 0.45, vol: 0.14, t: t });
                            noise({ t: t, dur: 0.4, vol: 0.05, lp: 900 }); },
    hurt:    function (t) { tone({ wave: 'sawtooth', f0: 300, f1: 70, dur: 0.25, vol: 0.14, t: t }); },
    bonk:    function (t) { tone({ wave: 'square', f0: 140, f1: 60, dur: 0.12, vol: 0.16, t: t });
                            noise({ t: t, dur: 0.08, vol: 0.07, lp: 600 }); },
    pickup:  function (t) { tone({ wave: 'square', f0: freq('C5'), dur: 0.06, vol: 0.08, t: t });
                            tone({ wave: 'square', f0: freq('E5'), dur: 0.06, vol: 0.08, t: t + 0.06 });
                            tone({ wave: 'square', f0: freq('G5'), dur: 0.1, vol: 0.08, t: t + 0.12 }); },
    heal:    function (t) { tone({ wave: 'triangle', f0: freq('G4'), dur: 0.12, vol: 0.1, t: t });
                            tone({ wave: 'triangle', f0: freq('C5'), dur: 0.2, vol: 0.1, t: t + 0.1 }); },
    bloom:   function (t) { ['C5', 'E5', 'G5', 'C6'].forEach(function (n, i) {
                              tone({ wave: 'triangle', f0: freq(n), dur: 0.25, vol: 0.08, t: t + i * 0.07 }); }); },
    tear:    function (t) { tone({ wave: 'sine', f0: 900, f1: 500, dur: 0.08, vol: 0.03, t: t }); },
    splash:  function (t) { noise({ t: t, dur: 0.1, vol: 0.03, hp: 1800 }); },
    spit:    function (t) { noise({ t: t, dur: 0.15, vol: 0.08, lp: 1200 });
                            tone({ wave: 'square', f0: 200, f1: 350, dur: 0.12, vol: 0.07, t: t }); },
    roar:    function (t) { tone({ wave: 'sawtooth', f0: 90, f1: 50, dur: 0.5, vol: 0.18, t: t });
                            noise({ t: t, dur: 0.45, vol: 0.1, lp: 500 }); },
    jet:     function (t) { tone({ wave: 'triangle', f0: 100, f1: 400, dur: 0.9, vol: 0.1, t: t });
                            noise({ t: t, dur: 0.9, vol: 0.06, lp: 800 }); },
    updraft: function (t) { noise({ t: t, dur: 0.3, vol: 0.04, hp: 900 }); },
    hug:     function (t) { ['C4', 'E4', 'G4', 'B4'].forEach(function (n, i) {
                              tone({ wave: 'triangle', f0: freq(n), dur: 1.1, vol: 0.07, t: t + i * 0.12 }); }); },
    select:  function (t) { tone({ wave: 'square', f0: freq('A4'), f1: freq('A5'), dur: 0.09, vol: 0.08, t: t }); },
    poof:    function (t) { noise({ t: t, dur: 0.18, vol: 0.07, lp: 900 }); },
    checkpoint: function (t) { ['G4', 'B4', 'D5'].forEach(function (n, i) {
                              tone({ wave: 'square', f0: freq(n), dur: 0.1, vol: 0.07, t: t + i * 0.08 }); }); },
    kaching:  function (t) { noise({ t: t, dur: 0.04, vol: 0.06, hp: 4000 });
                             tone({ wave: 'square', f0: 1320, dur: 0.05, vol: 0.07, t: t });
                             tone({ wave: 'triangle', f0: 1760, dur: 0.12, vol: 0.08, t: t + 0.05 }); },
    coin:     function (t) { tone({ wave: 'triangle', f0: 2093, f1: 2349, dur: 0.07, vol: 0.06, t: t }); },
    cardout:  function (t) { ['E5', 'G5', 'B5', 'E6'].forEach(function (n, i) {
                              tone({ wave: 'triangle', f0: freq(n), dur: 0.18, vol: 0.08, t: t + i * 0.09 }); }); }
  };
  function sfx(name) {
    if (!ctx || muted || !SFX[name]) return;
    SFX[name](ctx.currentTime);
  }

  /* ---------------- music sequencer ----------------
     Each channel is a string of tokens, one per 8th note:
     note name = attack, '-' = sustain, '.' = rest, 'x' = noise hit. */
  var TRACKS = {
    title: {
      bpm: 92,
      chans: [
        { wave: 'square', vol: 0.045,
          s: 'E4 - G4 - B4 - - - A4 - G4 - E4 - - - D4 - E4 - G4 - - - E4 - - - . - - -' },
        { wave: 'triangle', vol: 0.06,
          s: 'C3 - - - - - - - A2 - - - - - - - F2 - - - - - - - G2 - - - B2 - - -' }
      ]
    },
    plains: {
      bpm: 120,
      chans: [
        { wave: 'square', vol: 0.045,
          s: 'C5 . E5 . G5 E5 C5 . D5 . F5 . A5 F5 D5 . E5 . G5 . B5 G5 E5 . G5 F5 E5 D5 C5 . . .' },
        { wave: 'triangle', vol: 0.065,
          s: 'C3 . G2 . C3 . G2 . F2 . C3 . F2 . C3 . D3 . A2 . D3 . A2 . G2 . D3 . G2 . B2 .' },
        { wave: 'noise', vol: 0.018,
          s: 'x . x x x . x . x . x x x . x . x . x x x . x . x . x x x . x x' }
      ]
    },
    laundry: {
      bpm: 100,
      chans: [
        { wave: 'square', vol: 0.04,
          s: 'A4 - C5 - B4 - A4 - E4 - - - . - - - F4 - A4 - G4 - F4 - E4 - - - . - - -' },
        { wave: 'triangle', vol: 0.065,
          s: 'A2 - - - E2 - - - F2 - - - E2 - - - D2 - - - E2 - - - F2 - E2 - A2 - - -' },
        { wave: 'noise', vol: 0.012,
          s: '. . x . . . x . . . x . . . x . . . x . . . x . . . x . . . x x' }
      ]
    },
    shelf: {
      bpm: 80,
      chans: [
        { wave: 'square', vol: 0.038,
          s: 'B4 - - - G4 - - - A4 - - - E4 - - - . - - - C5 - B4 - A4 - - - B4 - - -' },
        { wave: 'triangle', vol: 0.06,
          s: 'E2 - - - - - - - C3 - - - - - - - A2 - - - - - - - B2 - - - - - - -' }
      ]
    },
    boss: {
      bpm: 140,
      chans: [
        { wave: 'square', vol: 0.05,
          s: 'E5 . E5 . F5 . E5 . D5 . E5 . . . G5 . F5 . E5 . D5 . C5 . B4 . . . D5 .' },
        { wave: 'sawtooth', vol: 0.05,
          s: 'E2 E2 . E2 E2 . E2 . F2 F2 . F2 F2 . F2 . E2 E2 . E2 E2 . E2 . G2 G2 . G2 A2 . B2 .' },
        { wave: 'noise', vol: 0.02,
          s: 'x x x . x x x . x x x . x x x . x x x . x x x . x x x . x x x x' }
      ]
    },
    ending: {
      bpm: 84,
      chans: [
        { wave: 'square', vol: 0.045,
          s: 'E4 - G4 - B4 - - - A4 - G4 - E4 - - - D4 - E4 - G4 - A4 - B4 - C5 - - - - -' },
        { wave: 'triangle', vol: 0.06,
          s: 'C3 - - - - - - - A2 - - - - - - - F2 - - - - - - - G2 - - - C3 - - -' }
      ]
    }
  };
  // pre-split token strings
  for (var k in TRACKS) TRACKS[k].chans.forEach(function (c) { c.tok = c.s.split(/\s+/); });

  function schedule() {
    if (!ctx || !seq.track || muted) return;
    var tr = TRACKS[seq.track];
    var stepDur = 60 / tr.bpm / 2; // 8th notes
    if (seq.nextTime < ctx.currentTime) seq.nextTime = ctx.currentTime + 0.05;
    while (seq.nextTime < ctx.currentTime + 0.2) {
      for (var c = 0; c < tr.chans.length; c++) {
        var ch = tr.chans[c];
        var tok = ch.tok[seq.step % ch.tok.length];
        if (tok === '.' || tok === '-') continue;
        if (tok === 'x') { noise({ t: seq.nextTime, dur: 0.04, vol: ch.vol, hp: 5000, dest: musGain }); continue; }
        // count sustain ('-') tokens ahead for note length
        var len = 1;
        while (ch.tok[(seq.step + len) % ch.tok.length] === '-' && len < 16) len++;
        tone({ wave: ch.wave, f0: freq(tok), dur: stepDur * len * 0.92, vol: ch.vol, t: seq.nextTime, dest: musGain });
      }
      seq.step++;
      seq.nextTime += stepDur;
    }
  }

  function music(name) {
    if (seq.track === name) return;
    seq.track = name; seq.step = 0; seq.nextTime = 0;
  }
  function stopMusic() { seq.track = null; }
  function toggleMute() { muted = !muted; return muted; }

  return {
    unlock: unlock, sfx: sfx, music: music, stopMusic: stopMusic,
    toggleMute: toggleMute, isMuted: function () { return muted; }
  };
})();
