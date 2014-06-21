function Sprite(name) {
  if (!isValidString(name)) { throw new Error('Sprite without a name!');  }

  var CLASS_FLIPPED = 'stage__sprite_style_flipped',
      ANIMATION_OPTIONS_ALLOWED = ['x', 'y', 'width', 'height', 'length', 'delays', 'offsetX', 'offsetY'];;

  var animations = {};
  var flipped = false;
  var current, frame, delay;

  var x = 0,
      y = 0;

  var velocity = 0;
  var element = div();
  var _dimensions;

  element.style.backgroundImage = 'url(\'dist/i/sprites/' + name + '.png\')';
  element.setAttribute('class', 'stage__sprite');

  this.getName    = function () { return name }
  this.getElement = function () { return element }
  this.isFlipped  = function () { return flipped }

  this.position = function (nx, ny) {
    if (!arguments.length) { return { x: x, y: y } }

    nx = nx || x;
	ny = ny || y;

	if (!isNumber(nx) || !isNumber(ny)) { throw new Error('Invalid coordinates!') }

	if (nx !== x) {
	  x = nx;
	  nx *= 2;
	  element.style.left = Math.floor(nx).toString() + 'px';
	}

	if (ny !== y) {
	  y = ny;
	  ny *= 2;
	  element.style.top = Math.floor(ny).toString() + 'px';
	}
  };

  this.velocity = function (value) {
    if (!arguments.length) { return velocity }
    if (!isNumber(value)) { throw new Error('Velocity with invalid value of "' + value + '"!') }

	velocity = value;
  }

  var that = this;  

  this.flip = function () {
    flipped = !flipped;
    if (flipped) { addClassTo(CLASS_FLIPPED, element) }
    else { removeClassFrom(CLASS_FLIPPED, element) }
    return this;
  };

  this.dimensions = function (name) {
    name = name || current.name;

    if (!isValidString(name)) { throw new Error('Animation with invalid name!');  }
	if (_dimensions && _dimensions.name === name) { return _dimensions }

	_dimensions = {};

    var source = animations[name];

	for (var prop in source) {
	  if (source.hasOwnProperty(prop)) { _dimensions[prop] = source[prop] }
	}

	return _dimensions;
  };

  this.animation = function (name, options) {
    if (!arguments.length) { return current !== undefined ? current.name : null }

    if (!isValidString(name)) { throw new Error('Animation with invalid name!');  }
    else if (arguments.length === 1) { // setting current animation
      frame = delay = 0;
      current = animations[name];

      if (!current) { throw new Error('No animation with a name of "' + name + '"') }

	  var width  = current.width * 2,
	      height = current.height * 2;

      var px = (current.x + current.offsetX) * 2,
          py = (current.y + current.offsetY) * 2;

      element.style.width  = width.toString() + 'px' || 'auto';
      element.style.height = height.toString() + 'px' || 'auto';
      element.style.backgroundPosition = -px.toString() + 'px ' + -py.toString() + 'px';

      return this;
    }

    var o = options;

    for (var key in o) {
      if (!contains(ANIMATION_OPTIONS_ALLOWED, key)) { throw new Error('Key "' + key + '" is not allowed!') }
    }

    o.name = name;

    var dimensions = ['x', 'y', 'offsetX', 'offsetY'];
    dimensions.forEach(function (d) { o[d] = o[d] || 0 });

    if (!o.width) { throw new Error('Animation without a width!') }

    o.height = o.height || width;    
    o.length = o.length || 1;
    o.delays = o.delays || [];

    while (o.delays.length < o.length) { o.delays.push(0) }

    if (new Array(o.x, o.y, o.width, o.height, o.length, o.offsetX, o.offsetY).every(isInt) === false) {
      throw new Error('Animation dimensions should be integers!');
    }

    if (!isArray(o.delays) || (isArray(o.delays) && !o.delays.every(isInt))) {
      throw new Error('Animation delays should be an array of integers!');
    }

    if (o.delays.length > o.length) { o.delays = o.delays.slice(0, o.length - 1) }

    animations[name] = options;
    
    return this.animation(name);
  };

  this.next = function () {
    delay++;
    if (delay < current.delays[frame]) { return this }
    else { delay = 0 }

    frame++;
    if (frame >= current.length) { frame = 0 }	  
    var pos = (current.x + (frame * current.width)) * 2;

    element.style.backgroundPosition = -pos.toString() + 'px ' + -current.y.toString() + 'px';
  };

  return this;
}