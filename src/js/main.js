(function () {
  var FRAME_STEP    = 80,
      VELOCITY_STEP = .4,
      VELOCITY_MAX  = 3,
	  STAGE_WIDTH   = 320,
	  STAGE_HEIGHT  = 112,
	  FLOOR_OFFSET  = 6;

  // define sprites
  var SPRITES = {};

  SPRITES.hero = new SpriteSheet('hero')
  .animation('walk', { x: 37, width: 37, height: 72, length: 16 })
  .animation('idle', { width: 37, height: 72 });

  var pressed = [],
      sprites = [];

  function getKeyAction(value) {
    if (value === 87 || value === 38) { return 'up' }
    else if (value === 68 || value === 39) { return 'right' }
    else if (value === 83 || value === 40) { return 'down' }
    else if (value === 65 || value === 37) { return 'left' }
  }

  function onKeyDown(e) {
    var pending = getKeyAction(e.keyCode);
    if (pressed.indexOf(pending) === -1) { pressed.push(pending) }
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
 
  var currentRoom, activeObject;

  function placeSprites() {
    stage.appendChild(activeObject.getSprite().getElement());
  };

  function placeBackground() { currentRoom.getTiles().forEach(function (t) { background.appendChild(t) }) }

  function updateView(scroll, width, delta) {
    var tiles  = currentRoom.getTiles();

	var x = 0;
	
	if (scroll + delta >= width) { x = width - (delta * 2) }
	else if (scroll >= delta) { x = scroll - delta }

    tiles.forEach(function (t, i) {
      var p = -Math.floor(x / (tiles.length - i)) * 2;

      t.style.backgroundPosition = p.toString() + 'px 0px';;
	});
  }

  function nextFrame() {
    var action = pressed[0];

    switch (action) {
      case 'right':
        activeObject.pushRight();
        break;
      case 'left':
        activeObject.pushLeft();
        break;
      default:
        activeObject.wait();
        break;
    }

	var sprite = activeObject.getSprite(),
		scroll = activeObject.getScroll(),
		width  = currentRoom.getWidth();

	var position   = sprite.position(),
		dimensions = sprite.dimensions();

	position.y = STAGE_HEIGHT - dimensions.height - FLOOR_OFFSET;

	// TODO: move position logic to GameObject

	var delta = (STAGE_WIDTH / 2) - (dimensions.width / 2);
	var toLeft  = scroll < delta,
	    toRight = scroll + delta >= width;

	if (!toLeft && !toRight) {
	  position.x = delta;
	} else {
	  position.x = toRight ? scroll - width + STAGE_WIDTH - dimensions.width : scroll;
	}
	
	updateView(scroll, width, delta);

	sprite.next();
	sprite.position(position.x, position.y);
  }

  function loadLevel(room, objects) {
    if (room instanceof Room === false ) { throw new Error('Please provide a room!') }

	var o = objects;

    if (!isArray(o) || (isArray(o) && (o.length === 0 && !o.every(function (t) { return t instanceof GameObject })))) {
      throw new Error('Please provide a correct array of objects!');
    }

	objects.forEach(function (obj) {
	  obj.setBound(room.getWidth());
	});

    currentRoom  = room;
	activeObject = objects[0];

	placeSprites();
    placeBackground();
  }

  loadLevel(new Room('blank', null, 420), [new GameObject(SPRITES.hero)]);

  setInterval(nextFrame, FRAME_STEP);
})();