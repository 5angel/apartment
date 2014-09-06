(function () {
  var STAGE_WIDTH   = 320,
	  STAGE_HEIGHT  = 112,
      FRAME_STEP = 80;

  // define sprites
  var SPRITES = {};

  SPRITES.hero = new SpriteSheet('hero')
  .addAnimation('idle', { width: 37, height: 72 })
  .addAnimation('walk', { x: 37, width: 37, height: 72, length: 16 });

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

  var screen     = document.createElement('div'),
      stage      = document.createElement('div'),
      background = document.createElement('div');

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
	  var sprite  = object.getSprite();

      object.correctPosition(object === activeObject ? null : activeObject);
      sprite.next();
	  sprite.update();

	  var width  = sprite.getDimensions().width,
	      height = sprite.getDimensions().height;

	  var hidden = sprite.x + width < 0 || sprite.x >= STAGE_WIDTH || sprite.y + height < 0 || sprite.y >= STAGE_HEIGHT;

	  var target = sprite.element.target;

	  if (hidden && contains(children, target)) {
	    stage.removeChild(target);	// remove hidden elements
	  } else if (!hidden && !contains(children, target)) {
	    stage.appendChild(target); // add visible elements
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

	activeObject.getSprite().index = 1;

	loadedObjects.forEach(function (object) {
	  object.setBound(room.getWidth());
	  object.getSprite().redraw();
	});

	currentRoom.getTiles().forEach(function (tile) {
	  background.appendChild(tile)
	});

	stage.appendChild(activeObject.getSprite().element.target);
  }

  loadLevel(new Room('blank', null, 840), [
    new GameObject(SPRITES.hero, null, null, 740),
	new GameObject(SPRITES.hero.clone(), null, null, 40),
	new GameObject(SPRITES.hero.clone(), null, null, 400),
	new GameObject(SPRITES.hero.clone(), null, null, 780)
  ]);

  setInterval(nextFrame, FRAME_STEP);
})();