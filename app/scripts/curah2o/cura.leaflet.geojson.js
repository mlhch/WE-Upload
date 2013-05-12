(function(window, document, undefined) {

	var waterIcon = L.divIcon({
		iconSize: false, // use css defined size
		className: 'icon-tint',
		iconAnchor: [10, 2]
	});

	var lastLayer;
	var locations;

	Cura.GeoJSON = L.GeoJSON.extend({
		allLayers: [],

		initialize: function(geojson, options) {
			L.GeoJSON.prototype.initialize.apply(this, arguments);

			for (var key in this._layers) {
				this.allLayers.push(this._layers[key]);
			}
		},
		options: {
			pointToLayer: function(featureData, latlng) {
				var marker = L.marker(latlng, {
					riseOnHover: true,
					icon: waterIcon
				});
				return marker;
			},
			// this 'layer' param is above 'marker' when geometry type is Point
			onEachFeature: function(feature, layer) {
				var p = feature.properties;
				var c = feature.geometry.coordinates;
				layer.bindPopup(['<strong>' + p.station_name + '(' + p.location_id + ')</strong>',
					'<br />[ ' + c[0] + ', ' + c[1] + ' ]',
					'<br />' + p.watershed_name].join(''));
				layer.on('click', this.highlightIcon);
				layer.on('click', this.onFeatureClick); // need layer to be the future 'this'
			},
			highlightIcon: function() {
				if (lastLayer) {
					lastLayer.options.riseOnHover = true;
					lastLayer._icon.className = lastLayer._icon.className.replace(' highlighted', '');
					lastLayer._resetZIndex();
					L.DomEvent.on(lastLayer._icon, 'mouseover', lastLayer._bringToFront, lastLayer)
					L.DomEvent.on(lastLayer._icon, 'mouseout', lastLayer._resetZIndex, lastLayer);
				}

				this.options.riseOnHover = false;
				this._icon.className = this._icon.className + ' highlighted';
				this._bringToFront();
				L.DomEvent.off(this._icon, 'mouseover', this._bringToFront)
				L.DomEvent.off(this._icon, 'mouseout', this._resetZIndex);

				lastLayer = this;
			},
			onFeatureClick: function() {}
		},

		locations: function() {
			if (locations) {
				return locations;
			}

			var map = {};
			this.eachLayer(function(layer) {
				var key = layer.feature.properties.watershed_name;
				map[key] ? map[key]++ : (map[key] = 1)
			});

			locations = [{
				id: "",
				watershed_name: " - Select community group - "
			}, {
				id: 0,
				watershed_name: "View All"
			}];

			var i = 1;
			for (var key in map) {
				locations.push({
					id: i++,
					watershed_name: key,
					total: map[key]
				})
			}

			return locations;
		},

		doFilter: function(options) {
			if (options && options.featureId) {
				var filters = [this.filters.byFeatureId];
				this.doFilterFeatures(filters, options);
			} else {
				var filters = [this.filters.searchText, this.filters.byCommunityGroup];
				this.doFilterFeatures(filters, options);
				this.doFilterIcons(filters, options);
			}
		},

		features: [],
		doFilterFeatures: function(filters, options) {
			this.features.splice(0);
			this.allLayers.forEach(function(layer) {
				if (filters.every(function(fn) {
					return fn.call(this, layer.feature, options);
				}, this)) {
					this.features.push(layer.feature);
				}
			}, this);
		},

		doFilterIcons: function(filters, options) {
			this.clearLayers();
			this.allLayers.forEach(function(layer) {
				if (filters.every(function(fn) {
					return fn.call(this, layer.feature, options);
				}, this)) {
					this.addLayer(layer);
				}
			}, this);
		},

		filters: {
			byFeatureId: function(feature, options) {
				return feature.id == options.featureId;
			},
			searchText: function(feature, options) {
				var s = options.searchText || '';
				return s == '' || feature.properties.station_name.toLowerCase().indexOf(s) != -1;
			},
			byCommunityGroup: function(feature, options) {
				var groupId = typeof options.groupId == 'undefined' ? '' : options.groupId;
				if (groupId === "") {
					return true;
				} else if (groupId === 0) {
					return true;
				} else {
					var watershed_name = "";
					locations.every(function(value) {
						if (value.id == groupId) {
							watershed_name = value.watershed_name;
							return false;
						}
						return true;
					}, this);
					return feature.properties.watershed_name == watershed_name;
				}
			}
		},
	});

	Cura.geoJson = function(geojson, options) {
		return new Cura.GeoJSON(geojson, options);
	};
}(this, document));