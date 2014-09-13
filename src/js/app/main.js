(function () {
	var STAGE_WIDTH   = 320,
		STAGE_HEIGHT  = 112,
		FRAME_STEP = 80;

	// define sprites
	var SPRITES = {};

	SPRITES.hero = new SpriteSheet('hero')
		.addAnimation('idle', new Animation({ width: 37, height: 72 }))
		.addAnimation('walk', new Animation({ x: 37, width: 37, height: 72, length: 16 }));

	SPRITES.door = new SpriteSheet('door', 0, -10)
		.addAnimation('idle', new Animation({ width: 40, height: 80 }));

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
		var children = Array.prototype.slice.call(stage.childNodes, 0);

		loadedObjects.forEach(function (object, i) {
			object.correctSprite(currentRoom.width, object === activeObject ? null : activeObject);
			object.sprite.step();
			object.sprite.update();

			var x = object.sprite.x,
			    y = object.sprite.y;
			var width  = object.sprite.getFrameWidth(),
				height = object.sprite.getFrameHeight();

			var hidden = x + width < 0 || x >= STAGE_WIDTH || y + height < 0 || y >= STAGE_HEIGHT;

			var target = object.sprite.element.target;

			if (hidden && contains(children, target)) {
				stage.removeChild(target);	// remove hidden elements
			} else if (!hidden && !contains(children, target)) {
				stage.appendChild(target); // add visible elements
			}
		});

		var delta = Math.floor(activeObject.getDeltaWidth(2));

		var x = 0;

		if (activeObject.scroll + delta >= currentRoom.width) {
			x = currentRoom.width - (delta * 2);
		} else if (activeObject.scroll >= delta) {
			x = Math.floor(activeObject.scroll) - delta;
		}

		currentRoom.updateTiles(x);
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
			case 'down':
				performActionWith(activeObject);
				break;
			default:
				activeObject.wait();
				break;
		}

		updateView();
	}

	function performActionWith(object) {
		check.object(object);
	}

	function loadLevel(room, objects) {
		check.room(room);
		check.listOfObjects(objects);

		currentRoom   = room;
		loadedObjects = objects;
		activeObject  = objects[0];

		activeObject.sprite.index = 1;

		loadedObjects.forEach(function (object) {
			object.bound = room.width;
			object.sprite.redraw();
		});

		currentRoom.tiles.forEach(function (tile) {
			background.appendChild(tile);
		});

		stage.appendChild(activeObject.sprite.element.target);
	}

	loadLevel(new Room('blank', null, 840), [
		new DynamicObject(SPRITES.hero, 740),
		new DynamicObject(SPRITES.door.clone(), 40),
		new DynamicObject(SPRITES.door.clone(), 400),
		new DynamicObject(SPRITES.door.clone(), 780)
	]);

	setInterval(nextFrame, FRAME_STEP);
})();