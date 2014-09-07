function isArray(obj) { return Object.prototype.toString.call(obj) === '[object Array]' }

function isNumber(n) { return !isNaN(parseFloat(n)) && isFinite(n) }

function isInt(n) { return typeof n === 'number' && n % 1 == 0 }

function isValidString(str) { return typeof str === 'string' && str !== '' }

function contains(array) {
  if (arguments.length < 2) { throw new Error('Nothing to search for!') }
  var args = Array.prototype.slice.call(arguments).slice(1);
  return args.every(function (item) { return array.indexOf(item) !== -1 });
}

function extend(Child, Parent) {
	var F = function () { }
	F.prototype = Parent.prototype
	Child.prototype = new F();
	Child.prototype.constructor = Child
	Child.super = Parent.prototype
}
var RichHTMLElement = (function () {
  function RichHTMLElement(element) {
    this.target = element;
  }

  RichHTMLElement.prototype.getClasses = function () {
    return this.target.className.split(/\s+/);
  };

  RichHTMLElement.prototype.hasClass = function (name) {
	return this.getClasses().indexOf(name) !== -1;
  };

  RichHTMLElement.prototype.addClass = function (name) {
	if (!this.hasClass(name)) {
	  var classes = this.getClasses();

	  classes.push(name);

	  this.target.className = classes.join(' ');
	}
  };

  RichHTMLElement.prototype.removeClass = function (name) {
	if (this.hasClass(name)) {
	  var classes = this.getClasses(),
	      index   = classes.indexOf(name);

	  classes.splice(index, 1);

	  this.target.className = classes.join(' ');
	}
  };

  return RichHTMLElement;
})();

