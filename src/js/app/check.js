var check = (function () {
	var PAIRS = {
		'animation': Animation,
		'sprite': SpriteSheet,
		'action': Action,
		'object': GameObject,
		'room': Room,
		'level': Level
	};

	function isInstanceFactory(type) {
		return function (object) {
			return object instanceof type;
		}
	}

	var checker = {
		is: {},
		should: {}
	};

	for (var prop in PAIRS) {
		checker.is[prop] = isInstanceFactory(PAIRS[prop]);
	}

	function shouldBeFactory(name) {
		return function (object) {
			if (!checker.is[name](object)) {
				throw new Error('invalid', name);
			}
		}
	}

	function shouldBeListFactory(name) {
		return function (list) {
			if (!isArray(list) || (isArray(list) && (list.length > 0 && !list.every(checker.is[name])))) {
				throw new Error('invalid list of type ' + name);
			}
		}
	}

	for (var prop in PAIRS) {
		var shouldFn = shouldBeFactory(prop);

		shouldFn.list = shouldBeListFactory(prop);

		checker.should[prop] = shouldFn;
	}

	return checker;
})();