<?php
function cura_phase2_js_and_css() {
	$src = CURAH2O_PLUGIN_URL . 'app/styles/main.css';
	wp_register_style('cura-app-main-style', $src);
	wp_enqueue_style('cura-app-main-style');

	$src = CURAH2O_PLUGIN_URL . 'app/styles/leaflet.css';
	wp_register_style('cura-app-leaflet-style', $src);
	wp_enqueue_style('cura-app-leaflet-style');

	$src = CURAH2O_PLUGIN_URL . 'app/styles/leaflet.awesome-markers.css';
	wp_register_style('cura-app-leaflet-awesome-markers-style', $src);
	wp_enqueue_style('cura-app-leaflet-awesome-markers-style');

	$src = CURAH2O_PLUGIN_URL . 'app/styles/MarkerCluster.Default.css';
	wp_register_style('cura-app-leaflet-mc-default-style', $src);
	wp_enqueue_style('cura-app-leaflet-mc-default-style');

	$src = CURAH2O_PLUGIN_URL . 'app/styles/MarkerCluster.css';
	wp_register_style('cura-app-leaflet-mc-style', $src);
	wp_enqueue_style('cura-app-leaflet-mc-style');
	
	$src = CURAH2O_PLUGIN_URL . 'app/styles/font-awesome.min.css';
	wp_register_style('cura-app-font-awesome-style', $src);
	wp_enqueue_style('cura-app-font-awesome-style');

	$src = CURAH2O_PLUGIN_URL . 'app/styles/maki-sprite.css';
	wp_register_style('cura-app-maki-sprite-style', $src);
	wp_enqueue_style('cura-app-maki-sprite-style');
}
