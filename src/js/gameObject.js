function GameObject(sprite, velocity, scroll) {
  if (sprite instanceof SpriteSheet === false) { throw new Error('Please provide a sprite!') }

  var VELOCITY_OPTIONS_ALLOWED = ['step', 'max'];

  velocity = velocity || {};
  scroll   = scroll   || 0;

  for (var key in velocity) {
    if (!contains(VELOCITY_OPTIONS_ALLOWED, key)) { throw new Error('Key "' + key + '" is not allowed!') }
  }

  var FRICTION = .6;
  var VELOCITY_STEP_DEFAULT = .4,
      VELOCITY_MAX_DEFAULT  = 3;

  velocity.step  = velocity.step || VELOCITY_STEP_DEFAULT;
  velocity.max   = velocity.max  || VELOCITY_MAX_DEFAULT;

  if (!isNumber(scroll)) { throw new Error('GameObject with invalid starting scroll!') }
  else if (scroll < 0) { throw new Error('GameObject scroll cannot be lower than 0!') }

  if (!isNumber(velocity.step) || !isNumber(velocity.max)) { throw new Error('GameObject with invalid velocity data!') }

  var v = 0;

  function push(k, value) {
    k = k || 1;
    value = value || velocity.step;

    if (!isNumber(value)) { throw new Error('Push with invalid value of "' + value.toString() + '"!') }

	value *= k;
	v += value;

	if ((k < 0 && sprite.isFlipped()) || (k > 0 && !sprite.isFlipped())) { sprite.flip() }

	correct();
  }

  function correct() {
    v = Math.min(velocity.max, Math.abs(v)) * (Math.abs(v) / (v || 1));

	if (Math.abs(v) <  1 && sprite.animation() === 'walk') { sprite.animation('idle') }
	if (Math.abs(v) >= 1 && sprite.animation() === 'idle') { sprite.animation('walk') }
  }
  
  this.getSprite   = function () { return sprite };
  this.getScroll   = function () { return scroll };
  this.getVelocity = function () { return v };

  this.pushLeft  = push.curry();
  this.pushRight = push.curry(-1);

  this.wait = function () {
    v *= FRICTION;

    if (Math.abs(v) < .1) { v = 0 }

	correct();
  };
}