<?php
/**
 * @package Water Quality Observation
 * @version 1.0
 */
/*
Plugin Name: Water Quality Observation
Plugin URI: http://curah2o.com/wp-content/plugins/water-quality-observation
Description: This is a data-entry point, data access point and SOS endpoint. It will be used by CuraH2O field staff to create, view and export water quality observations. It will expose an SOS endpoint in order to to export data from remote SOS servers like WEHub.
Author: Ma Lian
Version: 1.0
Author URI: http://mlhch.com
*/

////////////////////////////////////////////////////////////
////////// constants and variables
////////////////////////////////////////////////////////////
define ( 'CURAH2O_VERSION', '1.0' );
define ( 'CURAH2O_PLUGIN_URL', plugin_dir_url ( __FILE__ ) );
define ( 'CURAH2O_TABLE', 'data-entry' );
define ( 'CURAH2O_TABLE_LOCATION', 'data-entry-location' );

function cura_fields() {
	static $fields;
	
	if ($fields) {
		return $fields;
	}
	
	$table = array (//
array ("field" => "location_id", "demo" => "ST 01", "description" => "Location ID", "visible" => 1 ), //
array ("field" => "station_name", "demo" => "Still River", "description" => "Station Name", "visible" => 1 ), //
array ("field" => "watershed_name", "demo" => "Sackville River Watershed", "description" => "Watershed Name", "visible" => 1 ), //
array ("field" => "datetime", "demo" => date ( "m/d/Y H:i A" ), "description" => "Date and Time", "visible" => 1 ), //
array ("field" => "gps", "demo" => "", "description" => "GPS Coordinates" ), //
array ("field" => "do_mgl", "demo" => "8.29", "description" => "DO (mg/L)" ), //
array ("field" => "do_%", "demo" => "94.1", "description" => "DO (%) " ), //
array ("field" => "cond", "demo" => "350", "description" => "Cond. (µS/cm) or (mS/cm) " ), //
array ("field" => "salinity", "demo" => "0.01", "description" => "Salinity (ppt)" ), //
array ("field" => "temp", "demo" => "16.23", "description" => "Temp. (⁰C)" ), //
array ("field" => "ph", "demo" => "6.15", "description" => "pH" ), //
array ("field" => "secchi_a", "demo" => "3.19", "description" => "Secchi Disc Reading A" ), //
array ("field" => "secchi_b", "demo" => "3.55", "description" => "Secchi Disc Reading B" ), //
array ("field" => "secchi_d", "demo" => "3.37", "description" => "Secchi Disc Depth (average A and B)" ), //
array ("field" => "lab_id", "demo" => "N", "description" => "Lab Sample (Y/N) and Sample Id" ), //
array ("field" => "nitrate", "demo" => "40", "description" => "Nitrate Count" ), //
array ("field" => "phosphate", "demo" => "4", "description" => "Phosphate Count" ), //
array ("field" => "coliform", "demo" => "Present", "description" => "Coliform (Present/Absent)" ) ); //
	

	$fields = array ();
	foreach ( $table as $i => $row ) {
		$fields [$row ['field']] = array (//
$row ['field'], //
$row ['demo'], //
$row ['description'], //
$i + 1, // a default serial for the UI form
isset ( $row ['visible'] ) ? 1 : 0 );
	}
	return $fields;
}

////////////////////////////////////////////////////////////
////////// hooks
////////////////////////////////////////////////////////////


// shortcode
include 'views/main.php';
add_shortcode ( 'water-quality', 'cura_view_main' );

// main js source
add_action ( 'wp_enqueue_scripts', 'cura_js_water_quality' );
$src = CURAH2O_PLUGIN_URL . 'water-quality.js';
wp_register_script ( 'water-quality', $src, array ('jquery', 'jquery-ui-sortable' ) );
wp_enqueue_script ( 'water-quality' );

// ajax back-end support
include 'ajax.php';
include 'funcs.php';
add_action ( 'wp_ajax_locations.json', 'cura_json_locations' );
add_action ( 'wp_ajax_nopriv_locations.json', 'cura_json_locations' );
add_action ( 'wp_ajax_observations.json', 'cura_json_observations' );
add_action ( 'wp_ajax_nopriv_observations.json', 'cura_json_observations' );
add_action ( 'wp_ajax_typeaheads.json', 'cura_json_typeaheads' );
add_action ( 'wp_ajax_nopriv_typeaheads.json', 'cura_json_typeaheads' );

/*
 * jquery.tablesorter.js support
 */
$src = CURAH2O_PLUGIN_URL . 'lib/tablesorter/jquery.tablesorter.min.js';
wp_register_script ( 'tablesorter', $src, array ('jquery' ) );
wp_enqueue_script ( 'tablesorter' );

$src = CURAH2O_PLUGIN_URL . 'lib/tablesorter/themes/blue/style.css';
wp_register_style ( 'tablesorter', $src );
wp_enqueue_style ( 'tablesorter' );

/*
 * add jquery.tablesorter.pager.js support
 */
