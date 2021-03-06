var DynamicObject = (function () {
	'use strict';

	var FRICTION = .6;
	var VELOCITY_STEP_DEFAULT = .4,
		VELOCITY_MAX_DEFAULT  = 3;

	function checkVelocity(v) {
		if (!isNumber(v.step)) {
			throw new Error('velocity with invalid step"');
		} else if (!isNumber(v.step)) {
			throw new Error('velocity with invalid maximum"');
		}
	}

	function DynamicObject(name, sprite, scroll, hitWidth, vStep, vMax) {
		DynamicObject.superclass.constructor.apply(this, [name, sprite, scroll, hitWidth, false]);

		this.velocity = {
			step: vStep || VELOCITY_STEP_DEFAULT,
			max:  vMax  || VELOCITY_MAX_DEFAULT,
			value: 0
		};

		checkVelocity(this.velocity)
	}

	inherits(DynamicObject, GameObject);

	DynamicObject.prototype.correctPosition = function () {
		var bounded = DynamicObject.superclass.correctPosition.apply(this, arguments);

		if (bounded) {
			this.velocity.value = 0;
		}
	};

	DynamicObject.prototype.pull = function (k, value) {
		k = k || 1;
		value = value || this.velocity.step;

		if (!isNumber(k)) {
			throw new Error('pull with invalid factor"');
		} else if (!isNumber(value)) {
			throw new Error('pull with invalid value"');
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

		this.correctAnimation();
	};

    DynamicObject.prototype.wait = function () {
		this.velocity.value *= FRICTION;

		if (Math.abs(this.velocity.value) < .1) {
			this.velocity.value = 0;
		}

		this.scroll -= this.velocity.value;

		this.correctAnimation();
    };

    DynamicObject.prototype.correctAnimation = function () {
		var previous = this.sprite.animation;

		if (Math.abs(this.velocity.value) <  1 && this.sprite.animation === 'walk') {
			this.sprite.animation = 'idle';
		}

		if (Math.abs(this.velocity.value) >= 1 && this.sprite.animation === 'idle') {
			this.sprite.animation = 'walk';
		}

		if (previous != this.sprite.animation) {
			this.sprite.redraw();
		}
    };

	return DynamicObject;
})();