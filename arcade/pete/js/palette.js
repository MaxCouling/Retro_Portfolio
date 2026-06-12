// Pete's Rescue Mission — palette
// Hues sampled from the real plushes: Pete's grey/cream fur and blue
// corduroy shirt, Cheeto's bright orange, the Green Man's pickle green,
// Jet Plane's jet-black coat.
var PAL = {
  // Pete
  peteGrey:  '#b6bdb7',
  peteGreyD: '#929b94',
  cream:     '#f1ead7',
  creamD:    '#d9d0b8',
  white:     '#fbf8ee',
  stitch:    '#33333a',
  cordBlue:  '#4d77a3',
  cordBlueD: '#3a5d84',
  cordBlueL: '#6790ba',
  collar:    '#ddd4b6',
  collarD:   '#c3b893',

  // Cheeto — peachy orange like the real plush
  cheeto:    '#f2a05a',
  cheetoD:   '#d07c33',
  cheetoL:   '#f8c084',
  blade:     '#c2c8bd',
  bladeD:    '#8d958c',
  handle:    '#6e4b2a',
  handleD:   '#523619',
  mouthRed:  '#a32420',
  mouthRedD: '#7c1714',

  // Green Man
  pickle:    '#67a83f',
  pickleD:   '#4c8129',
  pickleL:   '#8ac361',
  brine:     '#9db83a',
  brineD:    '#7a9426',

  // Jet Plane
  jetBlack:  '#22222c',
  jetDark:   '#15151d',
  jetGrey:   '#3c3c4c',
  jetBrown:  '#8a5a32',

  // World / UI
  ink:       '#1a1a24',
  paper:     '#f7f3e6',
  gold:      '#e8b53a',
  goldD:     '#b8862a',
  heartRed:  '#d9485a',
  heartDark: '#5a2a3a',
  tear:      '#7fc4e8',
  tearD:     '#5b9fd0',
  petal:     '#e87fa8',
  leaf:      '#5a9e4a',
  shadow:    'rgba(20,20,30,0.25)'
};

// rgba helper for glows and fades
function rgba(hex, a) {
  var r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}
