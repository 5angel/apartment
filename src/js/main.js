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

  function updateView() {
    if (currentRoom.getWidth() > STAGE_WIDTH) {
      var tiles = currentRoom.getTiles();

      tiles.forEach(function (t, i) {
        var p = Math.floor(activeObject.getScroll() / (tiles.length - i)) * 2;

        t.style.backgroundPosition = p.toString() + 'px 0px';
      });
	}
  }

  function nextFrame() {
    var action = pressed[0],
	    sprite = activeObject.getSprite();

	var position   = sprite.position(),
		dimensions = sprite.dimensions();

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

	position.y = STAGE_HEIGHT - dimensions.height - FLOOR_OFFSET;

	if (currentRoom.getWidth() === STAGE_WIDTH) {
	  position.x -= activeObject.getVelocity();
	} else {
	  position.x = (STAGE_WIDTH / 2) - (dimensions.width / 2);
	}

	sprite.position(position.x, position.y);
	sprite.next();

    updateView();
  }

  function loadLevel(room, objects) {
    if (room instanceof Room === false ) { throw new Error('Please provide a room!') }

	var o = objects;

    if (!isArray(o) || (isArray(o) && (o.length === 0 && !o.every(function (t) { return t instanceof GameObject })))) {
      throw new Error('Please provide a correct array of objects!');
    }

    currentRoom  = room;
	activeObject = objects[0];

	placeSprites();
    placeBackground();
  }

  loadLevel(new Room('blank'), [new GameObject(SPRITES.hero)]);

  setInterval(nextFrame, FRAME_STEP);
})();