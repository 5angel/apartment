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