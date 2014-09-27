var Action = (function () {
	var _check = check.bind(null, 'Action')

	function Action(name, source, target, data) {
		this.name   = name;
		this.source = source;
		this.target = target;
		this.data   = data || null;

		_check(this.name).toBeNonBlankString();
		_check(this.source).toBe(GameObject);
		_check(this.target).toBe(GameObject);
	}

	return Action;
})();