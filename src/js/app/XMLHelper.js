var XMLHelper = (function () {
	var ACTION_NAMES_ACCEPTED = ['interact'],
		ACTION_NAME_DEFAULT   = ACTION_NAMES_ACCEPTED[0],
		ACTION_TYPES_ACCEPTED = ['level', 'prompt'];

	var _check = check.bind(null, 'XML Helper');

	function parseAttributes(dom) {
		return toArray(dom.attributes).reduce(function (object, node) {
			object[toCamelCase(node.name)] = node.value;

			return object;
		}, {});
	}

	function parseAction(dom) {
		var attrs = parseAttributes(dom);

		var type = attrs.type;

		_check(type, 'type').toBePresentIn(ACTION_TYPES_ACCEPTED);

		switch (type) {
			case 'level':
				var index  = isDefined(attrs.index)  ? parseFloat(attrs.index)  : 0,
					scroll = isDefined(attrs.scroll) ? parseFloat(attrs.scroll) : 0;
				
				_check(index, 'index').toBePositiveInt();
				_check(scroll, 'scroll').toBePositiveInt();

				return function (action, callback) {
					gameScreen.change(index, scroll);

					if (callback) {
						_check(callback, 'callback').toBeFunction();
					
						callback();
					}
				};
			case 'prompt':
				return function (action, callback) {
					var text = 'derp';
				
					gameScreen.prompt(text, callback);
				}
		}
	}

	function parseObject(dom, index) {
		var attrs = parseAttributes(dom);

		var name     = attrs.name || '#' + index.toString(),
			sprite   = attrs.sprite,
			scroll   = isDefined(attrs.scroll) ? parseFloat(attrs.scroll) : null,
			hitWidth = attrs.hitWidth || null,
			disabled = isDefined(attrs.disabled) ? parseBoolean(attrs.disabled) : null;

		_check(sprite, 'sprite').toBeNonBlankString();

		var sheet = SPRITES[sprite];

		var object = new GameObject(name, sheet.clone(), scroll, hitWidth, disabled);

		toArray(dom.childNodes).forEach(function (node) {
			var name = node.attributes.name.value || ACTION_NAME_DEFAULT;

			_check(name, 'name').toBePresentIn(ACTION_NAMES_ACCEPTED);
		
			object.addActionListener(name, parseAction(node));
		});

		return object;
	}

	function parseRoom(dom, index) {
		var attrs = parseAttributes(dom);

		var name  = attrs.name || '#' + index.toString(),
			type  = attrs.type || null,
			width = isDefined(attrs.width) ? parseFloat(attrs.width) : 0,
			depth = isDefined(attrs.depth) ? parseFloat(attrs.depth) : 0;

		var objects = toArray(dom.childNodes).map(parseObject);

		return new Room(name, type, width, depth, objects);
	}

	function parseLevel(dom) {
		var level = new Object();

		if (dom.attributes.spawn) {
			level.spawn = parseFloat(dom.attributes.spawn.value);
			_check(level.spawn, 'spawn').toBePositiveInt();
		}

		level.rooms = toArray(dom.childNodes).map(parseRoom);

		return level;
	}

	return {
		parse: function (str) {
			var dom;

			str = str.replace(/\t+/g,''); // clear tabulations

			if (window.DOMParser) {
				var parser = new DOMParser();
				dom = parser.parseFromString(str, 'text/xml');
			} else { // Internet Explorer
				dom = new ActiveXObject('Microsoft.XMLDOM');
				dom.async = false;
				dom.loadXML(str); 
			}

			return parseLevel(dom.getElementsByTagName('level')[0]);
		}
	};
})();