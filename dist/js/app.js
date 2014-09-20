function isArray(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function isInt(n) {
	return typeof n === 'number' && n % 1 == 0;
}

function isValidString(str) {
	return typeof str === 'string' && str !== '';
}

function isFunction(func) {
	return func && new Object().toString.call(func) === '[object Function]';
}

function contains(array) {
  if (arguments.length < 2) {
	throw new Error('nothing to search for');
  }
 
  var items = Array.prototype.slice.call(arguments).slice(1);
 
  return items.every(function (item) {
	return array.indexOf(item) !== -1;
  });
}

function inherits(Child, Parent) {
	var F = function () {};
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;
}

function copy(source, target) {
	target = target || {};

	for (var prop in source) {
		target[prop] = typeof source[prop] === 'object'
			? copy(target[prop], source[prop])
			: target[prop] = source[prop];
	}

	return target;
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

var Animation = (function () {
	var SIZE_DEFAULT = 16;

	var OPTIONS_DEFAULT = {
		x: 0,
		y: 0,
		offsetX: 0,
		offsetY: 0,
		width: SIZE_DEFAULT,
		height: SIZE_DEFAULT,
		length: 1,
		delays: []
	};

	var OPTIONS_ALLOWED     = ['x', 'y', 'offsetX', 'offsetY', 'width', 'height', 'length', 'delays']
		OPTIONS_COORDINATES = OPTIONS_ALLOWED.slice(0, -4),
		OPTIONS_DIMENSIONS  = OPTIONS_ALLOWED.slice(4, -1);

	function validateOptions(options) {
		if (!OPTIONS_COORDINATES.every(function (key) {
			return isInt(options[key]);
		})) {
			throw new Error('key "' + key + '" should be an integer');
		}

		if (!OPTIONS_DIMENSIONS.every(function (key) {
		    var value = options[key];
			return isInt(value) && value !== 0;
		})) {
			throw new Error('key "' + key + '" should be an integer and higher than zero');
		}

		if (!isArray(options.delays) || !options.delays.every(isInt)) {
			throw new Error('delays should be an array of integers');
		}
	}
	
	function Animation(options) {
		options = copy(options, copy(OPTIONS_DEFAULT));

		validateOptions(options);

		var that = this;

		OPTIONS_ALLOWED.forEach(function (key) {
			that[key] = options[key];
		});

		while (this.length < this.delays.length) {
			this.delays.push(0);
		}

		this.frame = 0;
		this.delay = 0;
	}

	Animation.prototype.next = function () {
		if (this.delay < this.delays[this.frame]) {
			return this.delay + 1 >= this.delays[this.frame] && this.frame + 1 >= this.length;
		} else {
			this.delay = 0;
		}

		this.frame++;

		if (this.frame >= this.length) {
			this.frame = 0;
		}

		return false;
	};

	return Animation;
})();
var SpriteSheet = (function () {
	var SRC_BASE = 'url(\'dist/i/sprites/',
	    SRC_TAIL = '.png\')';

	var CLASS_BASE    = 'stage__sprite',
	    CLASS_FLIPPED = CLASS_BASE + '_style_flipped';

	function validateOffsets(x, y) {
		if  (!isInt(x) || !isInt(y)) {
			throw new Error('Offset values should be integers');
		}
	}

	function validateAnimation(name, animation) {
		if  (!isValidString(name)) {
			throw new Error('animation without name');
		}

		check(animation).shouldBe(Animation);
	}
	

	function SpriteSheet(name, offsetX, offsetY, presets) {
		this.name = name;

		if  (!isValidString(this.name)) {
			throw new Error('sprite sheet without a name');
		}

		this.offsetX = offsetX || 0;
		this.offsetY = offsetY || 0;

		this.x = 0;
		this.y = 0;

		this.element   = new RichHTMLElement(document.createElement('div'));
		this.index     = 0;
		this.flipped   = false;
		this.animation = presets ? presets.initial : null;

		this.element.target.style.backgroundImage = SRC_BASE + name + SRC_TAIL;
		this.element.addClass(CLASS_BASE);

		presets = presets || {};

		this.addAnimation = function (name, animation) {
			validateAnimation(name, animation);

			presets[name]   = animation;
			presets.initial = presets.initial || name;
			this.animation  = name;

			this.redraw();

			return this;
		};

		this.getAnimation = function (name) {
			return presets[name || this.animation];
		};

		this.clone = function () {
			return new SpriteSheet(this.name, this.offsetX, this.offsetY, presets);
		};
	}

	SpriteSheet.prototype.getFrameWidth = function () {
		return this.getAnimation().width;
	};

	SpriteSheet.prototype.getFrameHeight = function () {
		return this.getAnimation().height;
	};

	SpriteSheet.prototype.step = function () {
		return this.getAnimation().next();
	};

	SpriteSheet.prototype.update = function () {
		var current = this.getAnimation();

		var fx = (current.x + (current.frame * current.width)) * 2,
		    fy = current.y;

	    var style = this.element.target.style;	
		
		style.left = Math.floor((this.x * 2) + (this.offsetX * 2)).toString() + 'px';
		style.top  = Math.floor((this.y * 2) + (this.offsetY * 2)).toString() + 'px';
		style.backgroundPosition = -fx.toString() + 'px ' + -fy.toString() + 'px';
	};

	SpriteSheet.prototype.redraw = function () {
	    var style   = this.element.target.style,
		    current = this.getAnimation();

		current.frame = 0;

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
var Action = (function () {

	function Action(name, target, data) {
		check.should.object(target);

		this.name   = name;
		this.target = target;
		this.data   = data;
	}

	return Action;
})();
var GameObject = (function () {
	var STAGE_WIDTH  = 320,
		STAGE_HEIGHT = 112,
		FLOOR_OFFSET = 6;

	function validateScroll(value) {
		if (!isNumber(value)) {
			throw new Error('scroll value should be a number');
		} else if (value < 0) {
			throw new Error('scroll value cannot be lower than 0');
		}
	}

	function validateHitWidth(value) {
		if (!isInt(value)) {
			throw new Error('hit width should be an integer');
		} else if (value < 0) {
			throw new Error('hit width cannot be lower than 0');
		}
	}

	function validateActionListener(name, callback) {
		if (!isValidString(name)) {
			throw new Error('action receiver should have a valid name');
		}

		if (!isFunction(callback)) {
			throw new Error('action callback should be a function');
		}
	}

	function GameObject(sprite, scroll, hitWidth) {
		this.sprite   = sprite;
		this.scroll   = scroll || 0;

		check(this.sprite).shouldBe(SpriteSheet);

		validateScroll(this.scroll);

		hitWidth = hitWidth || 0;

		validateHitWidth(hitWidth);

		var listeneres = {};

		this.getHitWidth = function () {
			return !hitWidth
				? Math.floor(this.sprite.getFrameWidth() / 2)
				: hitWidth;
		};

		this.addActionListener = function (name, callback) {
			validateActionListener(name, callback);

			if (listeneres[name] !== undefined) {
				console.warn('a receiver with name "' + name + '" already exists, overwriting');
			}

			listeneres[name] = callback;
		};

		this.receiveAction = function (action) {
			check(action).shoudlBe(Action);

			var callback = listeneres[action.name];

			callback
				? callback(action)
				: console.error('Couldn\'t find an action listener for "' + action.name + '"');
		};

		this.getDeltaWidth = function (k) {
			k = k || 1;

			return (STAGE_WIDTH / k) - Math.ceil(this.sprite.getFrameWidth() / k);
		};

		this.getDeltaHeight = function (k) {
			k = k || 1;

			return (STAGE_HEIGHT / k) - Math.ceil(this.sprite.getFrameHeight() / k) - FLOOR_OFFSET;
		};
	}

	GameObject.prototype.leftCornerReached = function () {
	  return this.scroll < this.getDeltaWidth(2);
	};

	GameObject.prototype.rightCornerReached = function (length) {
		return this.scroll + this.getDeltaWidth(2) >= length;
	};

	GameObject.prototype.correctSprite = function (length, relative) {
		if (relative !== null && !(relative instanceof GameObject))	{
			throw new Error('invalid relative object');
		}

		this.sprite.y = this.getDeltaHeight();

		var rightmost = Math.floor(this.scroll + this.getDeltaWidth() - length) - 1, // correct missing pixel
			leftmost  = Math.floor(this.scroll);

		if (relative) { // object provided, position sprite relative to it
			if (!relative.leftCornerReached() && !relative.rightCornerReached(length)) {
				this.sprite.x = this.getDeltaWidth(2) - Math.floor(relative.scroll - this.scroll);
			} else {
				this.sprite.x = relative.rightCornerReached(length) ? rightmost : leftmost;
			}
		} else { // no object provided, position sprite relative to bounds
			if (!this.leftCornerReached() && !this.rightCornerReached(length)) {
				this.sprite.x = this.getDeltaWidth(2); // center sprite
			} else {
				this.sprite.x = this.rightCornerReached(length) ? rightmost : leftmost;
			}
		}

		this.sprite.update();
	};

	GameObject.prototype.createAction = function (name) {
		if (!isValidString(name)) {
			throw new Error('action should have a name');
		}

		return new Action(name, this);
	};

	return GameObject;
})();
var DynamicObject = (function () {
	'use strict';

	var FRICTION = .6;
	var VELOCITY_STEP_DEFAULT = .4,
		VELOCITY_MAX_DEFAULT  = 3;

	function checkVelocity(v) {
		if (!isNumber(v.step)) {
			throw new Error('velocity with invalid step"');
		} else if (!isNumber(v.step)) {
			throw new Error('velocity with invalid maximum"');
		}
	}

	function DynamicObject(sprite, scroll, hitWidth, vStep, vMax) {
		DynamicObject.superclass.constructor.apply(this, arguments);

		this.velocity = {
			step: vStep || VELOCITY_STEP_DEFAULT,
			max:  vMax || VELOCITY_MAX_DEFAULT,
			value: 0
		};

		checkVelocity(this.velocity)
	}

	inherits(DynamicObject, GameObject);

	DynamicObject.prototype.pull = function (k, value) {
		k = k || 1;
		value = value || this.velocity.step;

		if (!isNumber(k)) {
			throw new Error('pull with invalid factor"');
		} else if (!isNumber(value)) {
			throw new Error('pull with invalid value"');
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

    DynamicObject.prototype.wait = function () {
		this.velocity.value *= FRICTION;

		if (Math.abs(this.velocity.value) < .1) {
			this.velocity.value = 0;
		}

		this.scroll -= this.velocity.value;

		this.correctAnimation();
    };

    DynamicObject.prototype.correctAnimation = function () {
		var previous = this.sprite.animation;

		if (Math.abs(this.velocity.value) <  1 && this.sprite.animation === 'walk') {
			this.sprite.animation = 'idle';
		}

		if (Math.abs(this.velocity.value) >= 1 && this.sprite.animation === 'idle') {
			this.sprite.animation = 'walk';
		}

		if (previous != this.sprite.animation) {
			this.sprite.redraw();
		}
    };

	return DynamicObject;
})();
var Room = (function () {
	var WIDTH_DEFAULT = 320;
	var TYPE_DEFAULT = 'base',
		SRC_BASE     = 'url(\'dist/i/tiles/',
		SRC_TAIL     = '.png\')',
		CLASS_BASE   = 'background__tile';

	function createTiles(count, type) {
		var tiles = [];

		for (var i = 0; i < count; ++i) {
			var t = document.createElement('div'),
				filename = count === 1 ? type : type + '_' + i.toString();

			t.style.backgroundImage = SRC_BASE + type+ SRC_TAIL;
			t.setAttribute('class', CLASS_BASE);
			tiles.push(t);
		}

		return tiles;
	}

	function validateRoom(name, type, width, depth) {
		if (!isValidString(name)) {
			throw new Error('Room without a name!');
		}

		if (!isValidString(type)) {
			throw new Error('Room with invalid type');
		}

		if (!isInt(width)) {
			throw new Error('Room with invalid width');
		}

		if (!isInt(depth)) {
			throw new Error('Room with invalid depth');
		}
	}

	function Room(name, type, width, depth, objects) {
		this.name  = name;
		this.type  = type  || TYPE_DEFAULT;
		this.width = width || WIDTH_DEFAULT;
		this.depth = depth || 1;

		validateRoom(this.name, this.type, this.width, this.depth);

		this.width   = Math.max(WIDTH_DEFAULT, this.width);
		this.tiles   = createTiles(this.depth, this.type);
		this.objects = objects || [];

		check(this.objects).shouldBeListOf(GameObject);
	}

	Room.prototype.updateTiles = function (offset) {
		if (!isInt(offset)) {
			return new Error('offset should be an integer');
		}
	
		this.tiles.forEach(function (tile, index, array) {
			var value = -Math.floor(offset / (array.length - index)) * 2;

			tile.style.backgroundPosition = value.toString() + 'px 0px';
		});
	};

	return Room;
})();
var Checker = (function () {
	var PAIRS = {
		'Animation': Animation,
		'SpriteSheet': SpriteSheet,
		'Action': Action,
		'GameObject': GameObject,
		'Room': Room
	};

	function Checker(object) {
		this.object = object;
	}

	Checker.findNameOf = function (type) {
		for (var prop in PAIRS) {
			if (PAIRS[prop] === type) {
				return prop;
			}
		}

		return 'Unknown';
	}

	Checker.prototype.is = function (type) {
		return this.object instanceof type;
	};

	Checker.prototype.shouldBe = function (type) {
		var target = Checker.findNameOf(type),
			source = Checker.findNameOf(this.object);

		if (!this.is(type)) {
			console.info(this.object);
			throw new Error('expected "' + target + '", got "' + source + '"');
		}
	};

	Checker.prototype.shouldBeListOf = function (type) {
		var target = Checker.findNameOf(type);

		var list = this.object,
			that = this;

		function is(object) {
			return object instanceof type;
		}

		if (!isArray(list) || (isArray(list) && (list.length > 0 && !list.every(is)))) {
			console.info(this.object);
			throw new Error('expected list of "' + target + '"');
		}
	};

	return Checker;
})();

function check(object) {
	return new Checker(object);
}
var keys = (function () {
	var pressed = [];

	function getKeyType(value) {
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

	function onKeyDown(event) {
		var pending = getKeyType(event.keyCode);

		if (pressed.indexOf(pending) === -1) {
			pressed.push(pending);
		}
	}

	function onKeyUp(event) {
		var index = pressed.indexOf(getKeyType(event.keyCode));

		if (index !== -1) {
			pressed.splice(index, 1);
		}
	}

	return {
		bindTo: function (element) {
			element.addEventListener('keydown', onKeyDown);
			element.addEventListener('keyup', onKeyUp);
		},
		getLast: function () {
			return pressed[pressed.length - 1];
		},
		hasKey: function (value) {
			return contains(pressed, value);
		}
	}
})();
var gameScreen = (function () {
	var STAGE_WIDTH  = 320,
		STAGE_HEIGHT = 112;

	var roomList = [],
		roomIndex = 0;

	var loadedObjects = [],
		objectActive  = null;

	var container  = document.createElement('div'),
		stage      = document.createElement('div')
		background = document.createElement('div');

	stage.setAttribute('class', 'stage');
	background.setAttribute('class', 'background');

	container.setAttribute('id', 'screen');
	container.setAttribute('tabindex', 0);
	container.appendChild(stage);
	container.appendChild(background);

	keys.bindTo(container);

	var hold = false;

	function performActionWith(host, type) {
		var target = loadedObjects.filter(function (object) {
			var left  = host.scroll >= object.scroll - object.getHitWidth(),
			    right = host.scroll + host.getHitWidth() <= object.scroll + object.getHitWidth()

			return left && right && object !== host;
		})[0];

		if (target) {
			target.receiveAction(host.createAction(type));
		}
	}

	function updateActiveObject() {
		switch (keys.getLast()) {
			case 'right':
				objectActive.pull(-1);
				break;
			case 'left':
				objectActive.pull();
				break;
			case 'down':
				if (!hold) {
					performActionWith(objectActive, 'interact');
				}

				objectActive.wait();
				break;
			default:
				objectActive.wait();
				break;
		}

		hold = keys.hasKey('down');
	}

	return {
		load: function (rooms, target) {
			roomList     = rooms;
			objectActive = target;

			check(roomList).shouldBeListOf(Room);
			check(objectActive).shouldBe(GameObject);

			objectActive.sprite.index = 1;

			roomIndex = 0;

			var roomActive = roomList[roomIndex];

			Array.prototype.push.apply(loadedObjects, roomActive.objects.slice())
			loadedObjects.push(objectActive);

			loadedObjects.forEach(function (object) {
				object.bound = roomActive.width;
				object.sprite.redraw();
			});

			roomActive.tiles.forEach(function (tile) {
				background.appendChild(tile);
			});

			stage.appendChild(objectActive.sprite.element.target);
		},
		next: function () {
			updateActiveObject();

			var roomActive = roomList[roomIndex];

			var children = Array.prototype.slice.call(stage.childNodes, 0);

			loadedObjects.forEach(function (object, i) {
				object.correctSprite(roomActive.width, object === objectActive ? null : objectActive);
				object.sprite.step();
				object.sprite.update();

				var x = object.sprite.x,
					y = object.sprite.y;

				var width  = object.sprite.getFrameWidth(),
					height = object.sprite.getFrameHeight();

				var hidden = x + width < 0 || x >= STAGE_WIDTH || y + height < 0 || y >= STAGE_HEIGHT;

				var target = object.sprite.element.target;

				if (hidden && contains(children, target)) {
					stage.removeChild(target); // remove hidden elements
				} else if (!hidden && !contains(children, target)) {
					stage.appendChild(target); // add visible elements
				}
			});

			var delta = Math.floor(objectActive.getDeltaWidth(2));

			var x = 0;

			if (objectActive.scroll + delta >= roomActive.width) {
				x = roomActive.width - (delta * 2);
			} else if (objectActive.scroll >= delta) {
				x = Math.floor(objectActive.scroll) - delta;
			}

			roomActive.updateTiles(x);
		},
		getContainer: function () {
			return container;
		}
	};
})();
(function () {
	var FRAME_STEP = 80;

	var OBJECT_TYPE_ACCEPTED = [GameObject, DynamicObject],
	    OBJECT_TYPE_DEFAULT  = OBJECT_TYPE_ACCEPTED[0];

	var ROOM_NAME_DEFAULT = 'blank';

	// define sprites
	var SPRITES = {};

	SPRITES.hero = new SpriteSheet('hero')
		.addAnimation('idle', new Animation({ width: 37, height: 72 }))
		.addAnimation('walk', new Animation({ x: 37, width: 37, height: 72, length: 16 }));

	SPRITES.door = new SpriteSheet('door', 0, -10)
		.addAnimation('idle', new Animation({ width: 40, height: 80 }));

	var SCHEME = [
		{
			width: 840,
			objects: [
				{
					sprite: 'door',
					scroll: '40'
				},
				{
					sprite: 'door',
					scroll: '400'
				},
				{
					sprite: 'door',
					scroll: '780'
				}
			]
		}
	];

	document.body.appendChild(gameScreen.getContainer());

	function validateType(type) {
		if (!contains(OBJECT_TYPE_ACCEPTED, type)) {
			throw new Error('type "' + Checker.findNameOf(type) + '" is not accepted');
		}
	}

	function parseLevelScheme(scheme) {
		var namesUsed = [];

		return scheme.map(function (room, i) {
			var objects = room.objects.map(function (object) {
				var type   = object.type || OBJECT_TYPE_DEFAULT,
					sprite = SPRITES[object.sprite] || SPRITES.hero;

				validateType(type);

				return new GameObject(sprite.clone(), object.scroll, object.width);
			});

			return new Room(room.name || ROOM_NAME_DEFAULT, room.type, room.width, room.depth, objects)
		});
	}

	var player = new DynamicObject(SPRITES.hero.clone(), 0, 8),
		rooms  = parseLevelScheme(SCHEME);

	gameScreen.load(rooms, player);

	setInterval(gameScreen.next, FRAME_STEP);
})();