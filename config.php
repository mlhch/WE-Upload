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
				"placeHolder" => date ( "m/d/Y H:i A" ),
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
				"placeHolder" => "40 ~ 65",
				"description" => "Latitude",
				"validation" => array (
						"rules" => array (
								"pattern" => "/(^[^.]+|\.\d{5})$/",
								"required" => true,
								"number" => true,
								"min" => 40,
								"max" => 65 
						),
						"messages" => array (
								"pattern" => "Precision of 5 decimal places is required",
								"required" => "Latitude decimal degrees, 40 ~ 65",
								"number" => "Latitude decimal degrees, 40 ~ 65",
								"min" => "Latitude decimal degrees, 40 ~ 65",
								"max" => "Latitude decimal degrees, 40 ~ 65" 
						) 
				) 
		),
		array (
				"field" => "longitude",
				"placeHolder" => "-130 ~ -53",
				"description" => "Longitude",
				"validation" => array (
						"rules" => array (
								"pattern" => "/(^[^.]+|\.\d{5})$/",
								"required" => true,
								"number" => true,
								"min" => - 130,
								"max" => - 53 
						),
						"messages" => array (
								"pattern" => "Precision of 5 decimal places is required",
								"required" => "Longitude decimal degrees, -130 ~ -53",
								"number" => "Longitude decimal degrees, -130 ~ -53",
								"min" => "Longitude decimal degrees, -130 ~ -53",
								"max" => "Longitude decimal degrees, -130 ~ -53" 
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
				"placeHolder" => "1 ~ 120",
				"description" => "DO (%) ",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 1,
								"max" => 120 
						),
						"message" => "A value between 0 and 120 calculated based on amount of oxygen in the water at the given temperature" 
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
				"description" => "Temp. (⁰C)",
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
		) 
);