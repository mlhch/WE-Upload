<?php
function cura_request() {
    $phpInput = file_get_contents('php://input');
    if (get_magic_quotes_gpc()) {
        $phpInput = stripslashes($phpInput);
    }
    
    return json_decode($phpInput);
}
function cura_json_features() {
    $objs = cura_get_features();
    $fc = array(
        'type' => 'FeatureCollection',
        'features' => array()
    );
    
    foreach ($objs as $key => $obj) {
        $fc['features'][] = array(
            'type' => 'Feature',
            'properties' => $obj,
            'geometry' => array(
                'type' => 'Point',
                'coordinates' => array(
                    $obj->longitude,
                    $obj->latitude
                )
            )
        );
        unset($obj->latitude);
        unset($obj->longitude);
    }
    echo json_encode($fc);
    exit(0);
}
function cura_json_feature() {
    $request = cura_request();
    $obj = cura_get_feature($request->watershed_name, $request->location_id);
    if ($obj->watershed_name) {
        $feature = array(
            'type' => 'Feature',
            'properties' => $obj,
            'geometry' => array(
                'type' => 'Point',
                'coordinates' => array(
                    $obj->longitude,
                    $obj->latitude
                )
            )
        );
        unset($obj->latitude);
        unset($obj->longitude);
    } else {
        $feature = array(
            'type' => null,
        );
    }
    echo json_encode($feature);
    exit(0);
}
/*
 * Service Call
*/
function cura_services() {
    $service = cura_get_services();
    $servicelist = array(
        array(
            "id" => 1,
            "title" => get_option('cura_title') ,
            "keywords" => get_option('cura_keywords') ,
            "providername" => get_option('cura_providername') ,
            "website" => get_option('cura_website') ,
            "description" => get_option('cura_description') ,
            "authorname" => get_option('cura_title') ,
            "title" => get_option('cura_authorname') ,
            "type" => get_option('cura_type') ,
            "contact" => get_option('cura_contact') ,
            'time' => array(
                'begintime' => $service->begintime,
                'endtime' => $service->endtime
            ) ,
            'bbox' => array(
                'upperright' => array(
                    'latitude' => $service->upper,
                    'longitude' => $service->right
                ) ,
                'bottomleft' => array(
                    'latitude' => $service->bottom,
                    'longitude' => $service->left
                )
            )
        )
    );
    $result = array(
        'servicelist' => $servicelist
    );
    echo json_encode($result);
    exit(0);
}
/*
 * Layer Call
*/
function cura_service_layers() {
    $layers = cura_get_layers();
    $layerlist = array();
    
    foreach ($layers as $obj) {
        $layerlist[] = array(
            'id' => intval($obj->id) ,
            'name' => $obj->name,
            'time' => array(
                'begintime' => $obj->begintime,
                'endtime' => $obj->endtime
            ) ,
            'bbox' => array(
                'upperright' => array(
                    'latitude' => $obj->upper,
                    'longitude' => $obj->right
                ) ,
                'bottomleft' => array(
                    'latitude' => $obj->bottom,
                    'longitude' => $obj->left
                )
            )
        );
    }
    $result = array(
        'layerlist' => $layerlist
    );
    echo json_encode($result);
    exit(0);
}
/*
 * Ajax - config.json
*/
function cura_json_config() {
    $fields = cura_fields();
    echo json_encode(array(
        'canEdit' => current_user_can('cura-edit') ,
        'canDelete' => current_user_can('cura-delete') ,
        'canAdd' => 1,
        'canImport' => current_user_can('cura-import') ,
        'locations' => cura_get_locations() ,
        'fields' => $fields,
        'pluginUrl' => CURAH2O_PLUGIN_URL,
        'validationOptions' => cura_validation_options() ,
    ));
    exit();
}
/*
 * Ajax - locations.json
*/
function cura_json_locations() {
    if (isset($_REQUEST['refresh'])) {
        cura_update_locations();
    }
    $locations = cura_get_locations();
    echo json_encode($locations);
    exit();
}
/*
 * Ajax - typeaheads.json
*/
function cura_json_typeaheads_watershed_name() {
    $rows = cura_get_typeaheads_of_watershed();
    echo json_encode($rows);
    exit(0);
}
function cura_json_typeaheads_station_name() {
    $watershed = isset($_REQUEST['watershed']) ? $_REQUEST['watershed'] : '';
    $rows = cura_get_typeaheads_of_station($watershed);
    echo json_encode($rows);
    exit(0);
}
function cura_json_typeaheads_location_id() {
    $watershed = isset($_REQUEST['watershed']) ? $_REQUEST['watershed'] : '';
    $station = isset($_REQUEST['station']) ? $_REQUEST['station'] : '';
    $rows = cura_get_typeaheads_of_locationid($watershed, $station);
    echo json_encode($rows);
    exit(0);
}
/*
 * Ajax - observations.json
*/
function cura_json_observations() {
    if (!empty($_REQUEST['downloadPhoto'])) {
        $request = json_decode(stripslashes($_REQUEST['downloadPhoto']));
    } else {
        $request = cura_request();
    }
    // making root as Array is for ngResource
    $observations = cura_get_observations($request);
    $pm = cura_photo_manager();
    
    foreach ($observations as & $_row) {
        $pm->setId($row->id);
        $_row->photos = $pm->get(false);
    }
    if (!empty($_REQUEST['downloadPhoto'])) {
        if ($request->locationIds) {
            $surfix = array();
            foreach ($request->locationIds as $row) {
                $surfix[] = "$row[1]($row[0])";
            }
            $surfix = count($surfix) > 1 ? 'multiple-selected' : $surfix[0];
        } else {
            $surfix = preg_replace('/\s/', '-', strtolower($request->location->watershed_name));
        }
        $dlname = "water-quality-$surfix";
        $filename = cura_photo_path() . 'tmp.zip';
        ob_start();
        cura_observations_csv($observations, 'php://output');
        $csv = ob_get_clean();
        if (!file_exists($filename)) {
            $zip = new ZipArchive();
            if ($zip->open($filename, ZipArchive::CREATE) !== true) {
                echo 'Create zip file error';
                exit;
            }
            $zip->addFromString("$dlname.csv", $csv);
            
            foreach ($observations as $row) {
                $dir = cura_photo_path($row->id);
                if (is_dir($dir)) {
                    $files = scandir($dir, 1);
                    
                    foreach ($files as $file) {
                        if ($file[0] != '.' && is_file($dir . $file)) {
                            $type = preg_replace('/^.*\./', '', $file);
                            $datetime = date('Y-m-d_H.i', strtotime($row->datetime));
                            $zip->addFile("$dir$file", "photos/{$row->id}_$datetime.$type");
                            break;
                        }
                    }
                }
            }
            $zip->close();
        }
        header("Content-Type: application/x-zip-compressed; charset=utf-8");
        header('Content-Description: File Transfer');
        header("content-Disposition: attachment; filename=$dlname.zip");
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($filename));
        set_time_limit(0);
        $fp = @fopen($filename, "rb");
        
        while (!feof($fp)) {
            print (@fread($fp, 1024 * 8));
            ob_flush();
            flush();
        }
        fclose($fp);
        unlink($filename);
    } else {
        echo json_encode($observations);
    }
    exit(0);
}
function cura_action_photo() {
    $id = 0;
    if (isset($_GET['id']) && intval($_GET['id']) > 0) {
        $path = $id = intval($_GET['id']);
    } elseif ($uid = get_current_user_id()) {
        $path = "user-$uid";
    } else {
        $path = "guest-" . (isset($_GET['guest']) ? $_GET['guest'] : 0);
    }
    cura_photo_manager($id, $path, true);
    exit;
}
/*
 * Ajax - save
*/
function cura_action_save() {
    $params = (array)cura_request();
    if (empty($params['datetime'])) {
        $params['datetime'] = date('Y-m-d H:i:s');
    } else {
        $params['datetime'] = date('Y-m-d H:i:s', strtotime($params['datetime']));
    }
    $values = array();
    if (empty($params['id'])) {
        unset($params['id']);
        $result = cura_add_entry($params);
        $id = 0;
        cura_update_layers();
    } else {
        cura_check_capability('cura-edit');
        $id = intval($params['id']);
        unset($params['id']);
        $oldEntry = cura_get_entry($id);
        $result = cura_update_entry($id, $params);
        $test = array(
            'datetime',
            'latitude',
            'longitude'
        );
        $diff = array_diff_assoc($result['data'], $oldEntry);
        $diff = array_intersect($test, array_keys($diff));
        if (!empty($diff)) {
            cura_update_layers();
        }
        if ($result['data']->watershed_name != $oldEntry->watershed_name) {
            cura_update_location($oldEntry->watershed_name);
        }
    }
    cura_update_location($result['data']->watershed_name);
    if ($result['insertId']) {
        $old_mask = umask(0);
        mkdir(cura_photo_path($result['insertId']) , 0755, true);
        umask($old_mask);
        exec('mv ' . cura_photo_path(0) . '* ' . cura_photo_path($result['insertId']));
    }
    echo json_encode(array(
        'affectedRows' => $result['affectedRows'],
        'id' => $id,
        'insertId' => $result['insertId'],
        'data' => $result['data']
    ));
    exit();
}
/*
 * Ajax - delete
*/
function cura_action_delete() {
    cura_check_capability('cura-delete');
    $request = cura_request();
    $id = intval($request->id);
    $entry = cura_get_entry($id);
    if ($affectedRows = cura_delete_entry($id)) {
        $pm = cura_photo_manager($id);
        $pm->delete_all();
        cura_update_location($entry->watershed_name);
        cura_update_layers();
    }
    echo json_encode(array(
        'affectedRows' => $affectedRows,
        'id' => $id,
        'data' => $request
    ));
    exit();
}
function cura_action_import() {
    $error = '';
    $deleted = 0;
    $added = 0;
    $capability = 'cura-import';
    if (!current_user_can($capability)) {
        $error = 'You don\'t have "' . $capability . '" capability';
    }
    if (empty($error) && !empty($_FILES['csvData']['name'])) {
        if (false !== ($fp = fopen($_FILES['csvData']['tmp_name'], 'r'))) {
            $headers = array();
            $locations = array();
            
            while (false !== ($row = fgetcsv($fp))) {
                if (empty($headers)) {
                    if ($row[0] != 'id') {
                        $error = 'No header information';
                        break;
                    } else {
                        $map = array(
                            'id' => 'id'
                        );
                        $fields = cura_fields();
                        
                        foreach ($fields as $field) {
                            $map[$field[2]] = $field[0];
                        }
                        
                        foreach ($row as $key => $value) {
                            $headers[$key] = $map[trim($value) ];
                        }
                        continue;
                    }
                }
                $p = array_combine($headers, $row);
                unset($p['id']);
                $p['datetime'] = date('Y-m-d H:i:s', strtotime($p['datetime']));
                $deleted+= cura_delete_entries($p['watershed_name'], $p['station_name'], $p['location_id'], $p['datetime']);
                $result = cura_add_entry($p);
                $added+= $result['affectedRows'];
                $locations[$p['watershed_name']] = $p['watershed_name'];
            }
            fclose($fp);
            
            foreach ($locations as $location) {
                cura_update_location($location);
            }
            cura_update_layers();
        }
    }
    if (!empty($error)) {
        echo '<script>alert("Error: ' . addslashes($error) . '")</script>';
    } else {
        echo "<script>alert('$deleted deleted, $added added')</script>";
        echo "<script>top.curaCallback()</script>";
    }
    exit();
}
function cura_check_capability($capability) {
    if (!current_user_can($capability)) {
        echo json_encode(array(
            'error' => 'You don\'t have "' . $capability . '" capability'
        ));
        exit(0);
    }
}
/*
 *
*/
function cura_service_getdata($request) {
    $layerid = intval($request->layerid);
    $layer = cura_get_layer_by_id($layerid);
    $result = array(
        'serviceid' => $request->serviceid,
        'layerid' => $request->layerid,
        'layername' => $layer->name
    );
    $objs = cura_get_data($layer->name, $request->time, $request->bbox);
    $readings = array();
    
    foreach ($objs as $obj) {
        $name = "$obj->station_name($obj->location_id)[$obj->watershed_name]";
        if (!isset($readings[$name])) {
            $readings[$name] = array(
                'name' => $obj->station_name,
                'id' => $obj->location_id,
                'group' => $obj->watershed_name,
                'lon' => $obj->lon,
                'lat' => $obj->lat
            );
        }
        $readings[$name]['readings'][] = array(
            'time' => $obj->datetime,
            'value' => $obj->value
        );
    }
    $result['data'] = array_values($readings);
    
    return $result;
}
function cura_demo_servicecall() {
?>
<script type='text/javascript'
    src='<?php
    echo home_url() ?>/wp-includes/js/jquery/jquery.js?ver=1.7.2'></script>
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
    exit(0);
}
function cura_demo_layercall() {
?>
<script type='text/javascript'
    src='<?php
    echo home_url() ?>/wp-includes/js/jquery/jquery.js?ver=1.7.2'></script>
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
    exit(0);
}
function cura_demo_datacall() {
?>
<script type='text/javascript'
    src='<?php
    echo home_url() ?>/wp-includes/js/jquery/jquery.js?ver=1.7.2'></script>
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
        "begintime" : "<?php
    echo date('Y-m-d H:i:s', strtotime('last month')) ?>",
        "endtime" : "<?php
    echo date('Y-m-d H:i:s', strtotime('+8 hours')) ?>" 
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
    exit(0);
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
    $affectedRows = $wpdb->query($sql);
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
