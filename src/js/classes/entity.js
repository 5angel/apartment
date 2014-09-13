var Entyty = (function () {
	function Entity(sprite, scroll, vStep, vMax, hitWidth, actions) {
		Entity.uber.constructor.apply(this, arguments);

		this.hitWidth = hitWidth;

		if (!isInt(this.hitWidth)) {
			new Error('hit width should be an integer');
		}
	}

	inherits(Entity, DynamicObject);

	return Entity;
})();