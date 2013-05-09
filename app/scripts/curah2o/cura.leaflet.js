(function(window, document, undefined) {
	var Cura, originalCura;

	if (typeof exports !== undefined + '') {
		Cura = exports;
	} else {
		originalCura = window.Cura;
		Cura = {};

		Cura.noConflict = function() {
			window.Cura = originalCura;
			return this;
		};

		window.Cura = Cura;
	}

	Cura.version = '0.0.1';
}(this, document));