var Level = (function () {
	function Level(options) {
		this.rooms = Array.prototype.slice.call(arguments).slice(1);

		check.should.room.list(this.rooms);
	}

	return Level;
})();