var ActionObject = (function () {
	function ActionObject(sprite, vStep, vMax, scroll, bound, actions) {
		ActionObject.super.constructor.apply(this, arguments)
	}

	extend(ActionObject, GameObject);
	
	return ActionObject;
})();