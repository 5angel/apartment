(function () {
  var STAGE_WIDTH   = 320,
	  STAGE_HEIGHT  = 112,
      FRAME_STEP = 80;

  // define sprites
  var SPRITES = {};

  SPRITES.hero = new SpriteSheet('hero')
  .animation('idle', { width: 37, height: 72 })
  .animation('walk', { x: 37, width: 37, height: 72, length: 16 });

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
 
  var currentRoom, loadedObjects, activeObject;

  function updateView(scroll, width, delta) {
	var scroll = activeObject.getScroll(),
	    delta  = Math.floor(activeObject.getDelta()),
	    width  = currentRoom.getWidth();

	var children = Array.prototype.slice.call(stage.childNodes, 0);

	loadedObjects.forEach(function (object, i) {
	  var sprite  = object.getSprite(),
	      element = sprite.getElement();

      object.correctPosition(object === activeObject ? null : activeObject);
      sprite.next();

	  var pos = sprite.position(),
		  dim = sprite.dimensions();

	  var hidden = pos.x + dim.width < 0 || pos.x >= STAGE_WIDTH || pos.y + dim.height < 0 || pos.y >= STAGE_HEIGHT;

	  if (hidden && contains(children, element)) {
	    stage.removeChild(element);	// remove hidden elements
	  } else if (!hidden && !contains(children, element)) {
	    stage.appendChild(element); // add visible elements
	  }
	});

	var x = 0;
		
	if (scroll + delta >= width) {
	  x = width - (delta * 2);
	} else if (scroll >= delta) {
	  x = Math.floor(scroll) - delta;
	}

	var tiles = currentRoom.getTiles();

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

	updateView();
  }

  function loadLevel(room, objects) {
    if (room instanceof Room === false ) { throw new Error('Please provide a room!') }

	var o = objects;

    if (!isArray(o) || (isArray(o) && (o.length === 0 && !o.every(function (t) { return t instanceof GameObject })))) {
      throw new Error('Please provide a correct array of objects!');
    }

    currentRoom   = room;
	loadedObjects = objects;
	activeObject  = objects[0];

	activeObject.getSprite().index(1);

	loadedObjects.forEach(function (object) {
	  object.setBound(room.getWidth());
	});

	currentRoom.getTiles().forEach(function (tile) {
	  background.appendChild(tile)
	});

	stage.appendChild(activeObject.getSprite().getElement());
  }

  loadLevel(new Room('blank', null, 840), [
    new GameObject(SPRITES.hero, null, null, 740),
	new GameObject(SPRITES.hero.clone(), null, null, 40),
	new GameObject(SPRITES.hero.clone(), null, null, 400),
	new GameObject(SPRITES.hero.clone(), null, null, 780)
  ]);

  setInterval(nextFrame, FRAME_STEP);
})();