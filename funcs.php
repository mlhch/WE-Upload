<?php
function cura_fields() {
	static $fields = null;
	
	if ($fields) {
		return $fields;
	}
	
	$table = array ( //
			array (
					"field" => "watershed_name", //
					"demo" => "",
					"description" => "Watershed Name",
					"visible" => 1 
			), //
			array (
					"field" => "station_name", //
					"demo" => "",
					"description" => "Station Name",
					"visible" => 1 
			), //
			array (
					"field" => "location_id", //
					"demo" => "Letters and numbers without space",
					"description" => "Location ID",
					"visible" => 1 
			), //
			array (
					"field" => "datetime", //
					"demo" => date ( "m/d/Y H:i A" ),
					"description" => "Date and Time",
					"visible" => 1 
			), //
			array (
					"field" => "latitude",
					"demo" => "",
					"description" => "Latitude" 
			), //
			array (
					"field" => "longitude",
					"demo" => "",
					"description" => "Longitude" 
			), //
			array (
					"field" => "do_mgl",
					"demo" => "0-15",
					"description" => "DO (mg/L)" 
			), //
			array (
					"field" => "do_%",
					"demo" => "0-110",
					"description" => "DO (%) " 
			), //
			array (
					"field" => "cond",
					"demo" => "0-1500",
					"description" => "Cond. (µS/cm)" 
			), //
			array (
					"field" => "salinity",
					"demo" => "0-1",
					"description" => "Salinity (ppt)" 
			), //
			array (
					"field" => "temp",
					"demo" => "0-30",
					"description" => "Temp. (⁰C)" 
			), //
			array (
					"field" => "ph",
					"demo" => "4-8",
					"description" => "pH" 
			), //
			array (
					"field" => "secchi_a",
					"demo" => "0-20",
					"description" => "Secchi Disc Reading A" 
			), //
			array (
					"field" => "secchi_b",
					"demo" => "between A+/-2",
					"description" => "Secchi Disc Reading B" 
			), //
			array (
					"field" => "secchi_d",
					"demo" => "average A and B",
					"description" => "Secchi Disc Depth" 
			), //
			array (
					"field" => "lab_sample",
					"demo" => "",
					"description" => "Lab Sample" 
			), //
			array (
					"field" => "lab_id",
					"demo" => "",
					"description" => "Lab Id" 
			), //
			array (
					"field" => "nitrate",
					"demo" => "0-40",
					"description" => "Nitrate Count" 
			), //
			array (
					"field" => "phosphate",
					"demo" => "0-4",
					"description" => "Phosphate Count" 
			), //
			array (
					"field" => "coliform",
					"demo" => "",
					"description" => "Coliform" 
			) 
	); //
	
	$fields = array ();
	foreach ( $table as $i => $row ) {
		$fields [$row ['field']] = array ( //
				$row ['field'], //
				$row ['demo'], //
				$row ['description'], //
				$i + 1, // a default serial for the UI form
				isset ( $row ['visible'] ) ? 1 : 0 
		);
	}
	return $fields;
}
/*
 * Service, Layer, Data Call
 */
