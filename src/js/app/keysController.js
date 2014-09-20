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