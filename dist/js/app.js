function addClassTo(name, el) {
  var list = el.className.split(/\s+/);
  if (list.indexOf(name) === -1) { list.push(name); }
  el.className = list.join(' ');
  return el;
}

function removeClassFrom(name, el) {
  var list  = el.className.split(/\s+/),
      index = list.indexOf(name);
  if (index !== -1) { list.splice(index, 1); }
  el.className = list.join(' ');
  return el;
}

function isArray(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; }
function isInt(n) { return typeof n === 'number' && n % 1 == 0; }
function div() { return document.createElement('div'); }

function contains(array) {
  if (arguments.length < 2) { throw new Error('Nothing to search for!'); }
  var args = Array.prototype.slice.call(arguments).slice(1);
  return args.every(function (item) { return array.indexOf(item) !== -1; });
}
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
function Spritesheet(_name) {
  var CLASS_FLIPPED = 'stage__sprite_style_flipped',
      ANIMATION_OPTIONS_ALLOWED = ['x', 'y', 'width', 'height', 'length', 'delays', 'offsetX', 'offsetY'];;

  var animations = {};
  var flipped = false;
  var current, frame, delay;

  this.x = 0;
  this.y = 0;

  this.element = div();
  this.element.style.backgroundImage = 'url(\'dist/i/sprites/' + _name + '.png\')';
  this.element.setAttribute('class', 'stage__sprite');

  this.isFlipped = function () { return flipped; }

  this.flip = function () {
    flipped = !flipped;
    if (flipped) { addClassTo(CLASS_FLIPPED, this.element); }
    else { removeClassFrom(CLASS_FLIPPED, this.element); }
    return this;
  };

  this.animation = function (name, options) {
    if (!arguments.length) { return current !== undefined ? current.name : null; }

    if (typeof name !== 'string' || !name) { throw new Error('Animation without name!');  }
    else if (arguments.length === 1) { // setting current animation
      frame = delay = 0;
      current = animations[name];

      if (!current) { throw new Error('No animation with name "' + name + '"') }

      this.x = this.x + current.offsetX;
      this.y = this.y + current.offsetY;

      this.element.style.width  = current.width.toString() + 'px' || 'auto';
      this.element.style.height = current.height.toString() + 'px' || 'auto';
      this.element.style.backgroundPosition = -current.x.toString() + 'px ' + -current.y.toString() + 'px';

      return this;
    }

    var o = options;

    for (var key in o) {
      if (!contains(ANIMATION_OPTIONS_ALLOWED, key)) { throw new Error('Key not allowed!'); }
    }

    o.name = name;

    var dimensions = ['x', 'y', 'offsetX', 'offsetY'];
    dimensions.forEach(function (d) { o[d] = o[d] || 0; });

    if (!o.width) { throw new Error('Animation without width!'); }

    o.height = o.height || width;    
    o.length = o.length || 1;
    o.delays = o.delays || [];

    while (o.delays.length < o.length) { o.delays.push(0); }

    if (new Array(o.x, o.y, o.width, o.height, o.length, o.offsetX, o.offsetY).every(isInt) === false) {
      throw new Error('Animation dimensions should be integers!');
    }

    if (!isArray(o.delays) || (isArray(o.delays) && !o.delays.every(isInt))) {
      throw new Error('Animation delays should be an array of integers!');
    }

    if (o.delays.length > o.length) { o.delays = o.delays.slice(0, o.length - 1); }

    animations[name] = options;
    
    return this.animation(name);
  };

  this.next = function () {
    delay++;
    if (delay < current.delays[frame]) { return this; }
    else { delay = 0; }

    frame++;
    if (frame >= current.length) { frame = 0; }	  
    var x = current.x + (frame * current.width);

    this.element.style.backgroundPosition = -x.toString() + 'px ' + -current.y.toString() + 'px';
  };

  return this;
}