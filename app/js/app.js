(function () {
  function isArray(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; }
  function isInt(n) { return typeof n === 'number' && n % 1 == 0; }
  function div() { return document.createElement('div'); }

  function contains(array) {
    if (arguments.length < 2) { throw new Error('Nothing to search for!'); }
    var args = Array.prototype.slice.call(arguments).slice(1);
    return args.every(function (item) { return array.indexOf(item) !== -1; });
  }

  var ANIMATION_OPTIONS_ALLOWED = ['x', 'y', 'width', 'height', 'length', 'delays'];

  function Spritesheet(_name) {
    var animations = {},
      current, frame, delay;

    this.x = 0;
    this.y = 0;

    this.element = div();
    this.element.style.backgroundImage = 'url(\'app/i/sprites/' + _name + '.png\')';
    this.element.setAttribute('class', 'stage__sprite');

    this.animation = function (name, options) {
	  var o = options;

      if (!name) { throw new Error('Animation without name!');  }
      else if (arguments.length === 1) { // setting current animation
        frame = delay = 0;
        current = animations[name];

        if (!current) { throw new Error('No animation with name "' + name + '"') }

        this.element.style.width  = current.width.toString() + 'px' || 'auto';
        this.element.style.height = current.height.toString() + 'px' || 'auto';
		this.element.style.backgroundPosition = -current.x.toString() + 'px ' + -current.y.toString() + 'px';

        return this;
      }

	  for (var key in o) {
        if (!contains(ANIMATION_OPTIONS_ALLOWED, key)) { throw new Error('Key not allowed!'); }
      }

      o.x = o.x || 0;
      o.y = o.y || 0;	 

      if (!o.width) { throw new Error('Animation without width!'); }

      o.height = o.height || width;    
      o.length = o.length || 1;
      o.delays = o.delays || [];

	  while (o.delays.length < o.length) { o.delays.push(0); }

	  if (new Array(o.x, o.y, o.width, o.height, o.length).every(isInt) === false) {
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

	  var x = current.x + (frame * current.width);

	  this.element.style.backgroundPosition = -x.toString() + 'px ' + -current.y.toString() + 'px';
	};

    return this;
  }

  var STEP = 40,
      VELOCITY_STEP = .2;
      VELOCITY_MAX = 2;

  var position = 0,
      velocity = 0;

  var pressed = [];

  function getKeyAction(value) {
    if (value === 87 || value === 38) { return 'up'; }
    else if (value === 68 || value === 39) { return 'right'; }
    else if (value === 83 || value === 40) { return 'down'; }
    else if (value === 65 || value === 37) { return 'left'; }
  }

  function onKeyDown(e) {
    var pending = getKeyAction(e.keyCode);
    if (pressed.indexOf(pending) === -1) { pressed.push(pending); }
  }

  function onKeyUp(e) {
    var index = pressed.indexOf(getKeyAction(e.keyCode));
    if (index !== -1) pressed.splice(index, 1);
  }

  var screen = div(),
      stage = div(),
      background = div();

  document.body.appendChild(screen);
  screen.setAttribute('id', 'screen');
  screen.setAttribute('tabindex', 0);
  screen.appendChild(stage);
  screen.appendChild(background);
  screen.addEventListener('keydown', onKeyDown);
  screen.addEventListener('keyup', onKeyUp);
  stage.setAttribute('class', 'stage');
  background.setAttribute('class', 'background');

  function addTiles(types) {
    types = types || ['base'];

    var array = [];

    if (isArray(types)) {
      types.forEach(function (value) {
        var t = div();

        if (typeof value !== 'string') { value = value.toString(); }

        t.style.backgroundImage = 'url(\'app/i/tiles/' + value + '.png\')';

        t.setAttribute('class', 'background__tile');
        array.push(t);
        background.appendChild(t);
      });
    } else { throw new Error('Not an array'); }

    return array;
  }

  var hero = new Spritesheet('hero').animation('idle', { width: 32, height: 160, length: 2, delays: [10, 10] });

  stage.appendChild(hero.element);

  var tiles = addTiles();

  function updateView() {
    tiles.forEach(function (t, i) {
      var p = Math.floor(position) * 2;

      t.style.backgroundPosition = p.toString() + 'px 0px';
    });
  }

  function nextFrame() {
    hero.next();

    var action = pressed[0];

    switch (action) {
      case 'right':
        velocity += VELOCITY_STEP;
        break;
      case 'left':
        velocity -= VELOCITY_STEP;
        break;
      default:
        velocity *= .8;
        if (Math.abs(velocity) < .1) { velocity = 0; }
        break;
    }

    velocity = Math.min(VELOCITY_MAX, Math.abs(velocity)) * (Math.abs(velocity) / velocity);
    velocity = velocity || 0;
    position += velocity;

    updateView();
  }

  setInterval(nextFrame, STEP);
})();