var RichHTMLElement = (function () {
	var _check = check.bind(null, 'RichHTMLElement');

	function isRich(element) {
		return _check(element).is(RichHTMLElement);
	}

	function toRich(element) {
		return new RichHTMLElement(element);
	}

	function toHTML(element) {
		return isRich(element) ? element.source : element;
	}

	function RichHTMLElement(element) {
		if (isValidString(element)) {
			element = document.createElement(element);
		}

		_check(element, 'element').toBe(HTMLElement);

		this.source = element;
	}

	RichHTMLElement.prototype.attr = function (name, value) {
		this.source.setAttribute(name, value);

		return this;
	};

	RichHTMLElement.prototype.append = function (element) {
		this.source.appendChild(toHTML(element));

		return this;
	};

	RichHTMLElement.prototype.prepend = function (element) {
		var first  = this.source.firstChild;

		first ? this.source.insertBefore(toHTML(element), first) : this.append(element);

		return this;
	};

	RichHTMLElement.prototype.remove = function (element) {
		this.source.removeChild(isRich(element) ? element.source : element);

		return this;
	};

	RichHTMLElement.prototype.children = function () {
		return Array.prototype.slice.call(this.source.childNodes, 0).map(toRich);
	};
 
	RichHTMLElement.prototype.getClasses = function () {
		return this.source.className.split(/\s+/);
	};

	RichHTMLElement.prototype.hasClass = function (name) {
		return this.getClasses().indexOf(name) !== -1;
	};

	RichHTMLElement.prototype.addClass = function (name) {
		if (!this.hasClass(name)) {
			var classes = this.getClasses();

			classes.push(name);

			this.source.className = classes.join(' ');
		}

		return this;
	};

	RichHTMLElement.prototype.removeClass = function (name) {
		if (this.hasClass(name)) {
			var classes = this.getClasses(),
				index   = classes.indexOf(name);

			classes.splice(index, 1);

			this.source.className = classes.join(' ');
		}

		return this;
	};

	return RichHTMLElement;
})();
