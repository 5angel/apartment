var GameObject = (function () {
	var STAGE_WIDTH   = 320,
		STAGE_HEIGHT  = 112,
		FLOOR_OFFSET  = 6
	var FRICTION = .6;
	var VELOCITY_STEP_DEFAULT = .4,
		VELOCITY_MAX_DEFAULT  = 3;
	var BOUND_MAX = 9007199254740992;

	function GameObject(sprite, vStep, vMax, scroll, bound) {
		this.sprite = sprite;
		this.scroll = scroll || 0;
		this.bound  = bound || BOUND_MAX;

		this.velocity = {
			step: vStep || VELOCITY_STEP_DEFAULT,
			max:  vMax || VELOCITY_MAX_DEFAULT,
			value: 0
		};

		if (sprite instanceof SpriteSheet === false) {
			throw new Error('Please provide a sprite!');
		}

		if (!isNumber(this.scroll)) {
			throw new Error('GameObject with invalid starting scroll!');
		} else if (this.scroll < 0) {
			throw new Error('GameObject scroll cannot be lower than 0!');
		}

		if (!isInt(this.bound)) {
			throw new Error('GameObject with invalid bound!');
		}

		if (!isNumber(this.velocity.step) || !isNumber(this.velocity.max)) {
			throw new Error('GameObject with invalid velocity data!');
		}

		this.getDelta = function () {
			return (STAGE_WIDTH / 2) - (this.sprite.getDimensions().width / 2)
		};
	}

	GameObject.prototype.push = function (k, value) {
		k = k || 1;
		value = value || this.velocity.step;

		if (!isNumber(k)) {
			throw new Error('Push with invalid factor of "' + k.toString() + '"!');
		} else if (!isNumber(value)) {
			throw new Error('Push with invalid value of "' + value.toString() + '"!');
		}

		value *= k;

		var v = this.velocity;

		v.value += value;

		v.value = Math.min(v.max, Math.abs(v.value)) * (Math.abs(v.value) / (v.value || 1));
		this.scroll -= v.value;

		var flipped = this.sprite.flipped;

		if ((k < 0 && flipped) || (k > 0 && !flipped)) {
			this.sprite.flip();
		}

		if (this.scroll < 0 || this.scroll > this.bound) {
			this.scroll = Math.min(this.bound, Math.max(0, this.scroll));
			v.value = 0;
		}

		this.correctAnimation();
	};

    GameObject.prototype.wait = function () {
		this.velocity.value *= FRICTION;

		if (Math.abs(this.velocity.value) < .1) {
			this.velocity.value = 0;
		}

		this.scroll -= this.velocity.value;

		this.correctAnimation();
    };

    GameObject.prototype.correctAnimation = function () {
		if (Math.abs(this.velocity.value) <  1 && this.sprite.animation === 'walk') {
			this.sprite.animation = 'idle';
		}

		if (Math.abs(this.velocity.value) >= 1 && this.sprite.animation === 'idle') {
			this.sprite.animation = 'walk';
		}

		this.sprite.redraw();
    };

	GameObject.prototype.leftCornerReached = function () {
	  return this.scroll < this.getDelta();
	};

	GameObject.prototype.rightCornerReached = function () {
		return this.scroll + this.getDelta() >= this.bound;
	};

	GameObject.prototype.correctPosition = function (relative) {
		if (relative !== null && !(relative instanceof GameObject))	{
			throw new Error('invalid relative object');
		}

		var dimensions = this.sprite.getDimensions();

		this.sprite.y = STAGE_HEIGHT - dimensions.height - FLOOR_OFFSET;

		var right = Math.floor(this.scroll - this.bound + STAGE_WIDTH - dimensions.width) - 1, // correct missing pixel
			left  = Math.floor(this.scroll);

		if (relative) { // object provided, position sprite relative to it
			if (!relative.leftCornerReached() && !relative.rightCornerReached()) {
				this.sprite.x = (STAGE_WIDTH / 2) - Math.ceil(dimensions.width / 2) - Math.floor(relative.scroll - this.scroll);
			} else {
				this.sprite.x = relative.rightCornerReached() ? right : left;
			}
		} else { // no object provided, position sprite relative to bounds
			if (!this.leftCornerReached() && !this.rightCornerReached()) {
				this.sprite.x = this.getDelta(); // center sprite
			} else {
				this.sprite.x = this.rightCornerReached() ? right : left;
			}
		}

		this.sprite.update();
	};

	return GameObject;
})()