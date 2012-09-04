<?php
function cura_save_data_entry() {
	$table_info = cura_table_info ( CURAH2O_TABLE );
	if (empty ( $table_info )) {
		cura_create_table_main ();
	}
	
	$params = $_POST;
	$params ['datetime'] = date ( 'Y-m-d H:i:s', strtotime ( $params ['datetime'] ) );
	unset ( $params ['action'] );
	
	$values = array ();
	if (empty ( $params ['id'] )) {
		$result = cura_add_entry($params);
	} else {
		$id = intval ( $params ['id'] );
		unset ( $params ['id'] );
		
		$oldEntry = cura_get_entry($id);
		$result = cura_update_entry($id, $params);
		
		if ($result['data']['watershed_name'] != $oldEntry['watershed_name']) {
			cura_update_location($oldEntry['watershed_name']);
		}
	}
	
	cura_update_location($result['data']['watershed_name']);
	
	echo json_encode ( array (//
'affectedRows' => $result['affectedRows'], //
'id' => $id, //
'insertId' => $result['insertId'], //
data => array_values ( $result['data'] ) ) );
	exit ();
}

function cura_delete_data_entry() {
	global $wpdb;
	$id = intval ( $_POST ['id'] );
	
	$row = cura_get_entry($id);
	$affectedRows = cura_delete_entry($id);
	cura_update_location($row['watershed_name']);
	
	echo json_encode ( array (//
'affectedRows' => $affectedRows, //
'id' => $id ) );
	exit ();
}

function cura_json_locations() {
	$table_info = cura_table_info ( CURAH2O_TABLE_LOCATION );
	if (empty ( $table_info )) {
		cura_create_table_location ();
	}
	
	if (isset($_REQUEST['refresh'])) {
		cura_update_locations ();
	}
	
	$locations = cura_get_locations ();
	
	echo json_encode ( $locations );
	exit ();
}

function cura_json_observations() {
	$watershed_name = isset ( $_REQUEST ['watershed'] ) ? strval ( $_REQUEST ['watershed'] ) : '';
	
	$params = array (//
'filters' => array (//
array ('field' => 'watershed_name', 'value' => $watershed_name ) ) );
	
	$rows = cura_get_observations ( $params );
	$observations = array();
	foreach ($rows as $row) {
		foreach ($row as &$value) {
			is_numeric($value) && $value = floatval($value);
		}
		$observations[$row['id']] = array_values($row);
	}
	
	$fields = cura_fields ();
	$result = array ('fields' => $fields, 'observations' => $observations );
	
	if (isset($_REQUEST['export'])) {
		header("Content-type:text/csv;charset=utf-8");
		header("content-Disposition:filename=WaterQualityObservations-" . urlencode($watershed_name) . ".csv");
		$fp = fopen('php://output', 'w');
		
		$headers = array();
		foreach ($fields as $row) {
			$headers[] = $row[2];
		}
		fputcsv($fp, $headers);
		foreach ($observations as $row) {
			fputcsv($fp, $row);
		}
		
		fclose($fp);
	} else {
		echo json_encode ( $result );
	}
	exit ();
}

function cura_json_typeaheads() {
	$rows = cura_get_typeaheads();
	
	$result = array();
	foreach ($rows as $row) {
		$result[] = array_values($row);
	}
	echo json_encode ( $result );
	exit ();
}





