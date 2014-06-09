(function () {
  var STEP = 80,
      VELOCITY_STEP = .4;
      VELOCITY_MAX = 3;

  var position = 0,
      velocity = 0;

  var pressed = [];

  function getKeyAction(value) {
    if (value === 87 || value === 38) { return 'up'; }
    else if (value === 68 || value === 39) { return 'right'; }
    else if (value === 83 || value === 40) { return 'down'; }
    else if (value === 65 || value === 37) { return 'left'; }
  }

  function onKeyDown(e) {
    var pending = getKeyAction(e.keyCode);
    if (pressed.indexOf(pending) === -1) { pressed.push(pending); }
  }

  function onKeyUp(e) {
    var index = pressed.indexOf(getKeyAction(e.keyCode));
    if (index !== -1) pressed.splice(index, 1);
  }

  var screen = div(),
      stage = div(),
      background = div();

  document.body.appendChild(screen);
  screen.setAttribute('id', 'screen');
  screen.setAttribute('tabindex', 0);
  screen.appendChild(stage);
  screen.appendChild(background);
  screen.addEventListener('keydown', onKeyDown);
  screen.addEventListener('keyup', onKeyUp);
  stage.setAttribute('class', 'stage');
  background.setAttribute('class', 'background');

  function addTiles(types) {
    types = types || ['base'];

    var array = [];

    if (isArray(types)) {
      types.forEach(function (value) {
        var t = div();

        if (typeof value !== 'string') { value = value.toString(); }

        t.style.backgroundImage = 'url(\'dist/i/tiles/' + value + '.png\')';

        t.setAttribute('class', 'background__tile');
        array.push(t);
        background.appendChild(t);
      });
    } else { throw new Error('Not an array'); }

    return array;
  }

  var hero = new Spritesheet('hero')
  .animation('walk', { x: 32, width: 68, height: 144, length: 16 })
  .animation('idle', { width: 32, height: 144 });

  stage.appendChild(hero.element);

  var tiles = addTiles();

  function updateView() {
    tiles.forEach(function (t, i) {
      var p = Math.floor(position) * 2;

      t.style.backgroundPosition = p.toString() + 'px 0px';
    });
  }

  function nextFrame() {
    var action = pressed[0];

    switch (action) {
      case 'right':
        velocity -= VELOCITY_STEP;
		if (hero.isFlipped()) { hero.flip(); }
        break;
      case 'left':
        velocity += VELOCITY_STEP;
		if (!hero.isFlipped()) { hero.flip(); }
        break;
      default:
        velocity *= .8;
        if (Math.abs(velocity) < .1) { velocity = 0; }
        break;
    }


    velocity = Math.min(VELOCITY_MAX, Math.abs(velocity)) * (Math.abs(velocity) / velocity);
    velocity = velocity || 0;
    position += velocity;

	if (Math.abs(velocity) < 1 && hero.animation() === 'walk') { hero.animation('idle'); }
	if (Math.abs(velocity) >= 1 && hero.animation() === 'idle') { hero.animation('walk'); }

	hero.next();

    updateView();
  }

  setInterval(nextFrame, STEP);
})();