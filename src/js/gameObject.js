var GameObject = (function () {
  var STAGE_WIDTH   = 320,
	  STAGE_HEIGHT  = 112,
	  FLOOR_OFFSET  = 6
  var FRICTION = .6;
  var VELOCITY_STEP_DEFAULT = .4,
      VELOCITY_MAX_DEFAULT  = 3;
  var BOUND_MAX = 9007199254740992;

  function GameObject(sprite, vstep, vmax, scroll, bound) {
  	console.log(arguments)
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

	  if ((k < 0 && sprite.flipped) || (k > 0 && !sprite.flipped)) {
	    sprite.flip();
      }

      if (scroll < 0 || scroll > bound) {
	    scroll = Math.min(bound, Math.max(0, scroll));
	    velocity = 0;
	  }

	  correctAnimation();
    }

    function correctAnimation() {
	  if (Math.abs(velocity) <  1 && sprite.animation === 'walk') {
	    sprite.animation = 'idle';
      }

	  if (Math.abs(velocity) >= 1 && sprite.animation === 'idle') {
	    sprite.animation = 'walk';
      }

	  sprite.redraw();
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
	  return (STAGE_WIDTH / 2) - (sprite.getDimensions().width / 2)
	};

	this.leftCornerReached = function () {
	  return scroll < this.getDelta();
	};

	this.rightCornerReached = function () {
	  return scroll + this.getDelta() >= bound;
	};

	this.correctPosition = function (relative) {
      if (relative !== null && !(relative instanceof GameObject))	{
	    throw new Error('invalid relative object');
	  }

	  var x = sprite.x,
	      y = sprite.y;
	  
	  var dimensions = sprite.getDimensions();

	  y = STAGE_HEIGHT - dimensions.height - FLOOR_OFFSET;

	  var right = Math.floor(scroll - bound + STAGE_WIDTH - dimensions.width) - 1, // correct missing pixel
	      left  = Math.floor(scroll);

	  if (relative) { // object provided, position sprite relative to it
	    var _scroll = relative.getScroll();

		if (!relative.leftCornerReached() && !relative.rightCornerReached()) {
		  x = (STAGE_WIDTH / 2) - Math.ceil(dimensions.width / 2) - Math.floor(_scroll - scroll);
		} else {
		  x = relative.rightCornerReached() ? right : left;
		}
	  } else { // no object provided, position sprite relative to bounds
	    if (!this.leftCornerReached() && !this.rightCornerReached()) {
	      x = this.getDelta(); // center sprite
	    } else {
	      x = this.rightCornerReached() ? right : left;
	    }
	  }
	  
	  sprite.x = x;
	  sprite.y = y;

	  sprite.update();
	};
  }

  return GameObject;
})();