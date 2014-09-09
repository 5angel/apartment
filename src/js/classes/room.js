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
		this.tiles = createTiles(this.depth, this.type);
	}

	return Room;
})();