var gameScreen = (function () {
	var STAGE_WIDTH  = 320,
		STAGE_HEIGHT = 112;

	var roomList = [],
		roomIndex = 0;

	var loadedObjects = [],
		objectActive  = null;

	var container  = new RichHTMLElement('div'),
		stage      = new RichHTMLElement('div')
		background = new RichHTMLElement('div');

	var overlay  = new RichHTMLElement('div'),
		backdrop = new RichHTMLElement('div');

	stage.addClass('stage');
	background.addClass('background');

	container.attr('id', 'screen');
	container.attr('tabindex', 0);
	container.append(stage.source);
	container.append(background.source);

	keys.bindTo(container.source);

	var hold = false;

	var _check = check.bind(null, 'Game screen');

	function performActionWith(host, type) {
		var target = loadedObjects.filter(function (object) {
			var left  = host.scroll >= object.scroll - object.getHitWidth(),
			    right = host.scroll + host.getHitWidth() <= object.scroll + object.getHitWidth()

			return left && right && object !== host;
		})[0];

		if (target) {
			target.receiveAction(host.createAction(type, target));
		}
	}

	function updateActiveObject() {
		switch (keys.getLast()) {
			case 'right':
				objectActive.pull(-1);
				break;
			case 'left':
				objectActive.pull();
				break;
			case 'down':
				if (!hold) {
					performActionWith(objectActive, 'interact');
				}

				objectActive.wait();
				break;
			default:
				objectActive.wait();
				break;
		}

		hold = keys.hasKey('down');
	}

	function emptyScreen() {
		new Array(stage.source, background.source).forEach(function (element) {
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
		});
	}

	function changeRoomTo(index) {
		if (index >= roomList.length) {
			throw new Error('Game screen: room index is out of range');
		}

		emptyScreen();

		roomIndex = index;
		loadedObjects = [];

		var roomActive = roomList[roomIndex];

		Array.prototype.push.apply(loadedObjects, roomActive.objects.slice())
		loadedObjects.push(objectActive);

		loadedObjects.forEach(function (object) {
			object.bound = roomActive.width;
			object.sprite.redraw();
		});

		roomActive.tiles.forEach(function (tile) {
			background.append(tile);
		});

		stage.append(objectActive.sprite.element);
	}

	function nextFrame() {
		updateActiveObject();

		var roomActive = roomList[roomIndex];

		var children = stage.children();

		loadedObjects.forEach(function (object, i) {
			object.correctPosition(roomActive.width, object === objectActive ? null : objectActive);
			object.sprite.step();
			object.sprite.update();

			var x = object.sprite.x,
				y = object.sprite.y;

			var width  = object.sprite.getFrameWidth(),
				height = object.sprite.getFrameHeight();

			var hidden = x + width < 0 || x >= STAGE_WIDTH || y + height < 0 || y >= STAGE_HEIGHT;

			var target = object.sprite.element;

			if (hidden && contains(children, target)) {
				stage.remove(target); // remove hidden elements
			} else if (!hidden && !contains(children, target)) {
				stage.append(target); // add visible elements
			}
		});

		var offset = objectActive.scroll;

		if (objectActive.leftCornerReached()) {
			offset = 0;
		} else if (objectActive.rightCornerReached(roomActive.width)) {
			offset = roomActive.width;
		}

		roomActive.updateTiles(Math.floor(offset));
	}

	var loop = null;

	return {
		start: function () {
			loop = setInterval(nextFrame, FRAME_STEP);
		},
		stop: function () {
			if (loop) {
				clearInterval(loop);
				loop = null;
			}
		},
		load: function (rooms, spawn, target) {
			roomList     = rooms;
			objectActive = target;
			spawn        = spawn;

			_check(roomList, 'room list').toBeListOf(Room);
			_check(objectActive, 'active object').toBe(GameObject);
			_check(spawn, 'spawn').toBePositiveInt();

			objectActive.scroll = spawn;
			objectActive.sprite.index = 1;

			changeRoomTo(0);
		},
		change: function (index, scroll) {
			_check(index, 'index').toBePositiveInt();
			_check(scroll, 'scroll').toBePositiveInt();

			objectActive.scroll = scroll;

			changeRoomTo(index);
		},
		prompt: function (message, callback) {
			if (callback) {
				_check(callback, 'callback').toBeFunction();

				callback();
			}
		},
		getContainer: function () {
			return container;
		}
	};
})();