var SpriteSheet = (function () {
	var SRC_BASE = 'url(\'dist/i/sprites/',
	    SRC_TAIL = '.png\')';

	var CLASS_BASE    = 'stage__sprite',
	    CLASS_FLIPPED = CLASS_BASE + '_style_flipped';

	var ANIMATION_OPTIONS_ALLOWED    = ['x', 'y', 'offsetX', 'offsetY', 'width', 'height', 'length', 'delays'],
	    ANIMATION_OPTIONS_DIMENSIONS = ANIMATION_OPTIONS_ALLOWED.slice(0, 4);

	function validateOptions(options) {
		for (var key in options) {
			if (!contains(ANIMATION_OPTIONS_ALLOWED, key)) {
				throw new Error('Key "' + key + '" is not allowed!');
			} else if (!isInt(options[key])) {
				throw new Error('Key "' + key + '" should be an integer!');
			}
		}

		ANIMATION_OPTIONS_DIMENSIONS.forEach(function (key) {
			options[key] = options[key] || 0;
		});

		if (isNaN(options.width) || options.width <= 0) {
			throw new Error('Animation without a width!');
		}

		options.height = options.height || options.width;    
		options.length = options.length || 1;
		options.delays = options.delays || [];

		while (options.delays.length < options.length) {
			options.delays.push(0);
		}

		return options;
	}

	function SpriteSheet(name, animations) {
		this.name      = name;
		this.element   = new RichHTMLElement(document.createElement('div'));
		this.index     = 0;
		this.frame     = 0;
		this.delay     = 0;
		this.flipped   = false;
		this.animation = animations ? animations.default : null;

		this.element.target.style.backgroundImage = SRC_BASE + name + SRC_TAIL;
		this.element.addClass(CLASS_BASE);

		animations = animations || {};

		this.addAnimation = function (name, options) {
			options = validateOptions(options);

			animations[name] = options;
			this.animation = name;

			if (!animations.default) {
				animations.default = name;
			}

			this.redraw();

			return this;
		};

		this.getAnimation = function (name) {
			return animations[name || this.animation];
		};

		this.clone = function () {
			return new SpriteSheet(name, animations)
		};
	}

	SpriteSheet.prototype.getDimensions = function () {
		var animation = this.getAnimation(),
		    dimensions = {
				width: animation.width,
				height: animation.height
			};

		return dimensions;
	};

	SpriteSheet.prototype.next = function () {
		this.delay++;

		var current = this.getAnimation();

		if (this.delay < current.delays[this.frame]) {
			return this.delay + 1 >= current.delays[frame] && this.frame + 1 >= current.length;
		} else { this.delay = 0 }

		this.frame++;

		if (this.frame >= current.length) {
			this.frame = 0;
		}

		var posX = (current.x + (this.frame * current.width)) * 2,
		    posY = current.y;

		this.element.target.style.backgroundPosition = -posX.toString() + 'px ' + -posY.toString() + 'px';

		return false;
	};

	SpriteSheet.prototype.update = function () {
	    var style = this.element.target.style;	
		
		style.left = Math.floor(this.x * 2).toString() + 'px';
		style.top  = Math.floor(this.y * 2).toString() + 'px';
	};

	SpriteSheet.prototype.redraw = function () {
	    var style   = this.element.target.style,
		    current = this.getAnimation();

		var width  = current.width * 2,
	        height = current.height * 2;

        var px = (current.x + current.offsetX) * 2,
            py = (current.y + current.offsetY) * 2;

        style.width  = width.toString() + 'px' || 'auto';
        style.height = height.toString() + 'px' || 'auto';
		style.zIndex = this.index;
        style.backgroundPosition = -px.toString() + 'px ' + -py.toString() + 'px';
	};

	SpriteSheet.prototype.flip = function () {
		var classPresent = this.element.hasClass(CLASS_FLIPPED);

		if (this.flipped && classPresent) {
			this.element.removeClass(CLASS_FLIPPED);
		} else if (!this.flipped && !classPresent) {
			this.element.addClass(CLASS_FLIPPED);
		}

		this.flipped = !this.flipped;
	};

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

	function GameObject(sprite, vStep, vMax, scroll, bound) {
		this.sprite = sprite;
		this.scroll = scroll || 0;
		this.bound  = bound || BOUND_MAX;

		this.velocity = {
			step: vStep || VELOCITY_STEP_DEFAULT,
			max:  vMax || VELOCITY_MAX_DEFAULT,
			value: 0
		};

		if (sprite instanceof SpriteSheet === false) {
			throw new Error('Please provide a sprite!');
		}

		if (!isNumber(this.scroll)) {
			throw new Error('GameObject with invalid starting scroll!');
		} else if (this.scroll < 0) {
			throw new Error('GameObject scroll cannot be lower than 0!');
		}

		if (!isInt(this.bound)) {
			throw new Error('GameObject with invalid bound!');
		}

		if (!isNumber(this.velocity.step) || !isNumber(this.velocity.max)) {
			throw new Error('GameObject with invalid velocity data!');
		}

		this.getDelta = function () {
			return (STAGE_WIDTH / 2) - (this.sprite.getDimensions().width / 2)
		};
	}

	GameObject.prototype.push = function (k, value) {
		k = k || 1;
		value = value || this.velocity.step;

		if (!isNumber(k)) {
			throw new Error('Push with invalid factor of "' + k.toString() + '"!');
		} else if (!isNumber(value)) {
			throw new Error('Push with invalid value of "' + value.toString() + '"!');
		}

		value *= k;

		var v = this.velocity;

		v.value += value;

		v.value = Math.min(v.max, Math.abs(v.value)) * (Math.abs(v.value) / (v.value || 1));
		this.scroll -= v.value;

		var flipped = this.sprite.flipped;

		if ((k < 0 && flipped) || (k > 0 && !flipped)) {
			this.sprite.flip();
		}

		if (this.scroll < 0 || this.scroll > this.bound) {
			this.scroll = Math.min(this.bound, Math.max(0, this.scroll));
			v.value = 0;
		}

		this.correctAnimation();
	};

    GameObject.prototype.wait = function () {
		this.velocity.value *= FRICTION;

		if (Math.abs(this.velocity.value) < .1) {
			this.velocity.value = 0;
		}

		this.scroll -= this.velocity.value;

		this.correctAnimation();
    };

    GameObject.prototype.correctAnimation = function () {
		if (Math.abs(this.velocity.value) <  1 && this.sprite.animation === 'walk') {
			this.sprite.animation = 'idle';
		}

		if (Math.abs(this.velocity.value) >= 1 && this.sprite.animation === 'idle') {
			this.sprite.animation = 'walk';
		}

		this.sprite.redraw();
    };

	GameObject.prototype.leftCornerReached = function () {
	  return this.scroll < this.getDelta();
	};

	GameObject.prototype.rightCornerReached = function () {
		return this.scroll + this.getDelta() >= this.bound;
	};

	GameObject.prototype.correctPosition = function (relative) {
		if (relative !== null && !(relative instanceof GameObject))	{
			throw new Error('invalid relative object');
		}

		var dimensions = this.sprite.getDimensions();

		this.sprite.y = STAGE_HEIGHT - dimensions.height - FLOOR_OFFSET;

		var right = Math.floor(this.scroll - this.bound + STAGE_WIDTH - dimensions.width) - 1, // correct missing pixel
			left  = Math.floor(this.scroll);

		if (relative) { // object provided, position sprite relative to it
			if (!relative.leftCornerReached() && !relative.rightCornerReached()) {
				this.sprite.x = (STAGE_WIDTH / 2) - Math.ceil(dimensions.width / 2) - Math.floor(relative.scroll - this.scroll);
			} else {
				this.sprite.x = relative.rightCornerReached() ? right : left;
			}
		} else { // no object provided, position sprite relative to bounds
			if (!this.leftCornerReached() && !this.rightCornerReached()) {
				this.sprite.x = this.getDelta(); // center sprite
			} else {
				this.sprite.x = this.rightCornerReached() ? right : left;
			}
		}

		this.sprite.update();
	};

	return GameObject;
})()
var ActionObject = (function () {
	function ActionObject(sprite, vStep, vMax, scroll, bound, actions) {
		ActionObject.super.constructor.apply(this, arguments)
	}

	extend(ActionObject, GameObject);
	
	return ActionObject;
})();
var Room = (function () {
	var WIDTH_DEFAULT = 320;
	var TYPE_DEFAULT = 'base',
		SRC_BASE     = 'url(\'dist/i/tiles/',
		SRC_TAIL     = '.png\')',
		CLASS_BASE   = 'background__tile';

	function Room(name, type, width, depth) {
		if (!isValidString(name)) {
			throw new Error('Room without a name!');
		}

		this.name  = name;
		this.type  = type  || TYPE_DEFAULT;
		this.width = width || WIDTH_DEFAULT;
		this.depth = depth || 1;

		if (!isValidString(this.type)) {
			throw new Error('Room with invalid type of "' + this.type + '"!');
		}

		if (!isInt(this.width)) {
			throw new Error('Room with invalid width of "' + this.width + '"!');
		}

		if (!isInt(this.depth)) {
			throw new Error('Room with invalid depth of "' + this.depth + '"!');
		}

		this.width = Math.max(WIDTH_DEFAULT, this.width);
	}

	Room.prototype.getTiles = function () {
		var tiles = [];

		for (var i = 0; i < this.depth; ++i) {
			var t = document.createElement('div'),
				filename = this.depth === 1 ? this.type : this.type + '_' + i.toString();

			t.style.backgroundImage = SRC_BASE + this.type + SRC_TAIL;
			t.setAttribute('class', CLASS_BASE);
			tiles.push(t);
		}

		return tiles;
	};

	return Room;
})();
(function () {
	var STAGE_WIDTH   = 320,
		STAGE_HEIGHT  = 112,
		FRAME_STEP = 80;

	// define sprites
	var SPRITES = {};

	SPRITES.hero = new SpriteSheet('hero')
		.addAnimation('idle', { width: 37, height: 72 })
		.addAnimation('walk', { x: 37, width: 37, height: 72, length: 16 });

	var pressed = [],
		sprites = [];

	function getKeyAction(value) {
		if (value === 87 || value === 38) {
			return 'up';
		} else if (value === 68 || value === 39) {
			return 'right';
		} else if (value === 83 || value === 40) {
			return 'down';
		} else if (value === 65 || value === 37) {
			return 'left';
		}
  }

	function onKeyDown(e) {
		var pending = getKeyAction(e.keyCode);

		if (pressed.indexOf(pending) === -1) {
			pressed.push(pending);
		}
	}

	function onKeyUp(e) {
		var index = pressed.indexOf(getKeyAction(e.keyCode));

		if (index !== -1) {
			pressed.splice(index, 1);
		}
	}

	var screen     = document.createElement('div'),
		stage      = document.createElement('div'),
		background = document.createElement('div');

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

	function updateView() {
		var scroll = activeObject.scroll,
			delta  = Math.floor(activeObject.getDelta());

		var children = Array.prototype.slice.call(stage.childNodes, 0);

		loadedObjects.forEach(function (object, i) {
			object.correctPosition(object === activeObject ? null : activeObject);
			object.sprite.next();
			object.sprite.update();

			var x = object.sprite.x,
			    y = object.sprite.y;
			var dimensions = object.sprite.getDimensions();

			var hidden = x + dimensions.width < 0 || x >= STAGE_WIDTH || y + dimensions.height < 0 || y >= STAGE_HEIGHT;

			var target = object.sprite.element.target;

			if (hidden && contains(children, target)) {
				stage.removeChild(target);	// remove hidden elements
			} else if (!hidden && !contains(children, target)) {
				stage.appendChild(target); // add visible elements
			}
		});

		var x = 0;
		
		if (scroll + delta >= currentRoom.width) {
			x = currentRoom.width - (delta * 2);
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
				activeObject.push(-1);
				break;
			case 'left':
				activeObject.push();
				break;
			default:
				activeObject.wait();
				break;
		}

		updateView();
	}

	function loadLevel(room, objects) {
		if (room instanceof Room === false ) {
			throw new Error('Please provide a room!');
		}

		var o = objects;

		if (!isArray(o) || (isArray(o) && (o.length === 0 && !o.every(function (t) { return t instanceof GameObject })))) {
			throw new Error('Please provide a correct array of objects!');
		}

		currentRoom   = room;
		loadedObjects = objects;
		activeObject  = objects[0];

		activeObject.sprite.index = 1;

		loadedObjects.forEach(function (object) {
			object.bound = room.width;
			object.sprite.redraw();
		});

		currentRoom.getTiles().forEach(function (tile) {
			background.appendChild(tile)
		});

		stage.appendChild(activeObject.sprite.element.target);
	}

	loadLevel(new Room('blank', null, 840), [
		new GameObject(SPRITES.hero, null, null, 740),
		new GameObject(SPRITES.hero.clone(), null, null, 40),
		new GameObject(SPRITES.hero.clone(), null, null, 400),
		new ActionObject(SPRITES.hero.clone(), null, null, 780)
	]);

	setInterval(nextFrame, FRAME_STEP);
})();