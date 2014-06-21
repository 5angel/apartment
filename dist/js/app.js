Function.prototype.curry = function () {
  var args = Array.prototype.slice.apply(arguments),
      that = this;
  return function () { return that.apply(null, args.concat(Array.prototype.slice.apply(arguments))) };
};

function addClassTo(name, el) {
  var list = el.className.split(/\s+/);
  if (list.indexOf(name) === -1) { list.push(name) }
  el.className = list.join(' ');
  return el;
}

function removeClassFrom(name, el) {
  var list  = el.className.split(/\s+/),
      index = list.indexOf(name);
  if (index !== -1) { list.splice(index, 1) }
  el.className = list.join(' ');
  return el;
}

function isArray(obj) { return Object.prototype.toString.call(obj) === '[object Array]' }

function isNumber(n) { return !isNaN(parseFloat(n)) && isFinite(n) }

function isInt(n) { return typeof n === 'number' && n % 1 == 0 }

function isValidString(str) { return typeof str === 'string' && str !== '' }

function div() { return document.createElement('div') }

function contains(array) {
  if (arguments.length < 2) { throw new Error('Nothing to search for!') }
  var args = Array.prototype.slice.call(arguments).slice(1);
  return args.every(function (item) { return array.indexOf(item) !== -1 });
}
function Sprite(name) {
  if (!isValidString(name)) { throw new Error('Sprite without a name!');  }

  var CLASS_FLIPPED = 'stage__sprite_style_flipped',
      ANIMATION_OPTIONS_ALLOWED = ['x', 'y', 'width', 'height', 'length', 'delays', 'offsetX', 'offsetY'];;

  var animations = {};
  var flipped = false;
  var current, frame, delay;

  var x = 0,
      y = 0;

  var velocity = 0;
  var element = div();
  var _dimensions;

  element.style.backgroundImage = 'url(\'dist/i/sprites/' + name + '.png\')';
  element.setAttribute('class', 'stage__sprite');

  this.getName    = function () { return name }
  this.getElement = function () { return element }
  this.isFlipped  = function () { return flipped }

  this.position = function (nx, ny) {
    if (!arguments.length) { return { x: x, y: y } }

    nx = nx || x;
	ny = ny || y;

	if (!isNumber(nx) || !isNumber(ny)) { throw new Error('Invalid coordinates!') }

	if (nx !== x) {
	  x = nx;
	  nx *= 2;
	  element.style.left = Math.floor(nx).toString() + 'px';
	}

	if (ny !== y) {
	  y = ny;
	  ny *= 2;
	  element.style.top = Math.floor(ny).toString() + 'px';
	}
  };

  this.velocity = function (value) {
    if (!arguments.length) { return velocity }
    if (!isNumber(value)) { throw new Error('Velocity with invalid value of "' + value + '"!') }

	velocity = value;
  }

  var that = this;  

  this.flip = function () {
    flipped = !flipped;
    if (flipped) { addClassTo(CLASS_FLIPPED, element) }
    else { removeClassFrom(CLASS_FLIPPED, element) }
    return this;
  };

  this.dimensions = function (name) {
    name = name || current.name;

    if (!isValidString(name)) { throw new Error('Animation with invalid name!');  }
	if (_dimensions && _dimensions.name === name) { return _dimensions }

	_dimensions = {};

    var source = animations[name];

	for (var prop in source) {
	  if (source.hasOwnProperty(prop)) { _dimensions[prop] = source[prop] }
	}

	return _dimensions;
  };

  this.animation = function (name, options) {
    if (!arguments.length) { return current !== undefined ? current.name : null }

    if (!isValidString(name)) { throw new Error('Animation with invalid name!');  }
    else if (arguments.length === 1) { // setting current animation
      frame = delay = 0;
      current = animations[name];

      if (!current) { throw new Error('No animation with a name of "' + name + '"') }

	  var width  = current.width * 2,
	      height = current.height * 2;

      var px = (current.x + current.offsetX) * 2,
          py = (current.y + current.offsetY) * 2;

      element.style.width  = width.toString() + 'px' || 'auto';
      element.style.height = height.toString() + 'px' || 'auto';
      element.style.backgroundPosition = -px.toString() + 'px ' + -py.toString() + 'px';

      return this;
    }

    var o = options;

    for (var key in o) {
      if (!contains(ANIMATION_OPTIONS_ALLOWED, key)) { throw new Error('Key "' + key + '" is not allowed!') }
    }

    o.name = name;

    var dimensions = ['x', 'y', 'offsetX', 'offsetY'];
    dimensions.forEach(function (d) { o[d] = o[d] || 0 });

    if (!o.width) { throw new Error('Animation without a width!') }

    o.height = o.height || width;    
    o.length = o.length || 1;
    o.delays = o.delays || [];

    while (o.delays.length < o.length) { o.delays.push(0) }

    if (new Array(o.x, o.y, o.width, o.height, o.length, o.offsetX, o.offsetY).every(isInt) === false) {
      throw new Error('Animation dimensions should be integers!');
    }

    if (!isArray(o.delays) || (isArray(o.delays) && !o.delays.every(isInt))) {
      throw new Error('Animation delays should be an array of integers!');
    }

    if (o.delays.length > o.length) { o.delays = o.delays.slice(0, o.length - 1) }

    animations[name] = options;
    
    return this.animation(name);
  };

  this.next = function () {
    delay++;
    if (delay < current.delays[frame]) { return this }
    else { delay = 0 }

    frame++;
    if (frame >= current.length) { frame = 0 }	  
    var pos = (current.x + (frame * current.width)) * 2;

    element.style.backgroundPosition = -pos.toString() + 'px ' + -current.y.toString() + 'px';
  };

  return this;
}
function Room(name, type, width, depth) {
  var TYPE_DEFAULT  = 'base',
      WIDTH_DEFAULT = 320;

  if (!isValidString(name)) { throw new Error('Room without a name!') }

  type  = type || TYPE_DEFAULT;
  width = width || WIDTH_DEFAULT;
  depth = depth || 1;

  if (!isValidString(type)) { throw new Error('Room with invalid type of "' + type + '"!') }
  if (!isInt(width)) { throw new Error('Room with invalid width of "' + width + '"!') }
  if (!isInt(depth)) { throw new Error('Room with invalid depth of "' + depth + '"!') }

  width = Math.min(WIDTH_DEFAULT, width);

  var tiles = [];

  this.getName = function () { return name };
  this.getWidth = function () { return width };

  this.getTiles = function () {
    if (tiles.length > 0) { return tiles }

    for (var i = 0; i < depth; ++i) {
      var t = div(),
	      filename = depth === 1 ? type : type + '_' + i.toString();

      t.style.backgroundImage = 'url(\'dist/i/tiles/' + type + '.png\')';

      t.setAttribute('class', 'background__tile');
      tiles.push(t);
	}

    return tiles;
  };
}
(function () {
  var FRAME_STEP    = 80,
      FRICTION      = .6,
      VELOCITY_STEP = .4,
      VELOCITY_MAX  = 3,
	  STAGE_WIDTH   = 320,
	  STAGE_HEIGHT  = 112,
	  FLOOR_OFFSET  = 6;

  // define sprites
  var SPRITES = {};

  SPRITES.hero = new Sprite('hero')
  .animation('walk', { x: 37, width: 37, height: 72, length: 16 })
  .animation('idle', { width: 37, height: 72 });

  var focus = SPRITES.hero;

  var pressed = [],
      sprites = [];

  function getKeyAction(value) {
    if (value === 87 || value === 38) { return 'up' }
    else if (value === 68 || value === 39) { return 'right' }
    else if (value === 83 || value === 40) { return 'down' }
    else if (value === 65 || value === 37) { return 'left' }
  }

  function onKeyDown(e) {
    var pending = getKeyAction(e.keyCode);
    if (pressed.indexOf(pending) === -1) { pressed.push(pending) }
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
 
  var currentRoom;

  function placeSprites() {
    stage.appendChild(focus.getElement());
  };

  function placeBackground() { currentRoom.getTiles().forEach(function (t) { background.appendChild(t) }) }

  function updateView() {
    if (currentRoom.getWidth() > STAGE_WIDTH) {
      var tiles = currentRoom.getTiles();

      tiles.forEach(function (t, i) {
        var p = Math.floor(focus.position() / (tiles.length - i)) * 2;

        t.style.backgroundPosition = p.toString() + 'px 0px';
      });
	}
  }

  function nextFrame() {
    var action   = pressed[0];

	var velocity   = focus.velocity(),
	    position   = focus.position(),
		dimensions = focus.dimensions();

    switch (action) {
      case 'right':
        velocity -= VELOCITY_STEP;
		if (focus.isFlipped()) { focus.flip() }
        break;
      case 'left':
        velocity += VELOCITY_STEP;
		if (!focus.isFlipped()) { focus.flip() }
        break;
      default:
        velocity *= FRICTION;
        if (Math.abs(velocity) < .1) { velocity = 0 }
        break;
    }

    velocity = Math.min(VELOCITY_MAX, Math.abs(velocity)) * (Math.abs(velocity) / velocity);
    velocity = velocity || 0;

	if (Math.abs(velocity) < 1 && focus.animation() === 'walk') { focus.animation('idle') }
	if (Math.abs(velocity) >= 1 && focus.animation() === 'idle') { focus.animation('walk') }

	position.y = STAGE_HEIGHT - dimensions.height - FLOOR_OFFSET;

	if (currentRoom.getWidth() === STAGE_WIDTH) {
	  position.x -= velocity;
	} else {
	  position.x = (STAGE_WIDTH / 2) - (dimensions.width / 2);
	}

	focus.position(position.x, position.y);
	focus.velocity(velocity);
	focus.next();

    updateView();
  }

  function loadLevel(room) {
    currentRoom = room;

	placeSprites();
    placeBackground();
  }

  loadLevel(new Room('blank'));

  setInterval(nextFrame, FRAME_STEP);
})();