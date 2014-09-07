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
		if (value === 87 || value === 38) {
			return 'up';
		} else if (value === 68 || value === 39) {
			return 'right';
		} else if (value === 83 || value === 40) {
			return 'down';
		} else if (value === 65 || value === 37) {
			return 'left';
		}
  }

	function onKeyDown(e) {
		var pending = getKeyAction(e.keyCode);

		if (pressed.indexOf(pending) === -1) {
			pressed.push(pending);
		}
	}

	function onKeyUp(e) {
		var index = pressed.indexOf(getKeyAction(e.keyCode));

		if (index !== -1) {
			pressed.splice(index, 1);
		}
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

	function updateView() {
		var scroll = activeObject.scroll,
			delta  = Math.floor(activeObject.getDelta());

		var children = Array.prototype.slice.call(stage.childNodes, 0);

		loadedObjects.forEach(function (object, i) {
			object.correctPosition(object === activeObject ? null : activeObject);
			object.sprite.next();
			object.sprite.update();

			var x = object.sprite.x,
			    y = object.sprite.y;
			var dimensions = object.sprite.getDimensions();

			var hidden = x + dimensions.width < 0 || x >= STAGE_WIDTH || y + dimensions.height < 0 || y >= STAGE_HEIGHT;

			var target = object.sprite.element.target;

			if (hidden && contains(children, target)) {
				stage.removeChild(target);	// remove hidden elements
			} else if (!hidden && !contains(children, target)) {
				stage.appendChild(target); // add visible elements
			}
		});

		var x = 0;
		
		if (scroll + delta >= currentRoom.width) {
			x = currentRoom.width - (delta * 2);
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
				activeObject.push(-1);
				break;
			case 'left':
				activeObject.push();
				break;
			default:
				activeObject.wait();
				break;
		}

		updateView();
	}

	function loadLevel(room, objects) {
		if (room instanceof Room === false ) {
			throw new Error('Please provide a room!');
		}

		var o = objects;

		if (!isArray(o) || (isArray(o) && (o.length === 0 && !o.every(function (t) { return t instanceof GameObject })))) {
			throw new Error('Please provide a correct array of objects!');
		}

		currentRoom   = room;
		loadedObjects = objects;
		activeObject  = objects[0];

		activeObject.sprite.index = 1;

		loadedObjects.forEach(function (object) {
			object.bound = room.width;
			object.sprite.redraw();
		});

		currentRoom.getTiles().forEach(function (tile) {
			background.appendChild(tile)
		});

		stage.appendChild(activeObject.sprite.element.target);
	}

	loadLevel(new Room('blank', null, 840), [
		new GameObject(SPRITES.hero, null, null, 740),
		new GameObject(SPRITES.hero.clone(), null, null, 40),
		new GameObject(SPRITES.hero.clone(), null, null, 400),
		new ActionObject(SPRITES.hero.clone(), null, null, 780)
	]);

	setInterval(nextFrame, FRAME_STEP);
})();