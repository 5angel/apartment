(function () {
  var FRAME_STEP = 80;

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

	var scroll = activeObject.getScroll(),
		delta  = activeObject.getDelta(),
		width  = currentRoom.getWidth();

	updateView(scroll, width, delta);

	activeObject.correctPosition(width);
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