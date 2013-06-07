(function(window, document, undefined) {
	var msie = parseInt(((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]),10);
	var firefox = parseInt(((/firefox\/(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]),10);

	var waterIcon = L.divIcon({
		iconSize: false, // use css defined size
		className: msie == 10 ? 'ie10 icon-tint' : firefox ? 'ff icon-tint' : 'icon-tint',
		iconAnchor: [10, 2]
	});

	Cura.GeoJSON = L.GeoJSON.extend({
		allLayers: {},

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

				layer.bindPopup(['<span class="station">' + p.station_name + '(' + p.location_id + ')</span>',
						'<span class="latlng">[ ' + c[1] + ', ' + c[0] + ' ]</span>',
						'<span class="watershed">' + p.watershed_name + '</span>',
						'<span class="daterange">' + startDate + ' - ' + endDate + '</span>'
				].join(''));
				layer.on('click', this.onFeatureClick); // need layer to be the future 'this'
			},
			onFeatureClick: function() {}
		},

		addLayer: function(layer) {
			L.GeoJSON.prototype.addLayer.apply(this, arguments);

			var id = L.stamp(layer);
			this.allLayers[id] || (this.allLayers[id] = layer);
		},

		findLayerByProperties: function(props) {
			var layers = [];
			this.eachLayer(function(layer) {
				var p = layer.feature.properties;
				var ok = true;
				for (var key in props) {
					if (p[key] != props[key]) {
						ok = false;
						break;
					}
				}
				ok && layers.push(layer);
			}, this);
			return layers;
		},

		updateLayer: function(props, feature) {
			var layers = this.findLayerByProperties(props);
			layers.forEach(function(layer) {
				this.removeLayer(layer);
			}, this);

			if (feature.type == 'Feature') {
				this.addData([feature]);
			}
		},

		doFilter: function(options) {
			this.clearLayers();
			for (var id in this.allLayers) {
				var layer = this.allLayers[id];
				var allOK = true;
				for (var key in this.filters) {
					var filter = this.filters[key];
					if (!filter.call(this, layer.feature, options)) {
						allOK = false;
						break;
					}
				}
				allOK && this.addLayer(layer);
			}

			var bounds = this.getBounds();
			if (bounds.isValid()) {
				var zoom = this._map.getBoundsZoom(bounds, (inside = true));
				this._map.setView(L.latLngBounds(bounds).getCenter(), zoom || this._map.getZoom());
			}
		},

		filters: {
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

		/**
		 * Click table row to highlight
		 */
		highlightedLayers: [],
		highlightLayer: function(layer, $event) {
			var layers = this.highlightedLayers;
			if (!$event || !$event.metaKey && !$event.ctrlKey) {
				layers.forEach(function(layer) {
					this.unHighlight(layer);
				}, this);
				layers.splice(0);
			}

			layer.openPopup();
			this.highlight(layer);

			layers.push(layer);
			return layers;
		},
		highlightLayerByProperties: function(props, $event) {
			var layers = this.findLayerByProperties(props);
			layers.forEach(function(layer) {
				this.highlightLayer(layer, $event);
			}, this);
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