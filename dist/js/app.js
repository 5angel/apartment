Function.prototype.curry = function () {
  var slice = Array.prototype.slice,
      args  = slice.apply(arguments),
      that  = this;
  return function () { return that.apply(null, args.concat(slice.apply(arguments))) };
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
function SpriteSheet(name) {
  if (!isValidString(name)) { throw new Error('SpriteSheet without a name!');  }

  var CLASS_FLIPPED = 'stage__sprite_style_flipped',
      ANIMATION_OPTIONS_ALLOWED = ['x', 'y', 'width', 'height', 'length', 'delays', 'offsetX', 'offsetY'];;

  var animations = {};
  var flipped = false;
  var current, frame, delay;

  var x = 0,
      y = 0;

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
    if (delay < current.delays[frame]) { return delay + 1 >= current.delays[frame] && frame + 1 >= current.length }
    else { delay = 0 }

    frame++;

    if (frame >= current.length) { frame = 0 }

    var pos = (current.x + (frame * current.width)) * 2;

    element.style.backgroundPosition = -pos.toString() + 'px ' + -current.y.toString() + 'px';

	return false;
  };

  return false;
}
function GameObject(sprite, vstep, vmax, scroll) {
  if (sprite instanceof SpriteSheet === false) { throw new Error('Please provide a sprite!') }

  var FRICTION = .6;
  var VELOCITY_STEP_DEFAULT = .4,
      VELOCITY_MAX_DEFAULT  = 3;

  vstep  = vstep || VELOCITY_STEP_DEFAULT;
  vmax   = vmax  || VELOCITY_MAX_DEFAULT;
  scroll = scroll || 0;

  if (!isNumber(scroll)) { throw new Error('GameObject with invalid starting scroll!') }
  else if (scroll < 0) { throw new Error('GameObject scroll cannot be lower than 0!') }
  if (!isNumber(vstep) || !isNumber(vmax)) { throw new Error('GameObject with invalid velocity data!') }

  var velocity = 0;

  function push(k, value) {
    k = k || 1;
    value = value || vstep;

    if (!isNumber(value)) { throw new Error('Push with invalid value of "' + value.toString() + '"!') }

	value *= k;
	velocity += value;
	velocity = Math.min(vmax, Math.abs(velocity)) * (Math.abs(velocity) / (velocity || 1));
	scroll -= velocity;

	if ((k < 0 && sprite.isFlipped()) || (k > 0 && !sprite.isFlipped())) { sprite.flip() }

	correctAnimation();
  }

  function correctAnimation() {
	if (Math.abs(velocity) <  1 && sprite.animation() === 'walk') { sprite.animation('idle') }
	if (Math.abs(velocity) >= 1 && sprite.animation() === 'idle') { sprite.animation('walk') }
  }
  
  this.getSprite   = function () { return sprite };
  this.getScroll   = function () { return scroll };
  this.getVelocity = function () { return velocity };

  this.pushLeft  = push.curry();
  this.pushRight = push.curry(-1);

  this.wait = function () {
    velocity *= FRICTION;

    if (Math.abs(velocity) < .1) { velocity = 0 }

	scroll -= velocity;

	correctAnimation();
  };
}
function Room(name, type, width, depth) {
  var TYPE_DEFAULT  = 'base',
      WIDTH_DEFAULT = 320;

  if (!isValidString(name)) { throw new Error('Room without a name!') }

  type  = type  || TYPE_DEFAULT;
  width = width || WIDTH_DEFAULT;
  depth = depth || 1;

  if (!isValidString(type)) { throw new Error('Room with invalid type of "' + type + '"!') }
  if (!isInt(width)) { throw new Error('Room with invalid width of "' + width + '"!') }
  if (!isInt(depth)) { throw new Error('Room with invalid depth of "' + depth + '"!') }

  width = Math.max(WIDTH_DEFAULT, width);

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
      VELOCITY_STEP = .4,
      VELOCITY_MAX  = 3,
	  STAGE_WIDTH   = 320,
	  STAGE_HEIGHT  = 112,
	  FLOOR_OFFSET  = 6;

  // define sprites
  var SPRITES = {};

  SPRITES.hero = new SpriteSheet('hero')
  .animation('walk', { x: 37, width: 37, height: 72, length: 16 })
  .animation('idle', { width: 37, height: 72 });

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
 
  var currentRoom, activeObject;

  function placeSprites() {
    stage.appendChild(activeObject.getSprite().getElement());
  };

  function placeBackground() { currentRoom.getTiles().forEach(function (t) { background.appendChild(t) }) }

  function updateView(scroll, width, delta) {
    var tiles  = currentRoom.getTiles();

	var x = 0;
	
	if (scroll + delta >= width) { x = width - (delta * 2) }
	else if (scroll >= delta) { x = scroll - delta }

    tiles.forEach(function (t, i) {
      var p = -Math.floor(x / (tiles.length - i)) * 2;

      t.style.backgroundPosition = p.toString() + 'px 0px';;
	});
  }

  function nextFrame() {
    var action = pressed[0],
	    sprite = activeObject.getSprite(),
		scroll = activeObject.getScroll(),
		width  = currentRoom.getWidth();

	var position   = sprite.position(),
		dimensions = sprite.dimensions();

    switch (action) {
      case 'right':
        activeObject.pushRight();
        break;
      case 'left':
        activeObject.pushLeft();
        break;
      default:
        activeObject.wait();
        break;
    }

	position.y = STAGE_HEIGHT - dimensions.height - FLOOR_OFFSET;

	// TODO: move position logic to GameObject

	var delta = (STAGE_WIDTH / 2) - (dimensions.width / 2);
	var toLeft  = scroll < delta,
	    toRight = scroll + delta >= width;

	if (!toLeft && !toRight) {
	  position.x = delta;
	} else {
	  position.x = toRight ? scroll - width + STAGE_WIDTH - dimensions.width : scroll;
	}
	
	updateView(scroll, width, delta);

	sprite.position(position.x, position.y);
	sprite.next();
  }

  function loadLevel(room, objects) {
    if (room instanceof Room === false ) { throw new Error('Please provide a room!') }

	var o = objects;

    if (!isArray(o) || (isArray(o) && (o.length === 0 && !o.every(function (t) { return t instanceof GameObject })))) {
      throw new Error('Please provide a correct array of objects!');
    }

    currentRoom  = room;
	activeObject = objects[0];

	placeSprites();
    placeBackground();
  }

  loadLevel(new Room('blank', null, 420), [new GameObject(SPRITES.hero)]);

  setInterval(nextFrame, FRAME_STEP);
})();