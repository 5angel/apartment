var Action = (function () {

	function Action(name, target, data) {
		check(target).shouldBe(GameObject);

		this.name   = name;
		this.target = target;
		this.data   = data;
	}

	return Action;
})();