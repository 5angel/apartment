var PromptObject = (function () {
	var _check = check.bind(null, 'PromptObject')

	function PromptObject(text) {
		this.text    = text;
		this.element = new RichHTMLElement('div');

		_check(this.text).toBeNonBlankString();
	}

	return PromptObject;
})();