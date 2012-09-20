<?php
global $cura_fields;
$cura_fields = array (
		array (
				"field" => "watershed_name",
				"demo" => "",
				"description" => "Watershed Name",
				"visible" => 1,
				"validation" => array (
						"rules" => array (
								"required" => true 
						) 
				) 
		),
		array (
				"field" => "station_name",
				"demo" => "",
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
				"demo" => "Letters and numbers",
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
				"demo" => date ( "m/d/Y H:i A" ),
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
				"demo" => "",
				"description" => "Latitude",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => - 90,
								"max" => 90 
						),
						"message" => "Latitude decimal degrees, -90 ~ 90" 
				) 
		),
		array (
				"field" => "longitude",
				"demo" => "",
				"description" => "Longitude",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => - 180,
								"max" => 180 
						),
						"message" => "Longitude decimal degrees, -180 ~ 180" 
				) 
		),
		array (
				"field" => "do_mgl",
				"demo" => "0-15",
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
				"demo" => "0-110",
				"description" => "DO (%) ",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 0,
								"max" => 110 
						),
						"message" => "A value between 0 and 110 calculated based on amount of oxygen in the water at the given temperature" 
				) 
		),
		array (
				"field" => "cond",
				"demo" => "0-1500",
				"description" => "Cond. (uS/cm)",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 0,
								"max" => 1500 
						),
						"message" => "A value between 0 and 1500" 
				) 
		),
		array (
				"field" => "salinity",
				"demo" => "0-1",
				"description" => "Salinity (ppt)",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 0,
								"max" => 1 
						),
						"message" => "A value between 0 and 1" 
				) 
		),
		array (
				"field" => "temp",
				"demo" => "0-30",
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
				"demo" => "4-8",
				"description" => "pH",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"min" => 4,
								"max" => 8 
						),
						"message" => "A value between 4 and 8" 
				) 
		),
		array (
				"field" => "secchi_a",
				"demo" => "0-20",
				"description" => "Secchi Disc Reading A",
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
				"demo" => "between A+/-2",
				"description" => "Secchi Disc Reading B",
				"validation" => array (
						"rules" => array (
								"number" => true,
								"secchi_b" => true 
						),
						"message" => "A value that should not exceed +/- 2 meters from reading A" 
				) 
		),
		array (
				"field" => "secchi_d",
				"demo" => "average A and B",
				"description" => "Secchi Disc Depth",
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
				"demo" => "",
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
				"demo" => "",
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
				"demo" => "0-40",
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
				"demo" => "0-4",
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
				"demo" => "",
				"description" => "Coliform",
				"validation" => array (
						"rules" => array (
								"pattern" => "/^(Present|Absent)$/" 
						),
						"message" => "Invalid value, should be Present or Absent" 
				) 
		) 
);