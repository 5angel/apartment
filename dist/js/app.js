function isDefined(object) {
	return object !== undefined;
}

function isBoolean(value) {
	return value === false || value === true;
}

function isArray(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
}

function isNumber(n) {
	return typeof n === 'number' && !isNaN(parseFloat(n)) && isFinite(n);
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

function parseBoolean(str) {
	if (str === 'true') {
		return true;
	} else if (str === 'false') {
		return false;
	}

	return null;
}

function toCapital(str) {
	if (!isValidString(str)) {
		return str;
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str) {
	if (!isValidString(str) || str.indexOf('-') === -1) {
		return str;
	}

	var parts = str.split('-');

	return parts[0] + parts.slice(1).map(toCapital).join('');
}

function toArray(object) {
	return Array.prototype.slice.call(object);
}

function contains(array) {
  if (!isArray(array) || arguments.length < 2) {
	return false;
  }
 
  var items = toArray(arguments).slice(1);
 
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
	var _check = check.bind(null, 'RichHTMLElement');

	function isRich(element) {
		return _check(element).is(RichHTMLElement);
	}

	function toRich(element) {
		return new RichHTMLElement(element);
	}

	function toHTML(element) {
		return isRich(element) ? element.source : element;
	}

	function RichHTMLElement(element) {
		if (isValidString(element)) {
			element = document.createElement(element);
		}

		_check(element, 'element').toBe(HTMLElement);

		this.source = element;
	}

	RichHTMLElement.prototype.attr = function (name, value) {
		this.source.setAttribute(name, value);

		return this;
	};

	RichHTMLElement.prototype.append = function (element) {
		this.source.appendChild(toHTML(element));

		return this;
	};

	RichHTMLElement.prototype.prepend = function (element) {
		var first  = this.source.firstChild;

		first ? this.source.insertBefore(toHTML(element), first) : this.append(element);

		return this;
	};

	RichHTMLElement.prototype.remove = function (element) {
		this.source.removeChild(isRich(element) ? element.source : element);

		return this;
	};

	RichHTMLElement.prototype.children = function () {
		return Array.prototype.slice.call(this.source.childNodes, 0).map(toRich);
	};
 
	RichHTMLElement.prototype.getClasses = function () {
		return this.source.className.split(/\s+/);
	};

	RichHTMLElement.prototype.hasClass = function (name) {
		return this.getClasses().indexOf(name) !== -1;
	};

	RichHTMLElement.prototype.addClass = function (name) {
		if (!this.hasClass(name)) {
			var classes = this.getClasses();

			classes.push(name);

			this.source.className = classes.join(' ');
		}

		return this;
	};

	RichHTMLElement.prototype.removeClass = function (name) {
		if (this.hasClass(name)) {
			var classes = this.getClasses(),
				index   = classes.indexOf(name);

			classes.splice(index, 1);

			this.source.className = classes.join(' ');
		}

		return this;
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

	var _check = check.bind(null, 'SpriteSheet');

	function SpriteSheet(name, offsetX, offsetY, presets) {
		this.name = name;

		_check(this.name, 'sprite sheet name').toBeNonBlankString();

		this.offsetX = offsetX || 0;
		this.offsetY = offsetY || 0;

		this.x = 0;
		this.y = 0;

		this.element   = new RichHTMLElement(document.createElement('div'));
		this.index     = 0;
		this.flipped   = false;
		this.animation = presets ? presets.initial : null;

		this.element.source.style.backgroundImage = SRC_BASE + name + SRC_TAIL;
		this.element.addClass(CLASS_BASE);

		presets = presets || {};

		this.addAnimation = function (name, animation) {
			_check(name, 'animation name').toBeNonBlankString();
			_check(animation).toBe(Animation);

			presets[name]   = animation;
			presets.initial = presets.initial || name;

			this.animation = name;

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

	    var style = this.element.source.style;	
		
		style.left = Math.floor((this.x * 2) + (this.offsetX * 2)).toString() + 'px';
		style.top  = Math.floor((this.y * 2) + (this.offsetY * 2)).toString() + 'px';
		style.backgroundPosition = -fx.toString() + 'px ' + -fy.toString() + 'px';
	};

	SpriteSheet.prototype.redraw = function () {
	    var style   = this.element.source.style,
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
	var _check = check.bind(null, 'Action')

	function Action(name, source, target, data) {
		this.name   = name;
		this.source = source;
		this.target = target;
		this.data   = data || null;

		_check(this.name).toBeNonBlankString();
		_check(this.source).toBe(GameObject);
		_check(this.target).toBe(GameObject);
	}

	return Action;
})();
var GameObject = (function () {
	var STAGE_WIDTH  = 320,
		STAGE_HEIGHT = 112,
		FLOOR_OFFSET = 6;

	var _check = check.bind(null, 'GameObject');

	function addActionListener(listeneres, name, callback) {
		_check(name, 'action listener name').toBeNonBlankString();
		_check(callback, 'action callback').toBeFunction();

		var source = listeneres[name];

		source !== undefined
			? source.push(callback)
			: source = [callback];

		listeneres[name] = source;
	}

	function receiveAction(listeneres, action) {
		var source = listeneres[action.name];

		function wrapCallback(index) {
			var callback = source[index];

			return function () {
				if (index < source.length) {
					callback(action, wrapCallback(index + 1))
				}
			};
		}

		if (!this.disabled) {
			_check(action).toBe(Action);

			var callback = source[0];

			if (source !== undefined) {
				if (source.length > 1) {
					callback(action, wrapCallback(1));
				} else {
					callback(action);
				}
			} else {
				console.warn('Couldn\'t find an action listener for "' + action.name + '"');
			}
		}
	}

	function GameObject(name, sprite, scroll, hitWidth, disabled) {
		this.name     = name;
		this.sprite   = sprite;
		this.scroll   = scroll || 0;
		this.hitWidth = hitWidth || 0;
		this.disabled = disabled || false;

		_check(this.name, 'name').toBeNonBlankString();
		_check(this.sprite).toBe(SpriteSheet);
		_check(this.scroll, 'scroll').toBePositiveInt();
		_check(this.hitWidth, 'hit width').toBePositiveInt();
		_check(this.disabled, 'disabled').toBeBoolean();

		var listeneres = {};

		this.addActionListener = addActionListener.bind(this, listeneres);
		this.receiveAction     = receiveAction.bind(this, listeneres);
	}

	GameObject.prototype.getHitWidth = function () {
		return !this.hitWidth
			? Math.floor(this.sprite.getFrameWidth() / 2)
			: this.hitWidth;
	};

	GameObject.prototype.getDeltaWidth = function () {
		return (STAGE_WIDTH / 2) - Math.ceil(this.sprite.getFrameWidth() / 2);
	};

	GameObject.prototype.getDeltaHeight = function () {
		return (STAGE_HEIGHT / 2) - Math.ceil(this.sprite.getFrameHeight() / 2);
	};

	GameObject.prototype.leftCornerReached = function () {
	  return this.scroll < STAGE_WIDTH / 2;
	};

	GameObject.prototype.rightCornerReached = function (length) {
		return this.scroll > length - STAGE_WIDTH / 2;
	};

	GameObject.prototype.correctPosition = function (length, relative) {
		if (relative) {
			_check(relative).toBe(GameObject);
		}

		var bounded = false;

		var offset = this.getHitWidth();

		if ((this.scroll < offset + 1) || (this.scroll > this.bound - offset)) {
			bounded = true;

			this.scroll = Math.min(this.bound - offset, Math.max(offset + 1, this.scroll));
		}

		this.sprite.y = STAGE_HEIGHT - this.sprite.getFrameHeight() - FLOOR_OFFSET;

		var rightmost = Math.floor(this.scroll) - length + STAGE_WIDTH - Math.ceil(this.sprite.getFrameWidth() / 2),
			leftmost  = Math.floor(this.scroll) - Math.ceil(this.sprite.getFrameWidth() / 2);

		if (relative) {
			if (!relative.leftCornerReached() && !relative.rightCornerReached(length)) {
				this.sprite.x = this.getDeltaWidth() - Math.floor(relative.scroll - this.scroll);
			} else {
				this.sprite.x = relative.rightCornerReached(length) ? rightmost : leftmost; // correct missing pixel
			}
		} else {
			if (!this.leftCornerReached() && !this.rightCornerReached(length)) {
				this.sprite.x = this.getDeltaWidth(); // center sprite
			} else {
				this.sprite.x = this.rightCornerReached(length) ? rightmost : leftmost;
			}
		}

		this.sprite.update();

		return bounded;
	};

	GameObject.prototype.createAction = function (name, target) {
		_check(name, 'name').toBeNonBlankString();

		return new Action(name, this, target);
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

	function DynamicObject(name, sprite, scroll, hitWidth, vStep, vMax) {
		DynamicObject.superclass.constructor.apply(this, [name, sprite, scroll, hitWidth, false]);

		this.velocity = {
			step: vStep || VELOCITY_STEP_DEFAULT,
			max:  vMax  || VELOCITY_MAX_DEFAULT,
			value: 0
		};

		checkVelocity(this.velocity)
	}

	inherits(DynamicObject, GameObject);

	DynamicObject.prototype.correctPosition = function () {
		var bounded = DynamicObject.superclass.correctPosition.apply(this, arguments);

		if (bounded) {
			this.velocity.value = 0;
		}
	};

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

	var _check = check.bind(null, 'Room');
	
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

	function Room(name, type, width, depth, objects) {
		this.name  = name;
		this.type  = type  || TYPE_DEFAULT;
		this.width = width || WIDTH_DEFAULT;
		this.depth = depth || 1;

		_check(this.name).toBeNonBlankString();
		_check(this.type).toBeNonBlankString();
		_check(this.width).toBePositiveInt();
		_check(this.depth).toBePositiveInt();

		this.width   = Math.max(WIDTH_DEFAULT, this.width);
		this.tiles   = createTiles(this.depth, this.type);
		this.objects = objects || [];

		_check(this.objects).toBeListOf(GameObject);
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

	var ERROR_STRING_NON_BLANK = 'value should be a non blank string',
		ERROR_INTEGER          = 'value should be an integer',
		ERROR_NUMBER_POSITIVE  = 'value cannot be lower than zero"',
		ERROR_BOOLEAN          = 'value should be a boolean',
		ERROR_FUNCTION         = 'should be a function',
		ERROR_ARRAY            = 'should be an array';
		

	function Checker(source, target, name) {
		this.source = source;
		this.target = target;
		this.name   = name || 'null';

		if (!isValidString(this.source)) {
			throw new Error('Checker: "source" ' + ERROR_STRING_NON_BLANK);
		}

		if (!isValidString(this.name)) {
			throw new Error('Checker: "name" ' + ERROR_STRING_NON_BLANK);
		}
	}

	Checker.findNameOf = function (type) {
		for (var prop in PAIRS) {
			if (PAIRS[prop] === type) {
				return prop;
			} else if (type instanceof PAIRS[prop]) {
				return prop;
			}
		}

		return 'Unknown';
	}

	Checker.prototype.is = function (type) {
		return this.target instanceof type;
	};

	Checker.prototype.toBe = function (type) {
		var target = Checker.findNameOf(type),
			source = Checker.findNameOf(this.target);

		if (!this.is(type)) {
			console.info(this.target);
			throw new Error(this.source + ': expected "' + target + '", got "' + source + '"');
		}
	};

	Checker.prototype.toBeListOf = function (type) {
		var target = Checker.findNameOf(type);

		var list = this.target,
			that = this;

		function is(object) {
			return object instanceof type;
		}

		if (!isArray(list) || (isArray(list) && (list.length > 0 && !list.every(is)))) {
			console.info(this.target);
			throw new Error(this.source + ': expected list of "' + target + '"');
		}
	};

	Checker.prototype.toBePositiveInt = function () {
		if (!isInt(this.target)) {
			throw new Error(this.source + ': "' + this.name + '" ' + ERROR_INTEGER);
		} else if (this.target < 0) {
			throw new Error(this.source + ': "' + this.name + '" ' + ERROR_NUMBER_POSITIVE);
		}
	};

	Checker.prototype.toBeBoolean = function () {
		if (!isBoolean(this.target)) {
			throw new Error(this.source + ': "' + this.name + '" ' + ERROR_BOOLEAN);
		}
	};

	Checker.prototype.toBeNonBlankString = function () {
		if (!isValidString(this.target)) {
			throw new Error(this.source + ': "' + this.name + '" ' + ERROR_STRING_NON_BLANK);
		}
	};

	Checker.prototype.toBeFunction = function () {
		if (!isFunction(this.target)) {
			throw new Error(this.source + ': "' + this.name + '" ' + ERROR_FUNCTION);
		}
	};

	Checker.prototype.toBeArray = function () {
		if (!isArray(this.target)) {
			throw new Error(this.source + ': "' + this.name + '" ' + ERROR_ARRAY);
		}
	};

	Checker.prototype.toBePresentIn = function (list) {
		if (!isArray(list)) {
			throw new Error('Checker: "list" ' + ERROR_ARRAY);
		}

		if (!contains(list, this.target)) {
			console.error(this.source + ': couldn\'t find', this.target, 'in', list);
			throw new Error(this.source + ': not found');
		}
	};

	return Checker;
})();

function check(source, target, name) {
	return new Checker(source, target, name);
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

	var container  = new RichHTMLElement('div'),
		stage      = new RichHTMLElement('div')
		background = new RichHTMLElement('div');

	var overlay  = new RichHTMLElement('div'),
		backdrop = new RichHTMLElement('div');

	stage.addClass('stage');
	background.addClass('background');

	container.attr('id', 'screen');
	container.attr('tabindex', 0);
	container.append(stage.source);
	container.append(background.source);

	keys.bindTo(container.source);

	var hold = false;

	var _check = check.bind(null, 'Game screen');

	function performActionWith(host, type) {
		var target = loadedObjects.filter(function (object) {
			var left  = host.scroll >= object.scroll - object.getHitWidth(),
			    right = host.scroll + host.getHitWidth() <= object.scroll + object.getHitWidth()

			return left && right && object !== host;
		})[0];

		if (target) {
			target.receiveAction(host.createAction(type, target));
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

	function emptyScreen() {
		new Array(stage.source, background.source).forEach(function (element) {
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
		});
	}

	function changeRoomTo(index) {
		if (index >= roomList.length) {
			throw new Error('Game screen: room index is out of range');
		}

		emptyScreen();

		roomIndex = index;
		loadedObjects = [];

		var roomActive = roomList[roomIndex];

		Array.prototype.push.apply(loadedObjects, roomActive.objects.slice())
		loadedObjects.push(objectActive);

		loadedObjects.forEach(function (object) {
			object.bound = roomActive.width;
			object.sprite.redraw();
		});

		roomActive.tiles.forEach(function (tile) {
			background.append(tile);
		});

		stage.append(objectActive.sprite.element);
	}

	return {
		load: function (rooms, spawn, target) {
			roomList     = rooms;
			objectActive = target;
			spawn        = spawn;

			_check(roomList, 'room list').toBeListOf(Room);
			_check(objectActive, 'active object').toBe(GameObject);
			_check(spawn, 'spawn').toBePositiveInt();

			objectActive.scroll = spawn;
			objectActive.sprite.index = 1;

			changeRoomTo(0);
		},
		change: function (index, scroll) {
			_check(index, 'index').toBePositiveInt();
			_check(scroll, 'scroll').toBePositiveInt();

			objectActive.scroll = scroll;

			changeRoomTo(index);
		},
		prompt: function (message, callback) {
			console.log('works')
			if (callback) {
				_check(callback, 'callback').toBeFunction();

				callback();
			}
		},
		next: function () {
			updateActiveObject();

			var roomActive = roomList[roomIndex];

			var children = stage.children();

			loadedObjects.forEach(function (object, i) {
				object.correctPosition(roomActive.width, object === objectActive ? null : objectActive);
				object.sprite.step();
				object.sprite.update();

				var x = object.sprite.x,
					y = object.sprite.y;

				var width  = object.sprite.getFrameWidth(),
					height = object.sprite.getFrameHeight();

				var hidden = x + width < 0 || x >= STAGE_WIDTH || y + height < 0 || y >= STAGE_HEIGHT;

				var target = object.sprite.element;

				if (hidden && contains(children, target)) {
					stage.remove(target); // remove hidden elements
				} else if (!hidden && !contains(children, target)) {
					stage.append(target); // add visible elements
				}
			});

			var offset = objectActive.scroll;

			if (objectActive.leftCornerReached()) {
				offset = 0;
			} else if (objectActive.rightCornerReached(roomActive.width)) {
				offset = roomActive.width;
			}

			roomActive.updateTiles(Math.floor(offset));
		},
		getContainer: function () {
			return container;
		}
	};
})();
var XML_CONFIG = '\
<level spawn="600">\
	<room name="hall" width="840">\
		<object sprite="door" scroll="40" disabled="true">\
		</object>\
		<object sprite="door" scroll="400">\
			<action name="interact" type="prompt">\
				lorem ipsum motherfucker 1\
			</action>\
			<action name="interact" type="prompt">\
				lorem ipsum motherfucker 2\
			</action>\
			<action name="interact" type="level" index="1" scroll="240">\
			</action>\
		</object>\
		<object sprite="door" scroll="780" disabled="true">\
		</object>\
	</room>\
	<room width="320" type="red">\
		<object sprite="door" scroll="240">\
			<action name="interact" type="level" index="0" scroll="400">\
			</action>\
		</object>\
	</room>\
</level>\
';
var SPRITES = {};

SPRITES.hero = new SpriteSheet('hero')
	.addAnimation('idle', new Animation({ width: 37, height: 72 }))
	.addAnimation('walk', new Animation({ x: 37, width: 37, height: 72, length: 16 }));

SPRITES.door = new SpriteSheet('door', 0, -10)
	.addAnimation('idle', new Animation({ width: 40, height: 80 }));
var XMLHelper = (function () {
	var ACTION_NAMES_ACCEPTED = ['interact'],
		ACTION_NAME_DEFAULT   = ACTION_NAMES_ACCEPTED[0],
		ACTION_TYPES_ACCEPTED = ['level', 'prompt'];

	var _check = check.bind(null, 'XML Helper');

	function parseAttributes(dom) {
		return toArray(dom.attributes).reduce(function (object, node) {
			object[toCamelCase(node.name)] = node.value;

			return object;
		}, {});
	}

	function parseAction(dom) {
		var attrs = parseAttributes(dom);

		var type = attrs.type;

		_check(type, 'type').toBePresentIn(ACTION_TYPES_ACCEPTED);

		switch (type) {
			case 'level':
				var index  = isDefined(attrs.index)  ? parseFloat(attrs.index)  : 0,
					scroll = isDefined(attrs.scroll) ? parseFloat(attrs.scroll) : 0;
				
				_check(index, 'index').toBePositiveInt();
				_check(scroll, 'scroll').toBePositiveInt();

				return function (action, callback) {
					gameScreen.change(index, scroll);

					if (callback) {
						_check(callback, 'callback').toBeFunction();
					
						callback();
					}
				};
			case 'prompt':
				return function (action, callback) {
					var text = 'derp';
				
					gameScreen.prompt(text, callback);
				}
		}
	}

	function parseObject(dom, index) {
		var attrs = parseAttributes(dom);

		var name     = attrs.name || '#' + index.toString(),
			sprite   = attrs.sprite,
			scroll   = isDefined(attrs.scroll) ? parseFloat(attrs.scroll) : null,
			hitWidth = attrs.hitWidth || null,
			disabled = isDefined(attrs.disabled) ? parseBoolean(attrs.disabled) : null;

		_check(sprite, 'sprite').toBeNonBlankString();

		var sheet = SPRITES[sprite];

		var object = new GameObject(name, sheet.clone(), scroll, hitWidth, disabled);

		toArray(dom.childNodes).forEach(function (node) {
			var name = node.attributes.name.value || ACTION_NAME_DEFAULT;

			_check(name, 'name').toBePresentIn(ACTION_NAMES_ACCEPTED);
		
			object.addActionListener(name, parseAction(node));
		});

		return object;
	}

	function parseRoom(dom, index) {
		var attrs = parseAttributes(dom);

		var name  = attrs.name || '#' + index.toString(),
			type  = attrs.type || null,
			width = isDefined(attrs.width) ? parseFloat(attrs.width) : 0,
			depth = isDefined(attrs.depth) ? parseFloat(attrs.depth) : 0;

		var objects = toArray(dom.childNodes).map(parseObject);

		return new Room(name, type, width, depth, objects);
	}

	function parseLevel(dom) {
		var level = new Object();

		if (dom.attributes.spawn) {
			level.spawn = parseFloat(dom.attributes.spawn.value);
			_check(level.spawn, 'spawn').toBePositiveInt();
		}

		level.rooms = toArray(dom.childNodes).map(parseRoom);

		return level;
	}

	return {
		parse: function (str) {
			var dom;

			str = str.replace(/\t+/g,''); // clear tabulations

			if (window.DOMParser) {
				var parser = new DOMParser();
				dom = parser.parseFromString(str, 'text/xml');
			} else { // Internet Explorer
				dom = new ActiveXObject('Microsoft.XMLDOM');
				dom.async = false;
				dom.loadXML(str); 
			}

			return parseLevel(dom.getElementsByTagName('level')[0]);
		}
	};
})();
(function () {
	var FRAME_STEP = 80;

	var body = new RichHTMLElement(document.body);

	body.append(gameScreen.getContainer());

	var player = new DynamicObject('hero', SPRITES.hero.clone(), 0, 8, false),
		level  = XMLHelper.parse(XML_CONFIG);

	gameScreen.load(level.rooms, level.spawn, player);

	setInterval(gameScreen.next, FRAME_STEP);
})();