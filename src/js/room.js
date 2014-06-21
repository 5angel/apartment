function Room(name, type, depth) {
  var TYPE_BASE = 'base';

  if (!isValidString(name)) { throw new Error('Room without a name!'); }

  type  = type || TYPE_BASE;
  depth = depth || 1;

  if (!isValidString(type)) { throw new Error('Room with invalid type of "' + type + '"!'); }
  if (!isInt(depth)) { throw new Error('Room with invalid depth of "' + depth + '"!'); }

  this.getName = function () { return name; };

  this.getTiles = function () {
    var array = [];

    for (var i = 0; i < depth; ++i) {
      var t = div(),
	      filename = depth === 1 ? type : type + '_' + i.toString();

      t.style.backgroundImage = 'url(\'dist/i/tiles/' + type + '.png\')';

      t.setAttribute('class', 'background__tile');
      array.push(t);
	}
	
    return array;
  };
}