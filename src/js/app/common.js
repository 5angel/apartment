function isDefined(object) {
	return object !== undefined;
}

function isBoolean(value) {
	return value === false || value === true;
}

function isArray(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
}

function isNumber(n) {
	return typeof n === 'number' && !isNaN(parseFloat(n)) && isFinite(n);
}

function isInt(n) {
	return typeof n === 'number' && n % 1 == 0;
}

function isValidString(str) {
	return typeof str === 'string' && str !== '';
}

function isFunction(func) {
	return func && new Object().toString.call(func) === '[object Function]';
}

function parseBoolean(str) {
	if (str === 'true') {
		return true;
	} else if (str === 'false') {
		return false;
	}

	return null;
}

function toCapital(str) {
	if (!isValidString(str)) {
		return str;
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str) {
	if (!isValidString(str) || str.indexOf('-') === -1) {
		return str;
	}

	var parts = str.split('-');

	return parts[0] + parts.slice(1).map(toCapital).join('');
}

function toArray(object) {
	return Array.prototype.slice.call(object);
}

function contains(array) {
  if (!isArray(array) || arguments.length < 2) {
	return false;
  }
 
  var items = toArray(arguments).slice(1);
 
  return items.every(function (item) {
	return array.indexOf(item) !== -1;
  });
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