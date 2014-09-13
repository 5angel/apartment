var check = (function () {
	function invalidWhenNot(name, type) {
		return function (object) {
			if (!(object instanceof type)) {
				throw new Error('invalid', name);
			}
		}
	}

	return {
		room: invalidWhenNot('room', Room),
		object: invalidWhenNot('object', GameObject),
		listOfObjects: function (list) {
			if (!isArray(list) || (isArray(list) && (list.length === 0 && !list.every(function (object) {
				return object instanceof GameObject;
			})))) {
				throw new Error('invalid list of objects!');
			}
		},
		animation: invalidWhenNot('animation', Animation),
		sprite: invalidWhenNot('sprite', SpriteSheet),
		action: invalidWhenNot('action', Action)
	};
})();