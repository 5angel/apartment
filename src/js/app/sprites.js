var SPRITES = {};

SPRITES.hero = new SpriteSheet('hero')
	.addAnimation('idle', new Animation({ width: 37, height: 72 }))
	.addAnimation('walk', new Animation({ x: 37, width: 37, height: 72, length: 16 }));

SPRITES.door = new SpriteSheet('door', 0, -10)
	.addAnimation('idle', new Animation({ width: 40, height: 80 }));