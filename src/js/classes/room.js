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