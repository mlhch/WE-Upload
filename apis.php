<?php
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
function cura_json_typeaheads() {
	$rows = cura_get_typeaheads ();
	
	$result = array ();
	foreach ( $rows as $row ) {
		$result [] = array_values ( $row );
	}
	echo json_encode ( array (
			'typeaheads' => $result 
	) );
	exit ( 0 );
}
/*
 * Ajax - observations.json
 */
function cura_json_observations() {
	$id = isset ( $_REQUEST ['watershed'] ) ? $_REQUEST ['watershed'] : 0;
	
	$params = array (
			'filters' => array (
					array (
							'field' => 'b.id',
							'value' => $id 
					) 
			) 
	);
	
	$rows = cura_get_observations ( $params );
	
	$observations = array ();
	foreach ( $rows as $obj ) {
		$observations [$obj->id] = array_values ( ( array ) $obj );
	}
	
	$fields = cura_fields ();
	$result = array (
			'fields' => $fields,
			'observations' => $observations 
	);
	
	if (isset ( $_REQUEST ['export'] )) {
		header ( "Content-type:text/csv;charset=utf-8" );
		header ( "content-Disposition:filename=WaterQualityObservations-" . urlencode ( $watershed_name ) . ".csv" );
		$fp = fopen ( 'php://output', 'w' );
		
		$headers = array ();
		foreach ( $fields as $row ) {
			$headers [] = $row [2];
		}
		fputcsv ( $fp, $headers );
		foreach ( $observations as $row ) {
			fputcsv ( $fp, $row );
		}
		
		fclose ( $fp );
	} else {
		echo json_encode ( $result );
	}
	exit ( 0 );
}
/*
 * Ajax - save
 */
function cura_action_save() {
	$params = $_REQUEST;
	unset ( $params ['action'] );
	
	if (empty ( $params ['lab_sample'] ) || $params ['lab_sample'] == 'N') {
		$params ['lab_id'] = NULL;
	}
	if (empty ( $params ['datetime'] )) {
		$params ['datetime'] = date ( 'Y-m-d H:i:s' );
	} else {
		$params ['datetime'] = date ( 'Y-m-d H:i:s', strtotime ( $params ['datetime'] ) );
	}
	
	include 'lib/Validator.class.php';
	$asOption = cura_validation_options ();
	$oValidator = new Validator ( $asOption );
	$oValidator->addMethod ( "pattern", "cura_validation_pattern" );
	$oValidator->addMethod ( "secchi_b", "cura_validation_secchi_b", $asOption ['messages'] ['secchi_b'] );
	$oValidator->addMethod ( "secchi_d", "cura_validation_secchi_d", $asOption ['messages'] ['secchi_d'] );
	$errors = $oValidator->validate ( $_POST );
	if (! empty ( $errors )) {
		echo json_encode ( array (
				'error' => $errors 
		) );
		exit ();
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
	
	$id = intval ( $_REQUEST ['id'] );
	
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
		$name = "$obj->station_name($obj->location_id)[$obj->lat, $obj->lon]";
		if (! isset ( $readings [$name] )) {
			$readings [$name] = array (
					'name' => $name,
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




