var RichHTMLElement = (function () {
  function RichHTMLElement(element) {
    this.target = element;
  }

  RichHTMLElement.prototype.getClasses = function () {
    return this.target.className.split(/\s+/);
  };

  RichHTMLElement.prototype.hasClass = function (name) {
	return this.getClasses().indexOf(name) !== -1;
  };

  RichHTMLElement.prototype.addClass = function (name) {
	if (!this.hasClass(name)) {
	  var classes = this.getClasses();

	  classes.push(name);

	  this.target.className = classes.join(' ');
	}
  };

  RichHTMLElement.prototype.removeClass = function (name) {
	if (this.hasClass(name)) {
	  var classes = this.getClasses(),
	      index   = classes.indexOf(name);

	  classes.splice(index, 1);

	  this.target.className = classes.join(' ');
	}
  };

  return RichHTMLElement;
})();