$src = CURAH2O_PLUGIN_URL . 'lib/tablesorter/addons/pager/jquery.tablesorter.pager.js';
wp_register_script ( 'tablesorter.pager', $src, array ('tablesorter' ) );
wp_enqueue_script ( 'tablesorter.pager' );

$src = CURAH2O_PLUGIN_URL . 'lib/tablesorter/addons/pager/jquery.tablesorter.pager.css';
wp_register_style ( 'tablesorter.pager', $src );
wp_enqueue_style ( 'tablesorter.pager' );

/*
 * column sortable and configurable
 */
wp_enqueue_script ( 'jquery-ui-sortable' );
add_action ( 'wp_head', 'jquery_ui_sortable_inline_css', 999 );
function jquery_ui_sortable_inline_css() {
	?>
<style type="text/css">
#fields-selector {
	margin: 0 0 0 10px;
	padding: 0px;
	font-size: 12px;
	display: none;
}

#fields-selector li {
	float: left;
	margin: 0.25em 1em 0.25em 0;
	padding: 0px 3px;
	background-color: #f0f0f0;
	border: 1px solid silver;
	list-style-position: inside;
}
</style>
<?php
}

/*
 * jQuery UI css
 */
$src = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/themes/redmond/jquery-ui.css';
wp_register_style ( 'jquery-ui', $src );
wp_enqueue_style ( 'jquery-ui' );

/*
 * jQuery UI Dialog
 */
wp_enqueue_script ( 'jquery-ui-dialog' );

/*
 * jQuery UI Datepicker and Timepicker
 */
wp_enqueue_script ( 'jquery-ui-datepicker' );
$src = CURAH2O_PLUGIN_URL . 'lib/jquery-ui-timepicker-addon.js';
wp_register_script ( 'jquery-ui-timepicker', $src, array ('jquery-ui-datepicker', 'jquery-ui-slider' ) );
wp_enqueue_script ( 'jquery-ui-timepicker' );

add_action ( 'wp_head', 'jquery_ui_timepicker_inline_css', 999 );
function jquery_ui_timepicker_inline_css() {
	?>
<style type="text/css">
.ui-timepicker-div .ui-widget-header {
	margin-bottom: 8px;
}

.ui-timepicker-div dl {
	text-align: left;
}

.ui-timepicker-div dl dt {
	height: 25px;
	margin: 0 0 -25px 10px;
}

.ui-timepicker-div dl dd {
	margin: 0 10px 10px 65px;
}

.ui-timepicker-div dl dt.ui_tpicker_time_label {
	position: relative;
	top: 53px;
	left: 45px;
}

.ui-timepicker-div dl dd.ui_tpicker_time {
	position: relative;
	top: 53px;
	left: 25px;
	height: 25px;
	margin-bottom: -25px;
}

.ui-timepicker-div td {
	font-size: 90%;
}

.ui-tpicker-grid-label {
	background: none;
	border: none;
	margin: 0;
	padding: 0;
}

.ui-datepicker {
	font-size: 12px;
}

.ui-datepicker th {
	line-height: normal;
}

.ui-datepicker td a {
	text-align: center
}
</style>
<?php
}

/*
 * jQuery validation
 */
$src = CURAH2O_PLUGIN_URL . 'lib/jquery-validation-1.9.0/jquery.validate.min.js';
wp_register_script ( 'jquery-validation', $src, array ('jquery' ) );
wp_enqueue_script ( 'jquery-validation' );

$src = CURAH2O_PLUGIN_URL . 'lib/jquery-validation-1.9.0/additional-methods.min.js';
wp_register_script ( 'jquery-validation-methods', $src, array ('jquery-validation' ) );
wp_enqueue_script ( 'jquery-validation-methods' );

/*
 * typeahead support
 */
$src = CURAH2O_PLUGIN_URL . 'lib/bootstrap/typeahead.js';
wp_register_script ( 'bootstrap-typeahead', $src, array ('jquery' ) );
wp_enqueue_script ( 'bootstrap-typeahead' );

$src = CURAH2O_PLUGIN_URL . 'lib/bootstrap/typeahead.css';
wp_register_style ( 'bootstrap-typeahead', $src );
wp_enqueue_style ( 'bootstrap-typeahead' );
/*
 * Css adjustment
 */
add_action ( 'wp_head', 'cura_inline_css', 999 );
function cura_inline_css() {
	?>
<style type="text/css">
.tablesorter th,.talbesorter td {
	text-align: left;
	line-height: normal;
}

.tablesorter .right {
	text-align: right;
	vertical-align: middle;
}

#dialog-data-entry {
	font-size: 12px;
}

#form-data-entry label {
	color: red;
}
</style>
<?php
}

/*
 * Back-end support for saving/deleting water quality record
 */
add_action ( 'wp_ajax_save_data_entry', 'cura_save_data_entry' );
add_action ( 'wp_ajax_nopriv_save_data_entry', 'cura_save_data_entry' );
add_action ( 'wp_ajax_delete_data_entry', 'cura_delete_data_entry' );
add_action ( 'wp_ajax_nopriv_delete_data_entry', 'cura_delete_data_entry' );
