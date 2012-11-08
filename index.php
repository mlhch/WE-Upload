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
Author URI: malhch@gmail.com
 */

// //////////////////////////////////////////////////////////
// //////// constants and variables
// //////////////////////////////////////////////////////////
define ( 'CURAH2O_VERSION', '1.0' );
define ( 'CURAH2O_PLUGIN_URL', plugin_dir_url ( __FILE__ ) );
define ( 'CURAH2O_PLUGIN_DIR', plugin_dir_path ( __FILE__ ) );
define ( 'CURAH2O_TABLE',			'water_quality' );
define ( 'CURAH2O_TABLE_LOCATION',	'water_quality_location' );
define ( 'CURAH2O_TABLE_LAYERS',	'water_quality_layers' );
define ( 'CURAH2O_COOKIE_NAME', 'water-quality' );

include 'config.php';

// //////////////////////////////////////////////////////////
// //////// hooks
// //////////////////////////////////////////////////////////
function cura_water_quality_main() {
	include 'views/main.php';
}
function cura_water_quality_mobile() {
	include 'views/mobile.php';
	exit ( 0 );
}
/*
 * Front end entrance
 */
$plugin_activated = false;
if (preg_match ( '~(/m)?/water-quality/(.*)~', $_SERVER ['REQUEST_URI'], $m )) {
	$plugin_activated = true;
	$isMobile = $m [1] == '/m';
	$request = $m [2];
	$phpInput = file_get_contents ( 'php://input' );
} elseif (preg_match ( '~^/wp-admin/admin-ajax.php\?action=cura_(.*?)(&|$)~', $_SERVER ['REQUEST_URI'], $m )) {
	$plugin_activated = true;
	$request = $m [1];
	$isMobile = $request == 'mobile';
	$phpInput = file_get_contents ( 'php://input' );
}

if ($plugin_activated) {
	include 'apis.php';
	include 'funcs.php';
	
	// Permission control
	add_action ( 'init', 'cura_init_roles' );
	function cura_init_roles() {
		global $wp_roles;
		if (isset ( $wp_roles )) {
			$wp_roles->add_cap ( 'administrator', 'cura-view' );
			$wp_roles->add_cap ( 'administrator', 'cura-add' );
			$wp_roles->add_cap ( 'administrator', 'cura-edit' );
			$wp_roles->add_cap ( 'administrator', 'cura-delete' );
		}
	}
	
	// Front end - mobile style
	if ($isMobile) {
		// No .htaccess, so go directly
		cura_water_quality_mobile ();
		
		// Frond end - screen style
	} elseif (! $isMobile && '' === $request && empty ( $phpInput )) {
		if (isset ( $_SERVER ['HTTP_REFERER'] ) && preg_match ( '~/m/water-quality/~', $_SERVER ['HTTP_REFERER'] )) {
			$_COOKIE ['mobile-redirect'] = '""';
			setcookie ( 'mobile-redirect', '""' );
		}
		if (isset ( $_COOKIE ['mobile-redirect'] ) && $_COOKIE ['mobile-redirect'] == '"YES"') {
			header ( "Location: ../m/water-quality/" );
			exit ( 0 );
		}
		add_shortcode ( 'water-quality', 'cura_water_quality_main' );
		add_action ( 'wp_enqueue_scripts', 'cura_main_js_and_css' );
		
		// Service call
	} elseif (! $isMobile && 'services' == $request) {
		// No .htaccess, so go directly
		cura_services ();
		
		// Layer call
	} elseif (! $isMobile && 'service/1' == $request) {
		// No .htaccess, so go directly
		cura_service_layers ();
		
		// Data call
	} elseif (! $isMobile && '' === $request && ! empty ( $phpInput )) {
		if (get_magic_quotes_gpc ()) {
			$phpInput = stripslashes ( $phpInput );
		}
		$obj = json_decode ( $phpInput );
		$func_name = "cura_service_$obj->request";
		
		if (function_exists ( $func_name )) {
			$result = $func_name ( $obj );
		} else {
			$result = array (
					'error' => "Bad data name '$obj->request'" 
			);
		}
		echo json_encode ( $result );
		exit ( 0 );
		
		// Ajax actions
	} elseif (! $isMobile && preg_match ( '/^(.*)\.(json|action|demo)/', $request, $m )) {
		if ($m [2] == 'demo') {
			// No .htaccess, so go directly
			call_user_func ( "cura_$m[2]_$m[1]" );
		}
		add_action ( "wp_ajax_cura_$m[1].$m[2]", "cura_$m[2]_$m[1]" );
		add_action ( "wp_ajax_nopriv_cura_$m[1].$m[2]", "cura_$m[2]_$m[1]" );
	}
}
/*
 * Back end entrance
 */
