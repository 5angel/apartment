var Room = (function () {
  var TYPE_DEFAULT  = 'base',
      WIDTH_DEFAULT = 320;

  function Room(name, type, width, depth) {
    if (!isValidString(name)) {
	  throw new Error('Room without a name!');
	}

    type  = type  || TYPE_DEFAULT;
    width = width || WIDTH_DEFAULT;
    depth = depth || 1;

    if (!isValidString(type)) {
	  throw new Error('Room with invalid type of "' + type + '"!');
	}

    if (!isInt(width)) {
	  throw new Error('Room with invalid width of "' + width + '"!');
	}

    if (!isInt(depth)) {
	  throw new Error('Room with invalid depth of "' + depth + '"!');
	}

    width = Math.max(WIDTH_DEFAULT, width);

    var tiles = [];

    this.getName = function () {
	  return name;
	};

    this.getWidth = function () {
	  return width;
	};

    this.getTiles = function () {
      if (tiles.length > 0) {
	    return tiles;
      }

      for (var i = 0; i < depth; ++i) {
        var t = div(),
	        filename = depth === 1 ? type : type + '_' + i.toString();

        t.style.backgroundImage = 'url(\'dist/i/tiles/' + type + '.png\')';

        t.setAttribute('class', 'background__tile');
        tiles.push(t);
	  }

      return tiles;
    };
  }

  return Room;
})();