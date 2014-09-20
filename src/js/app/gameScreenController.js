var gameScreen = (function () {
	var STAGE_WIDTH  = 320,
		STAGE_HEIGHT = 112;

	var roomList = [],
		roomIndex = 0;

	var loadedObjects = [],
		objectActive  = null;

	var container  = document.createElement('div'),
		stage      = document.createElement('div')
		background = document.createElement('div');

	stage.setAttribute('class', 'stage');
	background.setAttribute('class', 'background');

	container.setAttribute('id', 'screen');
	container.setAttribute('tabindex', 0);
	container.appendChild(stage);
	container.appendChild(background);

	keys.bindTo(container);

	var hold = false;

	function performActionWith(host, type) {
		var target = loadedObjects.filter(function (object) {
			var left  = host.scroll >= object.scroll - object.getHitWidth(),
			    right = host.scroll + host.getHitWidth() <= object.scroll + object.getHitWidth()

			return left && right && object !== host;
		})[0];

		if (target) {
			target.receiveAction(host.createAction(type));
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

	return {
		load: function (rooms, target) {
			roomList     = rooms;
			objectActive = target;

			check(roomList).shouldBeListOf(Room);
			check(objectActive).shouldBe(GameObject);

			objectActive.sprite.index = 1;

			roomIndex = 0;

			var roomActive = roomList[roomIndex];

			Array.prototype.push.apply(loadedObjects, roomActive.objects.slice())
			loadedObjects.push(objectActive);

			loadedObjects.forEach(function (object) {
				object.bound = roomActive.width;
				object.sprite.redraw();
			});

			roomActive.tiles.forEach(function (tile) {
				background.appendChild(tile);
			});

			stage.appendChild(objectActive.sprite.element.target);
		},
		next: function () {
			updateActiveObject();

			var roomActive = roomList[roomIndex];

			var children = Array.prototype.slice.call(stage.childNodes, 0);

			loadedObjects.forEach(function (object, i) {
				object.correctSprite(roomActive.width, object === objectActive ? null : objectActive);
				object.sprite.step();
				object.sprite.update();

				var x = object.sprite.x,
					y = object.sprite.y;

				var width  = object.sprite.getFrameWidth(),
					height = object.sprite.getFrameHeight();

				var hidden = x + width < 0 || x >= STAGE_WIDTH || y + height < 0 || y >= STAGE_HEIGHT;

				var target = object.sprite.element.target;

				if (hidden && contains(children, target)) {
					stage.removeChild(target); // remove hidden elements
				} else if (!hidden && !contains(children, target)) {
					stage.appendChild(target); // add visible elements
				}
			});

			var delta = Math.floor(objectActive.getDeltaWidth(2));

			var x = 0;

			if (objectActive.scroll + delta >= roomActive.width) {
				x = roomActive.width - (delta * 2);
			} else if (objectActive.scroll >= delta) {
				x = Math.floor(objectActive.scroll) - delta;
			}

			roomActive.updateTiles(x);
		},
		getContainer: function () {
			return container;
		}
	};
})();