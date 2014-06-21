(function () {
  var FRAME_STEP    = 80,
      FRICTION      = .6,
      VELOCITY_STEP = .4,
      VELOCITY_MAX  = 3,
	  STAGE_WIDTH   = 320,
	  STAGE_HEIGHT  = 112,
	  FLOOR_OFFSET  = 6;

  // define sprites
  var SPRITES = {};

  SPRITES.hero = new Sprite('hero')
  .animation('walk', { x: 37, width: 37, height: 72, length: 16 })
  .animation('idle', { width: 37, height: 72 });

  var focus = SPRITES.hero;

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
 
  var currentRoom;

  function placeSprites() {
    stage.appendChild(focus.getElement());
  };

  function placeBackground() { currentRoom.getTiles().forEach(function (t) { background.appendChild(t) }) }

  function updateView() {
    if (currentRoom.getWidth() > STAGE_WIDTH) {
      var tiles = currentRoom.getTiles();

      tiles.forEach(function (t, i) {
        var p = Math.floor(focus.position() / (tiles.length - i)) * 2;

        t.style.backgroundPosition = p.toString() + 'px 0px';
      });
	}
  }

  function nextFrame() {
    var action   = pressed[0];

	var velocity   = focus.velocity(),
	    position   = focus.position(),
		dimensions = focus.dimensions();

    switch (action) {
      case 'right':
        velocity -= VELOCITY_STEP;
		if (focus.isFlipped()) { focus.flip() }
        break;
      case 'left':
        velocity += VELOCITY_STEP;
		if (!focus.isFlipped()) { focus.flip() }
        break;
      default:
        velocity *= FRICTION;
        if (Math.abs(velocity) < .1) { velocity = 0 }
        break;
    }

    velocity = Math.min(VELOCITY_MAX, Math.abs(velocity)) * (Math.abs(velocity) / velocity);
    velocity = velocity || 0;

	if (Math.abs(velocity) < 1 && focus.animation() === 'walk') { focus.animation('idle') }
	if (Math.abs(velocity) >= 1 && focus.animation() === 'idle') { focus.animation('walk') }

	position.y = STAGE_HEIGHT - dimensions.height - FLOOR_OFFSET;

	if (currentRoom.getWidth() === STAGE_WIDTH) {
	  position.x -= velocity;
	} else {
	  position.x = (STAGE_WIDTH / 2) - (dimensions.width / 2);
	}

	focus.position(position.x, position.y);
	focus.velocity(velocity);
	focus.next();

    updateView();
  }

  function loadLevel(room) {
    currentRoom = room;

	placeSprites();
    placeBackground();
  }

  loadLevel(new Room('blank'));

  setInterval(nextFrame, FRAME_STEP);
})();