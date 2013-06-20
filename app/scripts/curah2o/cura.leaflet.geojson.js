(function(window, document, undefined) {
	var msie = parseInt(((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]), 10);
	var firefox = parseInt(((/firefox\/(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]), 10);

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
			this.findLayerByProperties(props).forEach(function(layer) {
				delete this.allLayers[L.stamp(layer)]
				this.removeLayer(layer)
			}, this);

			if (feature.type == 'Feature') {
				this.addData([feature])
			}
		},

		doFilter: function(options) {
			console.log('geoLayer.doFilter:', options);
			this.clearLayers();
			this.highlightedLayers = {};

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
				if (allOK) {
					this.addLayer(layer);
					if (this.selectedLayers[id]) {
						this.highlight(layer);
						this.focusedLayer == layer && this.focusLayer(layer);
					}
				}
			}
		},

		fitRange: function() {
			var bounds = this.getBounds();
			if (bounds.isValid()) {
				var zoom = this._map.getBoundsZoom(bounds);
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

		focusedLayer: null,
		focusLayer: function(layer) {
			debug('fn') && console.log('geoLayer.focusLayer');
			
			this.selectLayer(layer);
			this.highlight(layer);
			this.focusedLayer = layer;
			layer.openPopup();
		},
		selectedLayers: {},
		unSelectAll: function() {
			debug('fn') && console.log('geoLayer.unSelectAll');
			this.selectedLayers = {};
		},
		selectLayer: function(layer) {
			debug('fn') && console.log('geoLayer.selectLayer', layer);
			this.selectedLayers[L.stamp(layer)] = layer;
			return this.selectedLayers;
		},
		highlightedLayers: {},
		highlightLayers: function() {
			debug('fn') && console.log('geoLayer.highlightLayers:', this.selectedLayers);
			for (var id in this.selectedLayers) {
				var layer = this.selectedLayers[id];
				// layer._map means the layer is still on the map
				if (layer._map && !this.highlightedLayers[id]) {
					this.highlight(layer);
				}
			}
			for (var id in this.highlightedLayers) {
				if (!this.selectedLayers[id]) {
					this.unHighlight(this.highlightedLayers[id]);
				}
			}
			if (this.focusedLayer && !this.selectedLayers[L.stamp(this.focusedLayer)]) {
				this.focusedLayer.closePopup();
			}
		},
		highlight: function(layer) {
			debug('fn') && console.log('geoLayer.highlight');

			layer.options.riseOnHover = false;
			layer._icon.className = layer._icon.className + ' highlighted';
			layer._bringToFront();
			L.DomEvent.off(layer._icon, 'mouseover', layer._bringToFront)
			L.DomEvent.off(layer._icon, 'mouseout', layer._resetZIndex);

			this.highlightedLayers[L.stamp(layer)] = layer;
		},
		unHighlight: function(layer) {
			debug('fn') && console.log('geoLayer.unHighlight', L.stamp(layer));

			layer.options.riseOnHover = true;
			if (layer._icon) {
				layer._icon.className = layer._icon.className.replace(/ highlighted/g, '');
				layer._resetZIndex();
				L.DomEvent.on(layer._icon, 'mouseover', layer._bringToFront, layer)
				L.DomEvent.on(layer._icon, 'mouseout', layer._resetZIndex, layer);
			}

			var id = L.stamp(layer);
			delete this.highlightedLayers[id];
			delete this.selectedLayers[id];
		},
	});


	Cura.geoJson = function(geojson, options) {
		return new Cura.GeoJSON(geojson, options);
	};
}(this, document));