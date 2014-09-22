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