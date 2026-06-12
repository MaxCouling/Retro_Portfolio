// Crisp 3x5 pixel font, rendered as rects so it stays chunky at any scale.
var TextR = (function () {
  var G = {
    'A': '010101111101101', 'B': '110101110101110', 'C': '011100100100011',
    'D': '110101101101110', 'E': '111100110100111', 'F': '111100110100100',
    'G': '011100101101011', 'H': '101101111101101', 'I': '111010010010111',
    'J': '001001001101010', 'K': '101101110101101', 'L': '100100100100111',
    'M': '101111111101101', 'N': '110101101101101', 'O': '010101101101010',
    'P': '110101110100100', 'Q': '010101101011001', 'R': '110101110101101',
    'S': '011100010001110', 'T': '111010010010010', 'U': '101101101101111',
    'V': '101101101101010', 'W': '101101111111101', 'X': '101101010101101',
    'Y': '101101010010010', 'Z': '111001010100111',
    '0': '111101101101111', '1': '010110010010111', '2': '110001010100111',
    '3': '111001011001111', '4': '101101111001001', '5': '111100110001110',
    '6': '011100111101111', '7': '111001010010010', '8': '111101111101111',
    '9': '111101111001110',
    '.': '000000000000010', ',': '000000000010100', '!': '010010010000010',
    '?': '110001010000010', "'": '010100000000000', '-': '000000111000000',
    ':': '000010000010000', '/': '001001010100100', '+': '000010111010000',
    '(': '010100100100010', ')': '010001001001010',
    '>': '100110111110100', '<': '001011111011001',
    '~': '000011110000000', '"': '101101000000000',
    // '@' renders a little heart
    '@': '101111111010000'
  };
  function draw(ctx, str, x, y, color, scale) {
    scale = scale || 1;
    ctx.fillStyle = color || PAL.paper;
    str = String(str).toUpperCase();
    var cx = x;
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (ch === '\n') { y += 7 * scale; cx = x; continue; }
      var g = G[ch];
      if (g) {
        for (var p = 0; p < 15; p++) {
          if (g[p] === '1') {
            ctx.fillRect(cx + (p % 3) * scale, y + ((p / 3) | 0) * scale, scale, scale);
          }
        }
      }
      cx += 4 * scale;
    }
  }
  function width(str, scale) {
    scale = scale || 1;
    var max = 0, cur = 0;
    str = String(str);
    for (var i = 0; i < str.length; i++) {
      if (str[i] === '\n') { if (cur > max) max = cur; cur = 0; }
      else cur++;
    }
    if (cur > max) max = cur;
    return max * 4 * scale - scale; // drop trailing gap
  }
  function center(ctx, str, cx, y, color, scale) {
    draw(ctx, str, Math.round(cx - width(str, scale) / 2), y, color, scale);
  }
  // text with a 1px drop shadow for readability over scenes
  function shadow(ctx, str, x, y, color, scale) {
    draw(ctx, str, x + (scale || 1), y + (scale || 1), PAL.ink, scale);
    draw(ctx, str, x, y, color, scale);
  }
  function centerShadow(ctx, str, cx, y, color, scale) {
    var x = Math.round(cx - width(str, scale) / 2);
    shadow(ctx, str, x, y, color, scale);
  }
  return { draw: draw, width: width, center: center, shadow: shadow, centerShadow: centerShadow };
})();
