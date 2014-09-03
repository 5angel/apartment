var GameObject = (function () {
  var STAGE_WIDTH   = 320,
	  STAGE_HEIGHT  = 112,
	  FLOOR_OFFSET  = 6
  var FRICTION = .6;
  var VELOCITY_STEP_DEFAULT = .4,
      VELOCITY_MAX_DEFAULT  = 3;
  var BOUND_MAX = 9007199254740992;

  function GameObject(sprite, vstep, vmax, scroll, bound) {
    if (sprite instanceof SpriteSheet === false) {
	  throw new Error('Please provide a sprite!');
	}

    vstep  = vstep  || VELOCITY_STEP_DEFAULT;
    vmax   = vmax   || VELOCITY_MAX_DEFAULT;
    scroll = scroll || 0;
    bound  = bound  || BOUND_MAX;

    if (!isNumber(scroll)) {
	  throw new Error('GameObject with invalid starting scroll!');
	} else if (scroll < 0) {
	  throw new Error('GameObject scroll cannot be lower than 0!');
	}

    if (!isNumber(vstep) || !isNumber(vmax)) {
	  throw new Error('GameObject with invalid velocity data!');
	}

    if (!isInt(bound)) {
	  throw new Error('GameObject with invalid bound!');
	}
  
    var velocity = 0;

    function push(k, value) {
      k = k || 1;
      value = value || vstep;

      if (!isNumber(value)) {
	    throw new Error('Push with invalid value of "' + value.toString() + '"!');
	  }

	  value *= k;
	  velocity += value;
	  velocity = Math.min(vmax, Math.abs(velocity)) * (Math.abs(velocity) / (velocity || 1));
	  scroll -= velocity;

	  if ((k < 0 && sprite.isFlipped()) || (k > 0 && !sprite.isFlipped())) {
	    sprite.flip();
      }

	  correctPosition();
	  correctAnimation();
    }

    function correctPosition() {
      if (scroll < 0 || scroll > bound) {
	    scroll = Math.min(bound, Math.max(0, scroll));
	    velocity = 0;
	  }
    }

    function correctAnimation() {
	  if (Math.abs(velocity) <  1 && sprite.animation() === 'walk') {
	    sprite.animation('idle');
      }

	  if (Math.abs(velocity) >= 1 && sprite.animation() === 'idle') {
	    sprite.animation('walk');
      }
    }
  
    this.getSprite = function () {
	  return sprite;
	};

    this.getScroll = function () {
	  return scroll;
	};

    this.getVelocity = function () {
	  return velocity;
	};

    this.setBound = function (value) {
      if (!isInt(bound)) {
	    throw new Error('Bound should be integer!');
	  }

	  bound = value;
    };

    this.pushLeft  = push.bind(this, 1);
    this.pushRight = push.bind(this, -1);

    this.wait = function () {
      velocity *= FRICTION;

      if (Math.abs(velocity) < .1) {
	    velocity = 0;
	  }

	  scroll -= velocity;

	  correctAnimation();
    };

	this.getDelta = function () {
	  return (STAGE_WIDTH / 2) - (sprite.dimensions().width / 2)
	};

	this.correctPosition = function (roomWidth) {
	  var position   = sprite.position(),
	      dimensions = sprite.dimensions();

	  var spriteWidth  = dimensions.width,
	      spriteHeight = dimensions.height;

	  position.y = STAGE_HEIGHT - spriteHeight - FLOOR_OFFSET;
	
	  var delta = this.getDelta();
	
	  var toLeft  = scroll < delta,
	      toRight = scroll + delta >= roomWidth;

	  if (!toLeft && !toRight) {
	    position.x = delta;
	  } else {
	    position.x = toRight ? scroll - roomWidth + STAGE_WIDTH - spriteWidth : scroll;
	  }

	  sprite.position(position.x, position.y);
	  sprite.next();
	};
  }

  return GameObject;
})();