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


	var waterIcon = L.divIcon({
		iconSize: false, // use css defined size
		className: 'icon-tint',
		iconAnchor: [5, 2]
	});

	Cura.GeoJSON = L.GeoJSON.extend({
		options: {
			pointToLayer: function(featureData, latlng) {
				var marker = L.marker(latlng, {
					icon: waterIcon
				});
				return marker;
			},
			onEachFeature: function(feature, layer) {
				var p = feature.properties;
				var c = feature.geometry.coordinates;
				layer.bindPopup(['<strong>' + p.station_name + '(' + p.location_id + ')</strong>',
					'<br />[ ' + c[0] + ', ' + c[1] + ' ]',
					'<br />' + p.watershed_name].join(''));
				layer.on('click', this.onFeatureClick);
			},
			onFeatureClick: function() {}
		},
	});

	Cura.geoJson = function(geojson, options) {
		return new Cura.GeoJSON(geojson, options);
	};
}(this, document));