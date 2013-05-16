<?php
function cura_request() {
	$phpInput = file_get_contents ( 'php://input' );
	if (get_magic_quotes_gpc ()) {
		$phpInput = stripslashes ( $phpInput );
	}
	return json_decode ( $phpInput );
}
function cura_geojson() {
	$objs = cura_all_stations_with_latest_data();

	$fc = array(
		'type' => 'FeatureCollection',
		'features' => array()
	);
	foreach ($objs as $key => $obj) {
		$fc['features'][] = array(
			'id' => intval($obj->id),
			'type' => 'Feature',
			'properties' => $obj,
			'geometry' => array(
				'type' => 'Point',
				'coordinates' => array($obj->longitude, $obj->latitude)
			)
		);
		unset($obj->id);
		unset($obj->latitude);
		unset($obj->longitude);

		foreach ($obj as $key => $value) {
			if (is_numeric($value)) {
				$obj->$key = floatval($value);
			}
		}
	}
	echo json_encode($fc);
	exit ( 0 );
}
/*
 * Service Call
 */
function cura_services() {
	$service = cura_get_services ();
	
	$servicelist = array (
			array (
					"id" => 1,
					"title" => get_option ( 'cura_title' ),
					"keywords" => get_option ( 'cura_keywords' ),
					"providername" => get_option ( 'cura_providername' ),
					"website" => get_option ( 'cura_website' ),
					"description" => get_option ( 'cura_description' ),
					"authorname" => get_option ( 'cura_title' ),
					"title" => get_option ( 'cura_authorname' ),
					"type" => get_option ( 'cura_type' ),
					"contact" => get_option ( 'cura_contact' ),
					'time' => array (
							'begintime' => $service->begintime,
							'endtime' => $service->endtime 
					),
					'bbox' => array (
							'upperright' => array (
									'latitude' => $service->upper,
									'longitude' => $service->right 
							),
							'bottomleft' => array (
									'latitude' => $service->bottom,
									'longitude' => $service->left 
							) 
					) 
			) 
	);
	
	$result = array (
			'servicelist' => $servicelist 
	);
	echo json_encode ( $result );
	exit ( 0 );
}
/*
 * Layer Call
 */
function cura_service_layers() {
	$layers = cura_get_layers ();
	
	$layerlist = array ();
	foreach ( $layers as $obj ) {
		$layerlist [] = array (
				'id' => intval ( $obj->id ),
				'name' => $obj->name,
				'time' => array (
						'begintime' => $obj->begintime,
						'endtime' => $obj->endtime 
				),
				'bbox' => array (
						'upperright' => array (
								'latitude' => $obj->upper,
								'longitude' => $obj->right 
						),
						'bottomleft' => array (
								'latitude' => $obj->bottom,
								'longitude' => $obj->left 
						) 
				) 
		);
	}
	
	$result = array (
			'layerlist' => $layerlist 
	);
	
	echo json_encode ( $result );
	exit ( 0 );
}

/*
 * Ajax - config.json
 */
function cura_json_config() {
	$fields = cura_fields ();
	
	echo json_encode ( array (
			'canEdit' => current_user_can('cura-edit'),
			'canDelete' => current_user_can('cura-delete'),
			'canAdd' => 1,
			'locations' => cura_get_locations (),
			'fields' => $fields,
	) );
	exit ();
}

/*
 * Ajax - locations.json
 */
function cura_json_locations() {
	if (isset ( $_REQUEST ['refresh'] )) {
		cura_update_locations ();
	}
	
	$locations = cura_get_locations ();
	
	echo json_encode ( array (
			'locations' => $locations 
	) );
	exit ();
}
/*
 * Ajax - typeaheads.json
 */
function cura_json_typeaheads_station_name() {
	$watershed = isset ( $_REQUEST ['watershed'] ) ? $_REQUEST ['watershed'] : '';
	$location_id = isset ( $_REQUEST ['location_id'] ) ? $_REQUEST ['location_id'] : '';
	$rows = cura_get_typeaheads_of_station ( $watershed, $location_id );
	
	echo json_encode ( array (
			'typeaheads' => $rows 
	) );
	exit ( 0 );
}
function cura_json_typeaheads_location_id() {
	$watershed = isset ( $_REQUEST ['watershed'] ) ? $_REQUEST ['watershed'] : '';
	$station = isset ( $_REQUEST ['station'] ) ? $_REQUEST ['station'] : '';
	$rows = cura_get_typeaheads_of_locationid ( $watershed, $station );
	
	echo json_encode ( array (
			'typeaheads' => $rows 
	) );
	exit ( 0 );
}
/*
 * Ajax - observations.json
 */