if (is_admin ()) {
	include CURAH2O_PLUGIN_DIR . 'admin.php';
	// 'Settings' link of plugin
	add_filter ( "plugin_action_links_water-quality-observation/index.php", 'cura_plugin_action_links' );
	// 'Settings' menu of admin page
	add_action ( 'admin_menu', 'cura_menu' );
	// When activated, install the tables
	add_action ( 'activate_water-quality-observation/index.php', 'cura_install_tables' );
}
function cura_main_js_and_css() {
	/*
	 * wp_deregister_script('jquery'); $src = CURAH2O_PLUGIN_URL .
	 * 'debug/jquery-1.7.2.js'; wp_register_script('jquery', $src);
	 * wp_enqueue_script('jquery');
	 */
	
	// main js source
	$src = CURAH2O_PLUGIN_URL . 'water-quality.js';
	wp_register_script ( 'water-quality', $src, array (
			'jquery',
			'jquery-ui-sortable' 
	) );
	wp_enqueue_script ( 'water-quality' );
	
	/*
	 * jquery.tablesorter.js support
	 */
	$src = CURAH2O_PLUGIN_URL . 'lib/tablesorter/jquery.tablesorter.js';
	wp_register_script ( 'tablesorter', $src, array (
			'jquery' 
	) );
	wp_enqueue_script ( 'tablesorter' );
	
	$src = CURAH2O_PLUGIN_URL . 'lib/tablesorter/themes/blue/style.css';
	wp_register_style ( 'tablesorter', $src );
	wp_enqueue_style ( 'tablesorter' );
	
	/*
	 * add jquery.tablesorter.pager.js support
	 */
	$src = CURAH2O_PLUGIN_URL . 'lib/tablesorter/addons/pager/jquery.tablesorter.pager.js';
	wp_register_script ( 'tablesorter.pager', $src, array (
			'tablesorter' 
	) );
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
#fields-selector:before {
	display: block;
	color: #666;
	content:
		"Changing field settings will affect the current list view. To enable field click on its associated checkbox. To reorder fields click, drag and drop fields in position. Changes will persist for your next session."
}

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
	color: gray;
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
	wp_register_script ( 'jquery-ui-timepicker', $src, array (
			'jquery-ui-datepicker',
			'jquery-ui-slider' 
	) );
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
	float: left;
}

.ui-timepicker-div dl dd.ui_tpicker_time {
	position: relative;
	top: 53px;
	left: 25px;
	height: 25px;
	margin-bottom: -25px;
	float: left;
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
	wp_register_script ( 'jquery-validation', $src, array (
			'jquery' 
	) );
	wp_enqueue_script ( 'jquery-validation' );
	
	$src = CURAH2O_PLUGIN_URL . 'lib/jquery-validation-1.9.0/additional-methods.min.js';
	wp_register_script ( 'jquery-validation-methods', $src, array (
			'jquery-validation' 
	) );
	wp_enqueue_script ( 'jquery-validation-methods' );
	
	/*
	 * typeahead support
	 */
	$src = CURAH2O_PLUGIN_URL . 'lib/bootstrap/typeahead.js';
	wp_register_script ( 'bootstrap-typeahead', $src, array (
			'jquery' 
	) );
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

#dialog-data-entry td.label {
	text-align: right;
	padding: 0.5em 1em 0.5em 0;
}

#form-data-entry td {
	width: 23%;
}

#form-data-entry td.label {
	width: 27%;
	vertical-align: top;
}

#form-data-entry input.error {
	border: 1px solid red
}

#form-data-entry label.error {
	color: red;
}

#message {
	display: none;
	position: absolute;
	z-index: 100000;
	width: auto;
	border: 1px solid green;
	background-color: lightgreen;
	padding: 1em;
}
</style>
<?php
	}
	/*
	 * JQuery validation optoins
	 */
	add_action ( 'wp_head', 'cura_inline_js', 999 );
	function cura_inline_js() {
		?>
<script type="text/javascript">
var cura_validation_options = <?php echo json_encode( cura_validation_options() )?>;
for (var i in cura_validation_options.rules) {
	var rules = cura_validation_options.rules[i];
	for (var j in rules) {
		if (j == 'pattern') {
			rules[j] = new RegExp(rules[j].substr(1, rules[j].length - 2));
		}
	}
}
</script>
<?php
	}
}
