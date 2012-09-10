<?php
/*
 * Service Call
 */
function cura_services($id = 0) {
	$servicelist = array (//
array (//
"id" => 1, //
"title" => get_option ( 'cura_title' ), //
"keywords" => get_option ( 'cura_keywords' ), //
"providername" => get_option ( 'cura_providername' ), //
"website" => get_option ( 'cura_website' ), //
"description" => get_option ( 'cura_description' ), //
"authorname" => get_option ( 'cura_title' ), //
"title" => get_option ( 'cura_authorname' ), //
"type" => get_option ( 'cura_type' ), //
"contact" => get_option ( 'cura_contact' ) ) );
	if ($id) {
		if (isset ( $servicelist [$id - 1] )) {
			return $servicelist [$id - 1];
		} else {
			return false;
		}
	}
	$result = array ('servicelist' => $servicelist );
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
		$layerlist [] = array (//
'id' => intval ( $obj->id ), //
'time' => array ('begintime' => $obj->begintime, 'endtime' => $obj->endtime ), //
'name' => $obj->name );
	}
	
	$result = array ('layerlist' => $layerlist );
	
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
	
	echo json_encode ( array ('locations' => $locations ) );
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
	echo json_encode ( array ('typeaheads' => $result ) );
	exit ( 0 );
}
/*
 * Ajax - observations.json
 */
function cura_json_observations() {
	$id = isset ( $_REQUEST ['watershed'] ) ? $_REQUEST ['watershed'] : 0;
	
	$params = array (//
'filters' => array (//
array ('field' => 'b.id', 'value' => $id ) ) );
	
	$rows = cura_get_observations ( $params );
	
	$observations = array ();
	foreach ( $rows as $obj ) {
		foreach ( $obj as &$value ) {
			is_numeric ( $value ) && $value = floatval ( $value );
		}
		$observations [$obj->id] = array_values ( ( array ) $obj );
	}
	
	$fields = cura_fields ();
	$result = array ('fields' => $fields, 'observations' => $observations );
	
	if (isset ( $_REQUEST ['export'] )) {
		header ( "Content-type:text/plain;charset=utf-8" );
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
	
	$values = array ();
	if (empty ( $params ['id'] )) {
		//cura_check_capability ( 'cura-add' );
		

		$result = cura_add_entry ( $params );
	} else {
		cura_check_capability ( 'cura-edit' );
		
		$id = intval ( $params ['id'] );
		unset ( $params ['id'] );
		
		$oldEntry = cura_get_entry ( $id );
		$result = cura_update_entry ( $id, $params );
		
		if ($result ['data'] ['watershed_name'] != $oldEntry ['watershed_name']) {
			cura_update_location ( $oldEntry ['watershed_name'] );
		}
	}
	
	cura_update_location ( $result ['data'] ['watershed_name'] );
	
	echo json_encode ( array (//
'affectedRows' => $result ['affectedRows'], //
'id' => $id, //
'insertId' => $result ['insertId'], //
data => array_values ( $result ['data'] ) ) );
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
	
	echo json_encode ( array (//
'affectedRows' => $affectedRows, //
'id' => $id ) );
	exit ();
}

function cura_check_capability($capability) {
	if (! current_user_can ( $capability )) {
		echo json_encode ( array ('error' => 'You don\'t have "' . $capability . '" capability' ) );
		exit ( 0 );
	}
}







