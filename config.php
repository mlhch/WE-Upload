<?php
global $cura_fields;
$cura_fields = array (
		array (
				"field" => "watershed_name",
				"placeHolder" => "",
				"description" => "Community group Name",
				"visible" => 1,
				"validation" => array (
						"rules" => array (
								"required" => true 
						) 
				) 
		),
		array (
				"field" => "station_name",
				"placeHolder" => "",
				"description" => "Station Name",
				"visible" => 1,
				"validation" => array (
						"rules" => array (
								"required" => true 
						) 
				) 
		),
		array (
				"field" => "location_id",
				"placeHolder" => "Letters and numbers",
				"description" => "Location ID",
				"visible" => 1,
				"validation" => array (
						"rules" => array (
								"required" => true 
						) 
				) 
		),
		array (
				"field" => "datetime",
				"placeHolder" => '',
				"description" => "Date and Time",
				"visible" => 1,
				"validation" => array (
						"rules" => array (
								"pattern" => "/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} [AP]M$/" 
						),
						"message" => "Invalid date format, it should like " . date ( "m/d/Y H:i A" ) 
				) 
		),
		array (
				"field" => "latitude",
				"placeHolder" => "-90 ~ 90",
				"description" => "Latitude",
				"validation" => array (
						"rules" => array (
								"pattern" => "/(^[^.]+|\.\d{5})$/",
								"required" => true,
								"number" => true,
								"min" => - 90,
								"max" => 90
						),
						"messages" => array (
								"pattern" => "Precision of 5 decimal places is required",
								"required" => "Latitude decimal degrees, -90 ~ 90",
								"number" => "Latitude decimal degrees, -90 ~ 90",
								"min" => "Latitude decimal degrees, -90 ~ 90",
								"max" => "Latitude decimal degrees, -90 ~ 90" 
						) 
				) 
		),
		array (
				"field" => "longitude",
				"placeHolder" => "-180 ~ 180",
				"description" => "Longitude",
				"validation" => array (
						"rules" => array (
								"pattern" => "/(^[^.]+|\.\d{5})$/",
								"required" => true,
								"number" => true,
								"min" => - 180,
								"max" => 180
						),
						"messages" => array (
								"pattern" => "Precision of 5 decimal places is required",
								"required" => "Longitude decimal degrees, -180 ~ 180",
								"number" => "Longitude decimal degrees, -180 ~ 180",
								"min" => "Longitude decimal degrees, -180 ~ 180",
								"max" => "Longitude decimal degrees, -180 ~ 180" 
						) 
				) 
		),
		array (
				"field" => "do_mgl",
				"placeHolder" => "0 ~ 15",
				"description" => "DO (mg/L)",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 0,
								"max" => 15 
						),
						"message" => "Typical observed values range from 0-15 mg/l. Values below 7 are not optimal but should be accepted. D.O. is  obviously dependent on temperature (expect lower values with increased temperatures)." 
				) 
		),
		array (
				"field" => "do_%",
				"placeHolder" => "1 ~ 130",
				"description" => "DO (%)",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 1,
								"max" => 130 
						),
						"message" => "A value between 0 and 130 calculated based on amount of oxygen in the water at the given temperature" 
				) 
		),
		array (
				"field" => "cond",
				"placeHolder" => "0 ~ 55000",
				"description" => "S. Cond. (µS/cm)",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 0,
								"max" => 55000 
						),
						"message" => "A value between 0 and 55000" 
				) 
		),
		array (
				"field" => "salinity",
				"placeHolder" => "0 ~ 55",
				"description" => "Salinity (ppt)",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 0,
								"max" => 55 
						),
						"message" => "A value between 0 and 55" 
				) 
		),
		array (
				"field" => "temp",
				"placeHolder" => "0 ~ 30",
				"description" => "Water Temp. (⁰C)",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 0,
								"max" => 30 
						),
						"message" => "A value between 0 and 30" 
				) 
		),
		array (
				"field" => "air_temp",
				"placeHolder" => "-40 ~ 45",
				"description" => "Air Temp. (⁰C)",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => -40,
								"max" => 45 
						),
						"message" => "A value between -40 and 45" 
				) 
		),
		array (
				"field" => "ph",
				"placeHolder" => "3 ~ 10",
				"description" => "pH",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 3,
								"max" => 10 
						),
						"message" => "A value between 3 and 10" 
				) 
		),
		array (
				"field" => "secchi_a",
				"placeHolder" => "0 ~ 20",
				"description" => "Secchi Disc Reading A (m)",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 0,
								"max" => 20 
						),
						"message" => "A value between 0 and 20" 
				) 
		),
		array (
				"field" => "secchi_b",
				"placeHolder" => "between A +/- 4",
				"description" => "Secchi Disc Reading B (m)",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"secchi_b" => true 
						),
						"message" => "A value that should not exceed +/- 4 meters from reading A" 
				) 
		),
		array (
				"field" => "secchi_d",
				"placeHolder" => "average A and B",
				"description" => "Secchi Disc Depth (m)",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"secchi_d" => true 
						),
						"message" => "A value which equals the average of reding a and b" 
				) 
		),
		array (
				"field" => "lab_sample",
				"placeHolder" => "",
				"description" => "Lab Sample",
				"validation" => array (
						"rules" => array (
								"pattern" => "/^(Y|N)$/" 
						),
						"message" => "Invalid value, should be Y or N" 
				) 
		),
		array (
				"field" => "lab_id",
				"placeHolder" => "",
				"description" => "Lab Id",
				"validation" => array (
						"rules" => array (
								"pattern" => "/^\d+$/" 
						),
						"message" => "Invalid integer value" 
				) 
		),
		array (
				"field" => "nitrate",
				"placeHolder" => "0 ~ 40",
				"description" => "Nitrate Count",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 0,
								"max" => 40 
						),
						"message" => "A value between 0 and 40" 
				) 
		),
		array (
				"field" => "phosphate",
				"placeHolder" => "0 ~ 4",
				"description" => "Phosphate Count",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 0,
								"max" => 4 
						),
						"message" => "A value between 0 and 4" 
				) 
		),
		array (
				"field" => "coliform",
				"placeHolder" => "",
				"description" => "Coliform",
				"validation" => array (
						"rules" => array (
								"pattern" => "/^(Present|Absent)$/" 
						),
						"message" => "Invalid value, should be Present or Absent" 
				) 
		),
		array (
				"field" => "note",
				"placeHolder" => "",
				"description" => "Note",
				"validation" => array (
						"rules" => array (
								"maxlength" => 200
						),
						"message" => "200 characters max" 
				) 
		) 
);