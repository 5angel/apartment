var stage = (function () {
	var roomIndex = 0;

	var loadedObjects = [],
		objectActive  = null;

	var container = document.createElement('div');

	return {
		load: function (level) {
			
		},
		getContainer: function () {
			return container;
		}
	};
})();