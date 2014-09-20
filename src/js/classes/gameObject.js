var GameObject = (function () {
	var STAGE_WIDTH  = 320,
		STAGE_HEIGHT = 112,
		FLOOR_OFFSET = 6;

	function validateDisabled(value) {
		if (!isBoolean(value)) {
			throw new Error('disabled value should be a boolean');
		}
	}

	function validateScroll(value) {
		if (!isNumber(value)) {
			throw new Error('scroll value should be a number');
		} else if (value < 0) {
			throw new Error('scroll value cannot be lower than 0');
		}
	}

	function validateHitWidth(value) {
		if (!isInt(value)) {
			throw new Error('hit width should be an integer');
		} else if (value < 0) {
			throw new Error('hit width cannot be lower than 0');
		}
	}

	function validateActionListener(name, callback) {
		if (!isValidString(name)) {
			throw new Error('action receiver should have a valid name');
		}

		if (!isFunction(callback)) {
			throw new Error('action callback should be a function');
		}
	}

	function GameObject(sprite, scroll, hitWidth, disabled) {
		this.sprite   = sprite;
		this.scroll   = scroll || 0;
		this.disabled = disabled || false;

		check(this.sprite).shouldBe(SpriteSheet);

		validateDisabled(this.disabled);
		validateScroll(this.scroll);

		hitWidth = hitWidth || 0;

		validateHitWidth(hitWidth);

		var listeneres = {};

		this.getHitWidth = function () {
			return !hitWidth
				? Math.floor(this.sprite.getFrameWidth() / 2)
				: hitWidth;
		};

		this.addActionListener = function (name, callback) {
			validateActionListener(name, callback);

			if (listeneres[name] !== undefined) {
				console.warn('a receiver with name "' + name + '" already exists, overwriting');
			}

			listeneres[name] = callback;
		};

		this.receiveAction = function (action) {
			if (!this.disabled) {
				check(action).shouldBe(Action);

				var callback = listeneres[action.name];

				callback
					? callback(action)
					: console.warn('Couldn\'t find an action listener for "' + action.name + '"');
			}
		};

		this.getDeltaWidth = function (k) {
			k = k || 1;

			return (STAGE_WIDTH / k) - Math.ceil(this.sprite.getFrameWidth() / k);
		};

		this.getDeltaHeight = function (k) {
			k = k || 1;

			return (STAGE_HEIGHT / k) - Math.ceil(this.sprite.getFrameHeight() / k) - FLOOR_OFFSET;
		};
	}

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

		var rightmost = Math.floor(this.scroll + this.getDeltaWidth() - length) - 1, // correct missing pixel
			leftmost  = Math.floor(this.scroll);

		if (relative) { // object provided, position sprite relative to it
			if (!relative.leftCornerReached() && !relative.rightCornerReached(length)) {
				this.sprite.x = this.getDeltaWidth(2) - Math.floor(relative.scroll - this.scroll);
			} else {
				this.sprite.x = relative.rightCornerReached(length) ? rightmost : leftmost;
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

	GameObject.prototype.createAction = function (name) {
		if (!isValidString(name)) {
			throw new Error('action should have a name');
		}

		return new Action(name, this);
	};

	return GameObject;
})();