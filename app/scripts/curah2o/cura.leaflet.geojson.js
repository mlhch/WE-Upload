(function(window, document, undefined) {

	var waterIcon = L.divIcon({
		iconSize: false, // use css defined size
		className: 'icon-tint',
		iconAnchor: [10, 2]
	});

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

				var startDate = new Date(Date.parse(p.startDate));
				startDate = jQuery.datepicker.formatDate('mm/dd/yy', startDate);
				var endDate = new Date(Date.parse(p.endDate));
				endDate = jQuery.datepicker.formatDate('mm/dd/yy', endDate);

				layer.bindPopup(['<strong>' + p.station_name + '(' + p.location_id + ')</strong>',
					'<br />[ ' + c[1] + ', ' + c[0] + ' ]',
					'<br />' + p.watershed_name,
					'<br />' + startDate + ' - ' + endDate].join(''));
				layer.on('click', this.onFeatureClick); // need layer to be the future 'this'
			},
			onFeatureClick: function() {}
		},

		doFilter: function(options) {
			if (options && options.featureIds && Object.keys(options.featureIds).length != 0) {
				var filters = [this.filters.byFeatureIds];
				this.doFilterRows(filters, options);
			} else {
				var filters = [
				this.filters.searchText,
				this.filters.byCommunityGroup,
				this.filters.byStartDate,
				this.filters.byEndDate //
				];
				this.doFilterRows(filters, options);
				this.doFilterIcons(filters, options);
			}
		},

		filteredRows: [],
		doFilterRows: function(filters, options) {
			this.filteredRows.splice(0);
			this.allLayers.forEach(function(layer) {
				if (filters.every(function(fn) {
					return fn.call(this, layer.feature, options);
				}, this)) {
					this.filteredRows.push(layer);
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
			byFeatureIds: function(feature, options) {
				return options.featureIds[feature.id];
			},
			searchText: function(feature, options) {
				var s = options.searchText || '';
				return s == '' || feature.properties.station_name.toLowerCase().indexOf(s) != -1;
			},
			byCommunityGroup: function(feature, options) {
				var location = options.location;
				if (location.id === "") {
					return true;
				} else if (location.id === 0) {
					return true;
				} else {
					return feature.properties.watershed_name == location.watershed_name;
				}
			},
			byStartDate: function(feature, options) {
				return !options.startDate || Date.parse(feature.properties.datetime) >= Date.parse(options.startDate);
			},
			byEndDate: function(feature, options) {
				return !options.endDate || Date.parse(feature.properties.datetime) <= Date.parse(options.endDate);
			},
		},

		highlightedLayers: [],
		highlightedClass: function(layer) {
			return this.highlightedLayers.every(function(l) {
				return l != layer
			}) ? '' : 'highlight';
		},

		/**
		 * Click table row to highlight
		 */
		highlightLayer: function(layer, $event) {
			var layers = this.highlightedLayers;
			if (!$event.metaKey && !$event.ctrlKey) {
				layers.forEach(function(layer) {
					this.unHighlight(layer);
				}, this);
				layers.splice(0);
			}

			layer.openPopup();
			this.highlight(layer);

			layers.push(layer);
		},
		highlight: function(layer) {
			layer.options.riseOnHover = false;
			layer._icon.className = layer._icon.className + ' highlighted';
			layer._bringToFront();
			L.DomEvent.off(layer._icon, 'mouseover', layer._bringToFront)
			L.DomEvent.off(layer._icon, 'mouseout', layer._resetZIndex);
		},
		unHighlight: function(layer) {
			layer.options.riseOnHover = true;
			if (layer._icon) {
				layer._icon.className = layer._icon.className.replace(' highlighted', '');
				layer._resetZIndex();
				L.DomEvent.on(layer._icon, 'mouseover', layer._bringToFront, layer)
				L.DomEvent.on(layer._icon, 'mouseout', layer._resetZIndex, layer);
			}
		},
		unHighlightAll: function() {
			this.highlightedLayers.splice(0);
		},
	});


	Cura.geoJson = function(geojson, options) {
		return new Cura.GeoJSON(geojson, options);
	};
}(this, document));