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