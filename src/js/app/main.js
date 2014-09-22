(function () {
	var FRAME_STEP = 80;

	var OBJECT_TYPE_ACCEPTED = [GameObject, DynamicObject],
	    OBJECT_TYPE_DEFAULT  = OBJECT_TYPE_ACCEPTED[0];

	var ACTION_TYPE_ACCEPTED = ['level'];

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
					scroll: 40,
					disabled: true
				},
				{
					sprite: 'door',
					scroll: 400,
					actions: {
						interact: {
							type: 'level',
							index: 1
						}
					}
				},
				{
					sprite: 'door',
					scroll: 780,
					disabled: true
				}
			]
		},
		{
			width: 320,
			objects: [
				{
					sprite: 'door',
					scroll: 160
				}
			]
		}
	];

	document.body.appendChild(gameScreen.getContainer());

	function parseActionCallback(scheme) {
		var _check = check.bind(null, 'Parse action callback');
	
		_check(scheme.type, 'type').toBePresentIn(ACTION_TYPE_ACCEPTED);

		switch (scheme.type) {
			case 'level':
				return function (action) {
					var index  = scheme.index  || 0,
						scroll = scheme.scroll || 0;
				
					_check(index, 'index').toBePositiveInt();
					_check(scroll, 'scroll').toBePositiveInt();

					gameScreen.change(index, scroll);
					
					console.log('It works!', scheme, action);
				};
				break;
		}
	}

	function parseLevel(scheme) {
		var _check = check.bind(null, 'Parse level');

		var namesUsed = [];

		return scheme.map(function (room, i) {
			var objects = [];

			if (room.objects) {
				_check(room.objects).toBeArray();
			
				objects = room.objects.map(function (object, i) {
					var type   = object.type || OBJECT_TYPE_DEFAULT,
						name   = object.name || '#' + i.toString(),
						sprite = SPRITES[object.sprite] || SPRITES.hero;

					check('Parse function', type).toBePresentIn(OBJECT_TYPE_ACCEPTED);

					var parsed = new GameObject(name, sprite.clone(), object.scroll, object.width, object.disabled);

					for (var prop in object.actions) {
						parsed.addActionListener(prop, parseActionCallback(object.actions[prop]));
					}

					return parsed;
				});
			}

			return new Room(room.name || ROOM_NAME_DEFAULT, room.type, room.width, room.depth, objects)
		});
	}

	var player = new DynamicObject('hero', SPRITES.hero.clone(), 0, 8, false),
		rooms  = parseLevel(SCHEME);

	gameScreen.load(rooms, player, 740);

	setInterval(gameScreen.next, FRAME_STEP);
})();