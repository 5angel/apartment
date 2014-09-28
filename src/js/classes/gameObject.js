var GameObject = (function () {
	var STAGE_WIDTH  = 320,
		STAGE_HEIGHT = 112,
		FLOOR_OFFSET = 6;

	var _check = check.bind(null, 'GameObject');

	function addActionListener(listeneres, name, callback) {
		_check(name, 'action listener name').toBeNonBlankString();
		_check(callback, 'action callback').toBeFunction();

		var source = listeneres[name];

		source !== undefined
			? source.push(callback)
			: source = [callback];

		listeneres[name] = source;
	}

	function receiveAction(listeneres, action) {
		var source = listeneres[action.name];

		function wrapCallback(index) {
			var callback = source[index];

			return function () {
				if (index < source.length) {
					callback(action, wrapCallback(index + 1))
				}
			};
		}

		if (!this.disabled) {
			_check(action).toBe(Action);

			var callback = source[0];

			if (source !== undefined) {
				if (source.length > 1) {
					callback(action, wrapCallback(1));
				} else {
					callback(action);
				}
			} else {
				console.warn('Couldn\'t find an action listener for "' + action.name + '"');
			}
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

	GameObject.prototype.getDeltaWidth = function () {
		return (STAGE_WIDTH / 2) - Math.ceil(this.sprite.getFrameWidth() / 2);
	};

	GameObject.prototype.getDeltaHeight = function () {
		return (STAGE_HEIGHT / 2) - Math.ceil(this.sprite.getFrameHeight() / 2);
	};

	GameObject.prototype.leftCornerReached = function () {
	  return this.scroll < STAGE_WIDTH / 2;
	};

	GameObject.prototype.rightCornerReached = function (length) {
		return this.scroll > length - STAGE_WIDTH / 2;
	};

	GameObject.prototype.correctPosition = function (length, relative) {
		if (relative) {
			_check(relative).toBe(GameObject);
		}

		var bounded = false;

		var offset = this.getHitWidth();

		if ((this.scroll < offset + 1) || (this.scroll > this.bound - offset)) {
			bounded = true;

			this.scroll = Math.min(this.bound - offset, Math.max(offset + 1, this.scroll));
		}

		this.sprite.y = STAGE_HEIGHT - this.sprite.getFrameHeight() - FLOOR_OFFSET;

		var rightmost = Math.floor(this.scroll) - length + STAGE_WIDTH - Math.ceil(this.sprite.getFrameWidth() / 2),
			leftmost  = Math.floor(this.scroll) - Math.ceil(this.sprite.getFrameWidth() / 2);

		if (relative) {
			if (!relative.leftCornerReached() && !relative.rightCornerReached(length)) {
				this.sprite.x = this.getDeltaWidth() - Math.floor(relative.scroll - this.scroll);
			} else {
				this.sprite.x = relative.rightCornerReached(length) ? rightmost : leftmost; // correct missing pixel
			}
		} else {
			if (!this.leftCornerReached() && !this.rightCornerReached(length)) {
				this.sprite.x = this.getDeltaWidth(); // center sprite
			} else {
				this.sprite.x = this.rightCornerReached(length) ? rightmost : leftmost;
			}
		}

		this.sprite.update();

		return bounded;
	};

	GameObject.prototype.createAction = function (name, target) {
		_check(name, 'name').toBeNonBlankString();

		return new Action(name, this, target);
	};

	return GameObject;
})();