function isArray(obj) { return Object.prototype.toString.call(obj) === '[object Array]' }

function isNumber(n) { return !isNaN(parseFloat(n)) && isFinite(n) }

function isInt(n) { return typeof n === 'number' && n % 1 == 0 }

function isValidString(str) { return typeof str === 'string' && str !== '' }

function contains(array) {
  if (arguments.length < 2) { throw new Error('Nothing to search for!') }
  var args = Array.prototype.slice.call(arguments).slice(1);
  return args.every(function (item) { return array.indexOf(item) !== -1 });
}

function inherits(Child, Parent) {
	var F = function () {};
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;
}

function copy(source, target) {
	target = target || {};

	for (var prop in source) {
		target[prop] = typeof source[prop] === 'object'
			? copy(target[prop], source[prop])
			: target[prop] = source[prop];
	}

	return target;
}