function cura_json_observations() {
	$request = cura_request();

	// making root as Array is for ngResource
	$observations = cura_get_observations ( $request );
	
	if (isset ( $_REQUEST ['export'] )) {
		$location = cura_get_location ( $id );
		$name = $location ? urlencode ( $location->watershed_name ) : 'All';
		header ( "Content-Type:text/csv;charset=utf-8" );
		header ( 'Content-Description: File Transfer' );
		header ( "content-Disposition: attachment; filename=WaterQuality-$name.csv" );
		header ( 'Content-Transfer-Encoding: binary' );
		$fp = fopen ( 'php://output', 'w' );
		
		$headers = array (
				"id" 
		);
		foreach ( $fields as $row ) {
			$headers [] = $row [2];
		}
		fputcsv ( $fp, $headers );
		foreach ( $observations as $row ) {
			fputcsv ( $fp, $row );
		}
		
		fclose ( $fp );
	} else {
		echo json_encode ( $observations );
	}
	exit ( 0 );
}
/*
 * Ajax - save
 */
function cura_action_save() {
	$params = (array) cura_request();
	
	if (empty ( $params ['lab_sample'] ) || $params ['lab_sample'] == 'N') {
		$params ['lab_id'] = NULL;
	}
	
	include 'lib/Validator.class.php';
	$asOption = cura_validation_options ();
	$oValidator = new Validator ( $asOption );
	$oValidator->addMethod ( "pattern", "cura_validation_pattern" );
	$oValidator->addMethod ( "secchi_b", "cura_validation_secchi_b", $asOption ['messages'] ['secchi_b'] );
	$oValidator->addMethod ( "secchi_d", "cura_validation_secchi_d", $asOption ['messages'] ['secchi_d'] );
	$errors = $oValidator->validate ( $params );
	if (! empty ( $errors )) {
		echo json_encode ( array (
				'error' => $errors 
		) );
		exit ();
	}

	if (empty ( $params ['datetime'] )) {
		$params ['datetime'] = date ( 'Y-m-d H:i:s' );
	} else {
		$params ['datetime'] = date ( 'Y-m-d H:i:s', strtotime ( $params ['datetime'] ) );
	}
	
	$values = array ();
	if (empty ( $params ['id'] )) {
		$result = cura_add_entry ( $params );
		
		cura_update_layers ();
	} else {
		cura_check_capability ( 'cura-edit' );
		
		$id = intval ( $params ['id'] );
		unset ( $params ['id'] );
		
		$oldEntry = cura_get_entry ( $id );
		$result = cura_update_entry ( $id, $params );
		
		$test = array (
				'datetime',
				'latitude',
				'longitude' 
		);
		$diff = array_diff_assoc ( $result ['data'], $oldEntry );
		$diff = array_intersect ( $test, array_keys ( $diff ) );
		if (! empty ( $diff )) {
			cura_update_layers ();
		}
		
		if ($result ['data'] ['watershed_name'] != $oldEntry ['watershed_name']) {
			cura_update_location ( $oldEntry ['watershed_name'] );
		}
	}
	
	cura_update_location ( $result ['data'] ['watershed_name'] );
	
	echo json_encode ( array (
			'affectedRows' => $result ['affectedRows'],
			'id' => $id,
			'insertId' => $result ['insertId'],
			data => array_values ( $result ['data'] ) 
	) );
	exit ();
}
/*
 * Ajax - delete
 */
function cura_action_delete() {
	cura_check_capability ( 'cura-delete' );
	
	$request = cura_request();
	$id = intval ( $request->id );
	
	$row = cura_get_entry ( $id );
	$affectedRows = cura_delete_entry ( $id );
	cura_update_location ( $row ['watershed_name'] );
	
	cura_update_layers ();
	
	echo json_encode ( array (
			'affectedRows' => $affectedRows,
			'id' => $id 
	) );
	exit ();
}
function cura_check_capability($capability) {
	if (! current_user_can ( $capability )) {
		echo json_encode ( array (
				'error' => 'You don\'t have "' . $capability . '" capability' 
		) );
		exit ( 0 );
	}
}
/*
 *
 */
