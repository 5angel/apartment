var Room = (function () {
	var WIDTH_DEFAULT = 320;

	var TYPE_DEFAULT = 'base',
		SRC_BASE     = 'url(\'dist/i/tiles/',
		SRC_TAIL     = '.png\')',
		CLASS_BASE   = 'background__tile';

	var _check = check.bind(null, 'Room');
	
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

	function Room(name, type, width, depth, objects) {
		this.name  = name;
		this.type  = type  || TYPE_DEFAULT;
		this.width = width || WIDTH_DEFAULT;
		this.depth = depth || 1;

		_check(this.name).toBeNonBlankString();
		_check(this.type).toBeNonBlankString();
		_check(this.width).toBePositiveInt();
		_check(this.depth).toBePositiveInt();

		this.width   = Math.max(WIDTH_DEFAULT, this.width);
		this.tiles   = createTiles(this.depth, this.type);
		this.objects = objects || [];

		_check(this.objects).toBeListOf(GameObject);
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