(function () {
	var FRAME_STEP = 80;

	var body = new RichHTMLElement(document.body);

	body.append(gameScreen.getContainer());

	var player = new DynamicObject('hero', SPRITES.hero.clone(), 0, 8, false),
		level  = XMLHelper.parse(XML_CONFIG);

	gameScreen.start();
})();