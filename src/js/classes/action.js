var Action = (function () {

	function Action(name, target, data) {
		check.should.object(target);

		this.name   = name;
		this.target = target;
		this.data   = data;
	}

	return Action;
})();