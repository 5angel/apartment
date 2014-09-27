(function () {
	var FRAME_STEP = 80;

	document.body.appendChild(gameScreen.getContainer());

	var player = new DynamicObject('hero', SPRITES.hero.clone(), 0, 8, false),
		level  = XMLHelper.parse(XML_CONFIG);

	gameScreen.load(level.rooms, level.spawn, player);

	setInterval(gameScreen.next, FRAME_STEP);
})();