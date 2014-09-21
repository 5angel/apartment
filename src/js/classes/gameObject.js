var GameObject = (function () {
	var STAGE_WIDTH  = 320,
		STAGE_HEIGHT = 112,
		FLOOR_OFFSET = 6;

	var _check = check.bind(null, 'GameObject');

	function addActionListener(listeneres, name, callback) {
		_check(name, 'action listener name').toBeNonBlankString();
		_check(callback, 'action callback').toBeFunction();

		if (listeneres[name] !== undefined) {
			console.warn('a receiver with name "' + name + '" already exists, overwriting');
		}

		listeneres[name] = callback;
	}

	function receiveAction(listeneres, action) {
		if (!this.disabled) {
			_check(action).toBe(Action);

			var callback = listeneres[action.name];

			callback
				? callback(action)
				: console.warn('Couldn\'t find an action listener for "' + action.name + '"');
		}
	}

	function GameObject(name, sprite, scroll, hitWidth, disabled) {
		this.name     = name;
		this.sprite   = sprite;
		this.scroll   = scroll || 0;
		this.hitWidth = hitWidth || 0;
		this.disabled = disabled || false;

		_check(this.name, 'name').toBeNonBlankString();
		_check(this.sprite).toBe(SpriteSheet);
		_check(this.scroll, 'scroll').toBePositiveInt();
		_check(this.hitWidth, 'hit width').toBePositiveInt();
		_check(this.disabled, 'disabled').toBeBoolean();

		var listeneres = {};

		this.addActionListener = addActionListener.bind(this, listeneres);
		this.receiveAction     = receiveAction.bind(this, listeneres);
	}

	GameObject.prototype.getHitWidth = function () {
		return !this.hitWidth
			? Math.floor(this.sprite.getFrameWidth() / 2)
			: this.hitWidth;
	};

	GameObject.prototype.getDeltaWidth = function (k) {
		k = k || 1;

		return (STAGE_WIDTH / k) - Math.ceil(this.sprite.getFrameWidth() / k);
	};

	GameObject.prototype.getDeltaHeight = function (k) {
		k = k || 1;

		return (STAGE_HEIGHT / k) - Math.ceil(this.sprite.getFrameHeight() / k) - FLOOR_OFFSET;
	};

	GameObject.prototype.leftCornerReached = function () {
	  return this.scroll < this.getDeltaWidth(2);
	};

	GameObject.prototype.rightCornerReached = function (length) {
		return this.scroll + this.getDeltaWidth(2) >= length;
	};

	GameObject.prototype.correctSprite = function (length, relative) {
		if (relative !== null && !(relative instanceof GameObject))	{
			throw new Error('invalid relative object');
		}

		this.sprite.y = this.getDeltaHeight();

		var rightmost = Math.floor(this.scroll + this.getDeltaWidth() - length),
			leftmost  = Math.floor(this.scroll);

		if (relative) { // object provided, position sprite relative to it
			if (!relative.leftCornerReached() && !relative.rightCornerReached(length)) {
				this.sprite.x = this.getDeltaWidth(2) - Math.floor(relative.scroll - this.scroll);
			} else {
				this.sprite.x = relative.rightCornerReached(length) ? rightmost + 1 : leftmost - 1; // correct missing pixel
			}
		} else { // no object provided, position sprite relative to bounds
			if (!this.leftCornerReached() && !this.rightCornerReached(length)) {
				this.sprite.x = this.getDeltaWidth(2); // center sprite
			} else {
				this.sprite.x = this.rightCornerReached(length) ? rightmost : leftmost;
			}
		}

		this.sprite.update();
	};

	GameObject.prototype.createAction = function (name, target) {
		if (!isValidString(name)) {
			throw new Error('action to have a name');
		}

		return new Action(name, this, target);
	};

	return GameObject;
})();