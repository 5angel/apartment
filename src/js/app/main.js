(function () {
	var FRAME_STEP = 80;

	var OBJECT_TYPE_ACCEPTED = [GameObject, DynamicObject],
	    OBJECT_TYPE_DEFAULT  = OBJECT_TYPE_ACCEPTED[0];

	var ROOM_NAME_DEFAULT = 'blank';

	// define sprites
	var SPRITES = {};

	SPRITES.hero = new SpriteSheet('hero')
		.addAnimation('idle', new Animation({ width: 37, height: 72 }))
		.addAnimation('walk', new Animation({ x: 37, width: 37, height: 72, length: 16 }));

	SPRITES.door = new SpriteSheet('door', 0, -10)
		.addAnimation('idle', new Animation({ width: 40, height: 80 }));

	var SCHEME = [
		{
			width: 840,
			objects: [
				{
					sprite: 'door',
					scroll: 40
				},
				{
					sprite: 'door',
					scroll: 400
				},
				{
					sprite: 'door',
					scroll: 780,
					disabled: true
				}
			]
		}
	];

	document.body.appendChild(gameScreen.getContainer());

	function validateType(type) {
		if (!contains(OBJECT_TYPE_ACCEPTED, type)) {
			throw new Error('type "' + Checker.findNameOf(type) + '" is not accepted');
		}
	}

	function parseLevelScheme(scheme) {
		var namesUsed = [];

		return scheme.map(function (room, i) {
			var objects = room.objects.map(function (object) {
				var type   = object.type || OBJECT_TYPE_DEFAULT,
					sprite = SPRITES[object.sprite] || SPRITES.hero;

				validateType(type);

				return new GameObject(sprite.clone(), object.scroll, object.width, object.disabled);
			});

			return new Room(room.name || ROOM_NAME_DEFAULT, room.type, room.width, room.depth, objects)
		});
	}

	var player = new DynamicObject(SPRITES.hero.clone(), 740, 8),
		rooms  = parseLevelScheme(SCHEME);

	gameScreen.load(rooms, player);

	setInterval(gameScreen.next, FRAME_STEP);
})();