function cura_service_getdata($request) {
	$layerid = intval ( $request->layerid );
	$layer = cura_get_layer_by_id ( $layerid );
	
	$result = array (
			'serviceid' => $request->serviceid,
			'layerid' => $request->layerid,
			'layername' => $layer->name 
	);
	
	$objs = cura_get_data ( $layer->name, $request->time, $request->bbox );
	
	$readings = array ();
	foreach ( $objs as $obj ) {
		$name = "$obj->station_name($obj->location_id)[$obj->watershed_name]";
		if (! isset ( $readings [$name] )) {
			$readings [$name] = array (
					'name' => $obj->station_name,
					'id' => $obj->location_id,
					'group' => $obj->watershed_name,
					'lon' => $obj->lon,
					'lat' => $obj->lat 
			);
		}
		
		$readings [$name] ['readings'] [] = array (
				'time' => $obj->datetime,
				'value' => $obj->value 
		);
	}
	$result ['data'] = array_values ( $readings );
	
	return $result;
}
function cura_demo_servicecall() {
	?>
<script type='text/javascript'
	src='<?php echo home_url()?>/wp-includes/js/jquery/jquery.js?ver=1.7.2'></script>
<script type="text/javascript">
<!--
jQuery(document).ready(function($) {
	$.post('services', null, function(jsonText) {
		var json = JSON.parse(jsonText);
		document.write('<pre>' + JSON.stringify(json, null, '    ') + '</pre>')
	})
})
//-->
	</script>
<?php
	exit ( 0 );
}
function cura_demo_layercall() {
	?>
<script type='text/javascript'
	src='<?php echo home_url()?>/wp-includes/js/jquery/jquery.js?ver=1.7.2'></script>
<script type="text/javascript">
<!--
jQuery(document).ready(function($) {
	$.post('service/1', null, function(jsonText) {
		var json = JSON.parse(jsonText);
		document.write('<pre>' + JSON.stringify(json, null, '    ') + '</pre>')
	})
})
//-->
	</script>
<?php
	exit ( 0 );
}
function cura_demo_datacall() {
	?>
<script type='text/javascript'
	src='<?php echo home_url()?>/wp-includes/js/jquery/jquery.js?ver=1.7.2'></script>
<script type="text/javascript">
<!--
jQuery(document).ready(function($) {
	$('button').click(function() {
		$.post('.', $('textarea').val(), function(jsonText) {
			var json = JSON.parse(jsonText);
			document.write('<pre>' + JSON.stringify(json, null, '    ') + '</pre>')
		})
	})
})
//-->
</script>
<textarea rows="20" cols="120">
{
    "request": "getdata",
    "serviceid" : 1,
    "layerid" : 1,
    "time" : {
        "begintime" : "<?php echo date('Y-m-d H:i:s', strtotime('last month'))?>",
        "endtime" : "<?php echo date('Y-m-d H:i:s', strtotime('+8 hours'))?>" 
    },
    "bbox" : {
        "upperright" : {
            "latitude": 80,
            "longitude": 170
        },
        "bottomleft" : {
            "latitude" : -80,
            "longitude" : -170
        } 
    } 
	
}
</textarea>
<br />
<button>Send Data Call</button>
<?php
	exit ( 0 );
}

function cura_demo_migrate() {
	ini_set('display_errors', 'on');
	error_reporting(E_ALL);
	$url = 'http://curah2o.com/wp-admin/admin-ajax.php?action=cura_observations.json&watershed=';
	$json = file_get_contents($url);
	$data = json_decode($json);
	$fields = $data->fields;
	$observations = $data->observations;

	global $wpdb;
	$sql = "DELETE FROM `" . CURAH2O_TABLE . "` WHERE 1";
	$affectedRows = $wpdb->query ( $sql );
	echo "$affectedRows rows deleted<br />\n";

	foreach ($observations as $row) {
		$params = array();
		foreach ($fields as $field) {
			if ($field[0] == 'datetime') {
				$params[$field[0]] = date('Y-m-d H:i:s', strtotime($row[$field[3]]));
			} else {
				$params[$field[0]] = stripslashes($row[$field[3]]);
			}
		}
		cura_add_entry($params);
	}
	cura_update_layers();
	cura_update_locations();
	exit;
}