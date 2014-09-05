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
var SpriteSheet = (function () {
  var CLASS_FLIPPED = 'stage__sprite_style_flipped',
      ANIMATION_OPTIONS_ALLOWED = ['x', 'y', 'width', 'height', 'length', 'delays', 'offsetX', 'offsetY'];

  function SpriteSheet(name, animations) {
    if (!isValidString(name)) {
	  throw new Error('SpriteSheet without a name!');
	}

	animations = animations || {};

	var that = this;

    var flipped = false;
    var current = animations.default;
	var frame, delay;

    var x = 0,
        y = 0
		index = 0;

    var element = div();
  
    var _dimensions;

    element.style.backgroundImage = 'url(\'dist/i/sprites/' + name + '.png\')';
    element.setAttribute('class', 'stage__sprite');

    this.getName = function () {
	  return name;
	};

    this.getElement = function () {
	  return element;
	};

    this.isFlipped  = function () {
	  return flipped;
	};

    this.position = function (nx, ny) {
      if (!arguments.length) {
	    return { x: x, y: y };
	  }

      nx = nx === 0 ? 0 : nx || x;
	  ny = ny === 0 ? 0 : ny || y;

	  if (!isNumber(nx) || !isNumber(ny)) {
	    throw new Error('Invalid coordinates!');
	  }

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

	this.index = function (value) {
	  if (!arguments.length) {
	    return index;
	  }

	  index = value;
	}

    this.flip = function () {
      flipped = !flipped;

      flipped
	    ? addClassTo(CLASS_FLIPPED, element)
	    : removeClassFrom(CLASS_FLIPPED, element);

      return this;
    };

    this.dimensions = function (_name) {
      _name = _name || current.name;

      if (!isValidString(_name)) {
	    throw new Error('Animation with invalid name!');
	  }

	  if (_dimensions && _dimensions.name === _name) {
	    return _dimensions;
	  }

	  _dimensions = {};

      var source = animations[_name];

	  for (var prop in source) {
	    if (source.hasOwnProperty(prop)) {
		  _dimensions[prop] = source[prop];
		}
	  }

	  return _dimensions;
    };

    this.animation = function (_name, options) {
      if (!arguments.length) {
	    return current !== undefined ? current.name : null;
	  }

      if (!isValidString(_name)) {
	    throw new Error('Animation with invalid name!');
	  } else if (arguments.length === 1) { // setting current animation
        frame = 0;
		delay = 0;
        current = animations[_name];

        if (!current) {
		  throw new Error('No animation with a name of "' + _name + '"');
		}

	    var width  = current.width * 2,
	        height = current.height * 2;

        var px = (current.x + current.offsetX) * 2,
            py = (current.y + current.offsetY) * 2;

        element.style.width  = width.toString() + 'px' || 'auto';
        element.style.height = height.toString() + 'px' || 'auto';
        element.style.backgroundPosition = -px.toString() + 'px ' + -py.toString() + 'px';
		element.style.zIndex = index;

        return this;
      }

      var o = options;

      for (var key in o) {
        if (!contains(ANIMATION_OPTIONS_ALLOWED, key)) {
		  throw new Error('Key "' + key + '" is not allowed!');
		}
      }

      o.name = _name;

      var dimensions = ['x', 'y', 'offsetX', 'offsetY'];

      dimensions.forEach(function (d) {
	    o[d] = o[d] || 0;
	  });

      if (!o.width) {
	    throw new Error('Animation without a width!');
	  }

      o.height = o.height || width;    
      o.length = o.length || 1;
      o.delays = o.delays || [];

      while (o.delays.length < o.length) {
	    o.delays.push(0);
	  }

      if (new Array(o.x, o.y, o.width, o.height, o.length, o.offsetX, o.offsetY).every(isInt) === false) {
        throw new Error('Animation dimensions should be integers!');
      }

      if (!isArray(o.delays) || (isArray(o.delays) && !o.delays.every(isInt))) {
        throw new Error('Animation delays should be an array of integers!');
      }

      if (o.delays.length > o.length) {
	    o.delays = o.delays.slice(0, o.length - 1);
	  }

      animations[_name] = options;

	  if (animations.default === undefined) {
	    animations.default = animations[_name];
	  }

      return this.animation(_name);
    };

    this.next = function () {
      delay++;

      if (delay < current.delays[frame]) {
	    return delay + 1 >= current.delays[frame] && frame + 1 >= current.length;
	  } else { delay = 0 }

      frame++;

      if (frame >= current.length) {
	    frame = 0;
	  }

      var pos = (current.x + (frame * current.width)) * 2;

      element.style.backgroundPosition = -pos.toString() + 'px ' + -current.y.toString() + 'px';

	  return false;
    };

	this.clone = function () {
	  return new SpriteSheet(name, animations);
	};

	if (current) {
	  this.animation('default');
	}
  }

  return SpriteSheet;
})();
var GameObject = (function () {
  var STAGE_WIDTH   = 320,
	  STAGE_HEIGHT  = 112,
	  FLOOR_OFFSET  = 6
  var FRICTION = .6;
  var VELOCITY_STEP_DEFAULT = .4,
      VELOCITY_MAX_DEFAULT  = 3;
  var BOUND_MAX = 9007199254740992;

  function GameObject(sprite, vstep, vmax, scroll, bound) {
    if (sprite instanceof SpriteSheet === false) {
	  throw new Error('Please provide a sprite!');
	}

    vstep  = vstep  || VELOCITY_STEP_DEFAULT;
    vmax   = vmax   || VELOCITY_MAX_DEFAULT;
    scroll = scroll || 0;
    bound  = bound  || BOUND_MAX;

    if (!isNumber(scroll)) {
	  throw new Error('GameObject with invalid starting scroll!');
	} else if (scroll < 0) {
	  throw new Error('GameObject scroll cannot be lower than 0!');
	}

    if (!isNumber(vstep) || !isNumber(vmax)) {
	  throw new Error('GameObject with invalid velocity data!');
	}

    if (!isInt(bound)) {
	  throw new Error('GameObject with invalid bound!');
	}
  
    var velocity = 0;

    function push(k, value) {
      k = k || 1;
      value = value || vstep;

      if (!isNumber(value)) {
	    throw new Error('Push with invalid value of "' + value.toString() + '"!');
	  }

	  value *= k;
	  velocity += value;
	  velocity = Math.min(vmax, Math.abs(velocity)) * (Math.abs(velocity) / (velocity || 1));
	  scroll -= velocity;

	  if ((k < 0 && sprite.isFlipped()) || (k > 0 && !sprite.isFlipped())) {
	    sprite.flip();
      }

	  correctPosition();
	  correctAnimation();
    }

    function correctPosition() {
      if (scroll < 0 || scroll > bound) {
	    scroll = Math.min(bound, Math.max(0, scroll));
	    velocity = 0;
	  }
    }

    function correctAnimation() {
	  if (Math.abs(velocity) <  1 && sprite.animation() === 'walk') {
	    sprite.animation('idle');
      }

	  if (Math.abs(velocity) >= 1 && sprite.animation() === 'idle') {
	    sprite.animation('walk');
      }
    }
  
    this.getSprite = function () {
	  return sprite;
	};

    this.getScroll = function () {
	  return scroll;
	};

    this.getVelocity = function () {
	  return velocity;
	};

    this.setBound = function (value) {
      if (!isInt(bound)) {
	    throw new Error('Bound should be integer!');
	  }

	  bound = value;
    };

    this.pushLeft  = push.bind(this, 1);
    this.pushRight = push.bind(this, -1);

    this.wait = function () {
      velocity *= FRICTION;

      if (Math.abs(velocity) < .1) {
	    velocity = 0;
	  }

	  scroll -= velocity;

	  correctAnimation();
    };

	this.getDelta = function () {
	  return (STAGE_WIDTH / 2) - (sprite.dimensions().width / 2)
	};

	this.leftCornerReached = function () {
	  return scroll < this.getDelta();
	};

	this.rightCornerReached = function () {
	  return scroll + this.getDelta() >= bound;
	};

	this.correctPosition = function (relative) {
      if (relative !== null && !(relative instanceof GameObject))	{
	    throw new Error('invalid relative object');
	  }

	  var position   = sprite.position(),
	      dimensions = sprite.dimensions();

	  var spriteWidth  = dimensions.width,
	      spriteHeight = dimensions.height;

	  position.y = STAGE_HEIGHT - spriteHeight - FLOOR_OFFSET;

	  var right = Math.floor(scroll - bound + STAGE_WIDTH - spriteWidth) - 1, // correct missing pixel
	      left  = Math.floor(scroll);

	  if (relative) { // object provided, position sprite relative to it
	    var _scroll = relative.getScroll();

		if (!relative.leftCornerReached() && !relative.rightCornerReached()) {
		  position.x = (STAGE_WIDTH / 2) - Math.ceil(sprite.dimensions().width / 2) - Math.floor(_scroll - scroll);
		} else {
		  position.x = relative.rightCornerReached() ? right : left;
		}
	  } else { // no object provided, position sprite relative to bounds
	    if (!this.leftCornerReached() && !this.rightCornerReached()) {
	      position.x = this.getDelta(); // center sprite
	    } else {
	      position.x = this.rightCornerReached() ? right : left;
	    }
	  }
	  
	  sprite.position(position.x, position.y);
	};
  }

  return GameObject;
})();
var Room = (function () {
  var TYPE_DEFAULT  = 'base',
      WIDTH_DEFAULT = 320;

  function Room(name, type, width, depth) {
    if (!isValidString(name)) {
	  throw new Error('Room without a name!');
	}

    type  = type  || TYPE_DEFAULT;
    width = width || WIDTH_DEFAULT;
    depth = depth || 1;

    if (!isValidString(type)) {
	  throw new Error('Room with invalid type of "' + type + '"!');
	}

    if (!isInt(width)) {
	  throw new Error('Room with invalid width of "' + width + '"!');
	}

    if (!isInt(depth)) {
	  throw new Error('Room with invalid depth of "' + depth + '"!');
	}

    width = Math.max(WIDTH_DEFAULT, width);

    var tiles = [];

    this.getName = function () {
	  return name;
	};

    this.getWidth = function () {
	  return width;
	};

    this.getTiles = function () {
      if (tiles.length > 0) {
	    return tiles;
      }

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

  return Room;
})();
(function () {
  var STAGE_WIDTH   = 320,
	  STAGE_HEIGHT  = 112,
      FRAME_STEP = 80;

  // define sprites
  var SPRITES = {};

  SPRITES.hero = new SpriteSheet('hero')
  .animation('idle', { width: 37, height: 72 })
  .animation('walk', { x: 37, width: 37, height: 72, length: 16 });

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
 
  var currentRoom, loadedObjects, activeObject;

  function updateView(scroll, width, delta) {
	var scroll = activeObject.getScroll(),
	    delta  = Math.floor(activeObject.getDelta()),
	    width  = currentRoom.getWidth();

	var children = Array.prototype.slice.call(stage.childNodes, 0);

	loadedObjects.forEach(function (object, i) {
	  var sprite  = object.getSprite(),
	      element = sprite.getElement();

      object.correctPosition(object === activeObject ? null : activeObject);
      sprite.next();

	  var pos = sprite.position(),
		  dim = sprite.dimensions();

	  var hidden = pos.x + dim.width < 0 || pos.x >= STAGE_WIDTH || pos.y + dim.height < 0 || pos.y >= STAGE_HEIGHT;

	  if (hidden && contains(children, element)) {
	    stage.removeChild(element);	// remove hidden elements
	  } else if (!hidden && !contains(children, element)) {
	    stage.appendChild(element); // add visible elements
	  }
	});

	var x = 0;
		
	if (scroll + delta >= width) {
	  x = width - (delta * 2);
	} else if (scroll >= delta) {
	  x = Math.floor(scroll) - delta;
	}

	var tiles = currentRoom.getTiles();

    tiles.forEach(function (t, i) {
      var p = -Math.floor(x / (tiles.length - i)) * 2;

      t.style.backgroundPosition = p.toString() + 'px 0px';;
	});
  }

  function nextFrame() {
    var action = pressed[0];

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

	updateView();
  }

  function loadLevel(room, objects) {
    if (room instanceof Room === false ) { throw new Error('Please provide a room!') }

	var o = objects;

    if (!isArray(o) || (isArray(o) && (o.length === 0 && !o.every(function (t) { return t instanceof GameObject })))) {
      throw new Error('Please provide a correct array of objects!');
    }

    currentRoom   = room;
	loadedObjects = objects;
	activeObject  = objects[0];

	activeObject.getSprite().index(1);

	loadedObjects.forEach(function (object) {
	  object.setBound(room.getWidth());
	});

	currentRoom.getTiles().forEach(function (tile) {
	  background.appendChild(tile)
	});

	stage.appendChild(activeObject.getSprite().getElement());
  }

  loadLevel(new Room('blank', null, 840), [
    new GameObject(SPRITES.hero, null, null, 740),
	new GameObject(SPRITES.hero.clone(), null, null, 40),
	new GameObject(SPRITES.hero.clone(), null, null, 400),
	new GameObject(SPRITES.hero.clone(), null, null, 780)
  ]);

  setInterval(nextFrame, FRAME_STEP);
})();