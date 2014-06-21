function Spritesheet(name) {
  if (!isValidString(name)) { throw new Error('Spritesheet without a name!');  }

  var CLASS_FLIPPED = 'stage__sprite_style_flipped',
      ANIMATION_OPTIONS_ALLOWED = ['x', 'y', 'width', 'height', 'length', 'delays', 'offsetX', 'offsetY'];;

  var animations = {};
  var flipped = false;
  var current, frame, delay;
  var x = 0, y = 0;

  var element = div();
  element.style.backgroundImage = 'url(\'dist/i/sprites/' + name + '.png\')';
  element.setAttribute('class', 'stage__sprite');

  this.getName     = function () { return name; }
  this.getElement  = function () { return element; }
  this.isFlipped   = function () { return flipped; }
  this.getPosition = function () { return { x: x, y: y }; }

  this.flip = function () {
    flipped = !flipped;
    if (flipped) { addClassTo(CLASS_FLIPPED, element); }
    else { removeClassFrom(CLASS_FLIPPED, element); }
    return this;
  };

  this.animation = function (name, options) {
    if (!arguments.length) { return current !== undefined ? current.name : null; }

    if (!isValidString(name)) { throw new Error('Animation without a name!');  }
    else if (arguments.length === 1) { // setting current animation
      frame = delay = 0;
      current = animations[name];

      if (!current) { throw new Error('No animation with a name of "' + name + '"') }

      x = x + current.offsetX;
      y = y + current.offsetY;

      element.style.width  = current.width.toString() + 'px' || 'auto';
      element.style.height = current.height.toString() + 'px' || 'auto';
      element.style.backgroundPosition = -current.x.toString() + 'px ' + -current.y.toString() + 'px';

      return this;
    }

    var o = options;

    for (var key in o) {
      if (!contains(ANIMATION_OPTIONS_ALLOWED, key)) { throw new Error('Key "' + key + '" is not allowed!'); }
    }

    o.name = name;

    var dimensions = ['x', 'y', 'offsetX', 'offsetY'];
    dimensions.forEach(function (d) { o[d] = o[d] || 0; });

    if (!o.width) { throw new Error('Animation without a width!'); }

    o.height = o.height || width;    
    o.length = o.length || 1;
    o.delays = o.delays || [];

    while (o.delays.length < o.length) { o.delays.push(0); }

    if (new Array(o.x, o.y, o.width, o.height, o.length, o.offsetX, o.offsetY).every(isInt) === false) {
      throw new Error('Animation dimensions should be integers!');
    }

    if (!isArray(o.delays) || (isArray(o.delays) && !o.delays.every(isInt))) {
      throw new Error('Animation delays should be an array of integers!');
    }

    if (o.delays.length > o.length) { o.delays = o.delays.slice(0, o.length - 1); }

    animations[name] = options;
    
    return this.animation(name);
  };

  this.next = function () {
    delay++;
    if (delay < current.delays[frame]) { return this; }
    else { delay = 0; }

    frame++;
    if (frame >= current.length) { frame = 0; }	  
    var pos = current.x + (frame * current.width);

    element.style.backgroundPosition = -pos.toString() + 'px ' + -current.y.toString() + 'px';
  };

  return this;
}