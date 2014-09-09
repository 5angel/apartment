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

	SpriteSheet.prototype.getFrameWidth = function () {
		return this.getAnimation().width;
	};

	SpriteSheet.prototype.getFrameHeight = function () {
		return this.getAnimation().height;
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