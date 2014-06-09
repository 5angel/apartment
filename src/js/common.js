function addClassTo(name, el) {
  var list = el.className.split(/\s+/);
  if (list.indexOf(name) === -1) { list.push(name); }
  el.className = list.join(' ');
  return el;
}

function removeClassFrom(name, el) {
  var list  = el.className.split(/\s+/),
      index = list.indexOf(name);
  if (index !== -1) { list.splice(index, 1); }
  el.className = list.join(' ');
  return el;
}

function isArray(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; }
function isInt(n) { return typeof n === 'number' && n % 1 == 0; }
function div() { return document.createElement('div'); }

function contains(array) {
  if (arguments.length < 2) { throw new Error('Nothing to search for!'); }
  var args = Array.prototype.slice.call(arguments).slice(1);
  return args.every(function (item) { return array.indexOf(item) !== -1; });
}