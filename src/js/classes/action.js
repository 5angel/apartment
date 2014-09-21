var Action = (function () {

	var _check = check.bind(null, 'Action')

	function Action(name, source, target, data) {
		this.name   = name;
		this.source = source;
		this.target = target;
		this.data   = data || null;

		_check(name).toBeNonBlankString();
		_check(source).toBe(GameObject);
		_check(target).toBe(GameObject);
	}

	return Action;
})();