function cura_get_services() {
	global $wpdb;
	
	$sql = "
		SELECT	DATE_FORMAT(MIN(`begintime`), '%Y-%m-%dT%H:%i:%sZ') `begintime`
				, DATE_FORMAT(MAX(`endtime`), '%Y-%m-%dT%H:%i:%sZ') `endtime`
				, MAX(`upper`) `upper`
				, MAX(`right`) `right`
				, MIN(`bottom`) `bottom`
				, MIN(`left`) `left`
		FROM	`" . CURAH2O_TABLE_LAYERS . "`
		WHERE	TRUE
	";
	
	$obj = $wpdb->get_row ( $sql );
	
	$obj->upper = floatval ( $obj->upper );
	$obj->right = floatval ( $obj->right );
	$obj->bottom = floatval ( $obj->bottom );
	$obj->left = floatval ( $obj->left );
	
	return $obj;
}
function cura_get_layers() {
	global $wpdb;
	
	$sql = "
		SELECT	`id`
				, `name`
				, DATE_FORMAT(`begintime`, '%Y-%m-%dT%H:%i:%sZ') `begintime`
				, DATE_FORMAT(`endtime`, '%Y-%m-%dT%H:%i:%sZ') `endtime`
				, `upper`
				, `right`
				, `bottom`
				, `left`
				, `total`	
		FROM	`" . CURAH2O_TABLE_LAYERS . "`
		WHERE	TRUE
	";
	$objs = $wpdb->get_results ( $sql );
	
	foreach ( $objs as $obj ) {
		$obj->upper = floatval ( $obj->upper );
		$obj->right = floatval ( $obj->right );
		$obj->bottom = floatval ( $obj->bottom );
		$obj->left = floatval ( $obj->left );
	}
	
	return $objs;
}
function cura_get_data($field, $time, $bbox) {
	global $wpdb;
	
	$begintime = $time->begintime;
	$endtime = $time->endtime;
	$upper = $bbox->upperright->latitude;
	$right = $bbox->upperright->longitude;
	$bottom = $bbox->bottomleft->latitude;
	$left = $bbox->bottomleft->longitude;
	
	$sql = "
		SELECT	a.`datetime`
				, a.`$field` `value`
				, a.`latitude` `lat`
				, a.`longitude` `lon`
				, a.`station_name`
				, a.`location_id`
		FROM	`" . CURAH2O_TABLE . "` AS a
		WHERE	`$field` IS NOT NULL
			AND	`datetime` >= '$begintime'
			AND	`datetime` <= '$endtime'
			AND	`latitude` <= '$upper'
			AND	`latitude` >= '$bottom'
			AND	`longitude` <= '$right'
			AND	`longitude` >= '$left'
	";
	$objs = $wpdb->get_results ( $sql );
	
	foreach ( $objs as $obj ) {
		$obj->value = floatval ( $obj->value );
		$obj->lat = floatval ( $obj->lat );
		$obj->lon = floatval ( $obj->lon );
	}
	
	return $objs;
}
function cura_update_layers() {
	global $wpdb;
	static $ignored_fields = null;
	
	if (! isset ( $ignored_fields )) {
		$ignored_fields = array_flip ( array ( //
				'id',
				'location_id',
				'station_name',
				'watershed_name',
				'datetime',
				'latitude',
				'longitude',
				'lab_sample' 
		) );
	}
	
	$fields = cura_table_info ( CURAH2O_TABLE );
	foreach ( $fields as $obj ) {
		$field = $obj->Field;
		if (isset ( $ignored_fields [$field] )) {
			continue;
		}
		
		$sql = "
			SELECT	MIN(datetime) `begintime`
					, MAX(datetime) `endtime`
					, MAX(latitude) `upper`
					, MAX(longitude) `right`
					, MIN(latitude) `bottom`
					, MIN(longitude) `left`
			FROM	`" . CURAH2O_TABLE . "`
					WHERE	`$field` IS NOT NULL
		";
		$row = $wpdb->get_row ( $sql );
		
		$values = array ();
		foreach ( $row as $key => $value ) {
			if (! is_null ( $value )) {
				$values [] = "`$key` = '" . addslashes ( $value ) . "'";
			}
		}
		
		$layer = cura_get_layer_by_name ( $field );
		if (! $layer) {
			$sql = "
				INSERT INTO
						`" . CURAH2O_TABLE_LAYERS . "`
				SET		`name` = '" . addslashes ( $field ) . "'" . 			//
			(empty ( $values ) ? "" : "
						, " . implode ( "
						, ", $values )) . "
			";
			$wpdb->query ( $sql );
		} elseif (! empty ( $value )) {
			$sql = "
				UPDATE	`" . CURAH2O_TABLE_LAYERS . "`
				SET		" . implode ( "
						, ", $values ) . "
				WHERE	`name` = '" . addslashes ( $field ) . "'
			";
			$wpdb->query ( $sql );
		}
	}
}
function cura_get_layer_by_id($id) {
	global $wpdb;
	
	$sql = "
		SELECT	id, name
				, begintime, endtime
				, `upper`, `right`, `bottom`, `left`
		FROM	`" . CURAH2O_TABLE_LAYERS . "`
		WHERE	id = " . intval ( $id ) . "
	";
	return $wpdb->get_row ( $sql );
}
function cura_get_layer_by_name($name) {
	global $wpdb;
	
	$sql = "
		SELECT	id, name
				, begintime, endtime
				, `upper`, `right`, `bottom`, `left`
		FROM	`" . CURAH2O_TABLE_LAYERS . "`
		WHERE	name = '" . addslashes ( $name ) . "'
	";
	return $wpdb->get_row ( $sql );
}
/*
 * Table information
 */
function cura_table_info($tbname) {
	global $wpdb;
	
	$sql = "DESCRIBE `" . addslashes ( $tbname ) . "`";
	return $wpdb->get_results ( $sql );
}
/*
 * get/add/update/delete entry
 */
function cura_get_entry($id) {
	global $wpdb;
	
	$id = intval ( $id );
	
	// The fields order is important
	$rows = cura_fields ();
	$fields = array ();
	foreach ( $rows as $row ) {
		$fields [] = $row [0];
	}
	
	$sql = "
		SELECT	id
				, `" . implode ( "`
				, `", $fields ) . "`
				, DATE_FORMAT(datetime, '%m/%d/%Y %l:%i %p') datetime
		FROM	`" . CURAH2O_TABLE . "`
		WHERE	id = $id
	";
	return $wpdb->get_row ( $sql, ARRAY_A );
}
function cura_add_entry($params = array()) {
	global $wpdb;
	
	foreach ( $params as $k => $v ) {
		if (is_null ( $v )) {
			$values [] = "`$k` = NULL";
		} else {
			$values [] = "`$k` = '" . addslashes ( $v ) . "'";
		}
	}
	$sql = "INSERT INTO `" . CURAH2O_TABLE . "` SET
	" . implode ( "
			, ", $values );
	$affectedRows = $wpdb->query ( $sql );
	
	$entry = cura_get_entry ( $wpdb->insert_id );
	return array (
			'affectedRows' => $affectedRows,
			'data' => $entry,
			'insertId' => $wpdb->insert_id 
	);
}
function cura_update_entry($id, $params) {
	global $wpdb;
	
	$id = intval ( $id );
	foreach ( $params as $k => $v ) {
		if ('' === $v) {
			$values [] = "`$k` = NULL";
		} else {
			$values [] = "`$k` = '" . addslashes ( $v ) . "'";
		}
	}
	$sql = "UPDATE `" . CURAH2O_TABLE . "` SET
	" . implode ( "
			, ", $values ) . "
			WHERE	id = $id";
	$affectedRows = $wpdb->query ( $sql );
	
	$entry = cura_get_entry ( $id );
	return array (
			'affectedRows' => $affectedRows,
			'data' => $entry,
			'insertId' => 0 
	);
}
function cura_delete_entry($id) {
	global $wpdb;
	
	$id = intval ( $id );
	$sql = "DELETE FROM `" . CURAH2O_TABLE . "` WHERE id = $id";
	
	$affectedRows = $wpdb->query ( $sql );
	return $affectedRows;
}
function cura_get_observations($params = array()) {
	global $wpdb;
	
	$filters = ( array ) $params ['filters'];
	$sql_filter = array ();
	foreach ( $filters as $filter ) {
		$sql_filter [] = sprintf ( "%s = '%s'", 		//
		preg_match ( '/([^.]+)\.([^.]+)?/', $filter ['field'], $m ) ? 		//
		"$m[1].`$m[2]`" : "`$filter[field]`", 		//
		addslashes ( $filter ['value'] ) );
	}
	
	// The fields order is important
	$rows = cura_fields ();
	$fields = array ();
	foreach ( $rows as $row ) {
		$fields [] = $row [0];
	}
	
	$sql = "
		SELECT	a.id
				, a.`" . implode ( "`
				, a.`", $fields ) . "`
				, DATE_FORMAT(datetime, '%m/%d/%Y %l:%i %p') datetime
		FROM	`" . CURAH2O_TABLE . "` AS a
		LEFT JOIN
				`" . CURAH2O_TABLE_LOCATION . "` AS b
			ON	a.watershed_name = b.watershed_name
		WHERE	1" . (empty ( $sql_filter ) ? "" : "
			AND	" . implode ( "
			AND	", $sql_filter )) . "
	";
	$objs = $wpdb->get_results ( $sql );
	
	foreach ( $objs as $obj ) {
		foreach ( $obj as &$value ) {
			is_numeric ( $value ) && $value = floatval ( $value );
		}
	}
	
	return $objs;
}
function cura_get_locations() {
	global $wpdb;
	
	$sql = "
		SELECT	id, watershed_name, count
		FROM	`" . CURAH2O_TABLE_LOCATION . "`
		WHERE	1
		ORDER BY
				count DESC
	";
	$rows = $wpdb->get_results ( $sql, ARRAY_A );
	
	foreach ( $rows as &$row ) {
		$row ['id'] = intval ( $row ['id'] );
		$row ['count'] = intval ( $row ['count'] );
	}
	
	return $rows;
}
function cura_update_locations() {
	global $wpdb;
	
	$sql = "TRUNCATE TABLE `" . CURAH2O_TABLE_LOCATION . "`";
	$wpdb->query ( $sql );
	
	$sql = "
		INSERT INTO
			`" . CURAH2O_TABLE_LOCATION . "` (
				watershed_name,
				count
			)
		SELECT	a.watershed_name, count(*)
		FROM	`" . CURAH2O_TABLE . "` a
		LEFT JOIN
				`" . CURAH2O_TABLE_LOCATION . "` b
			ON	a.watershed_name = b.watershed_name
		WHERE	b.id IS NULL
		GROUP BY
				a.watershed_name
	";
	$wpdb->query ( $sql );
}
function cura_update_location($watershed_name) {
	global $wpdb;
	
	$sql = "
		SELECT	watershed_name
		FROM	`" . CURAH2O_TABLE_LOCATION . "`
		WHERE	watershed_name = '" . addslashes ( $watershed_name ) . "'
		LIMIT	1
	";
	$row = $wpdb->get_row ( $sql, ARRAY_A );
	
	if ($row) {
		$sql = "
			SELECT	count(*)
			FROM	`" . CURAH2O_TABLE . "`
			WHERE	watershed_name = '" . addslashes ( $watershed_name ) . "'
		";
		$count = $wpdb->get_var ( $sql );
		
		$sql = "
			UPDATE	`" . CURAH2O_TABLE_LOCATION . "`
			SET		count = $count
			WHERE	watershed_name = '" . addslashes ( $watershed_name ) . "'
			LIMIT	1
		";
		$wpdb->query ( $sql );
		
		$sql = "
			DELETE FROM
					`" . CURAH2O_TABLE_LOCATION . "`
			WHERE	count = 0
		";
		$wpdb->query ( $sql );
	} else {
		$sql = "
			INSERT INTO
			`" . CURAH2O_TABLE_LOCATION . "`
			SET		count = 1
			, watershed_name = '" . addslashes ( $watershed_name ) . "'
		";
		$wpdb->query ( $sql );
	}
}
function cura_get_typeaheads() {
	global $wpdb;
	
	$sql = "
		SELECT	location_id
				, station_name
				, watershed_name
		FROM	`" . CURAH2O_TABLE . "`
		WHERE	1
		GROUP BY
				watershed_name, location_id, station_name
	";
	return $wpdb->get_results ( $sql, ARRAY_A );
}









