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

	function validateRoom(name, type, width, depth) {
		if (!isValidString(name)) {
			throw new Error('Room without a name!');
		}

		if (!isValidString(type)) {
			throw new Error('Room with invalid type');
		}

		if (!isInt(width)) {
			throw new Error('Room with invalid width');
		}

		if (!isInt(depth)) {
			throw new Error('Room with invalid depth');
		}
	}

	function Room(name, type, width, depth) {
		this.name  = name;
		this.type  = type  || TYPE_DEFAULT;
		this.width = width || WIDTH_DEFAULT;
		this.depth = depth || 1;

		validateRoom(this.name, this.type, this.width, this.depth);

		this.width = Math.max(WIDTH_DEFAULT, this.width);
		this.tiles = createTiles(this.depth, this.type);
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