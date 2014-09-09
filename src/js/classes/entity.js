var Entyty = (function () {
	function Entity() {
		Entity.uber.constructor.apply(this, arguments);
	}

	inherits(Entity, DynamicObject);

	return Entity;
})();