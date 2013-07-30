<?php
function cura_fields() {
    global $cura_fields;
    static $fields = null;
    if ($fields) {
        
        return $fields;
    }
    $fields = array();
    
    foreach ($cura_fields as $i => $row) {
        $fields[] = array(
            $row['field'],
            $row['placeHolder'],
            $row['description'],
            $i + 1, // a default serial for the UI form
            isset($row['visible']) ? 1 : 0,
            isset($row['pattern']) ? $row['pattern'] : ''
        );
    }
    
    return $fields;
}
function cura_validation_options() {
    global $cura_fields;
    $validation_options = array();
    
    foreach ($cura_fields as $i => $row) {
        if (!empty($row['validation'])) {
            $validation_options['rules'][$row['field']] = $row['validation']['rules'];
            if (!empty($row['validation']['message'])) {
                $validation_options['messages'][$row['field']] = $row['validation']['message'];
            }
            if (!empty($row['validation']['messages'])) {
                $validation_options['messages'][$row['field']] = $row['validation']['messages'];
            }
        }
    }
    
    return $validation_options;
}
function cura_validation_pattern($value, $pattern) {
    
    return 0 !== preg_match($pattern, $value);
}
function cura_validation_secchi_b($value, $ruleParam, $values) {
    
    return abs($values['secchi_a'] - $values['secchi_b']) <= 4;
}
function cura_validation_secchi_d($value, $ruleParam, $values) {
    
    return ($values['secchi_a'] + $values['secchi_b']) == ($value + $value);
}
/*
 * Service, Layer, Data Call
*/
function cura_get_services() {
    global $wpdb;
    $sql = "
        SELECT  DATE_FORMAT(MIN(`begintime`), '%Y-%m-%dT%H:%i:%sZ') `begintime`
                , DATE_FORMAT(MAX(`endtime`), '%Y-%m-%dT%H:%i:%sZ') `endtime`
                , MAX(`upper`) `upper`
                , MAX(`right`) `right`
                , MIN(`bottom`) `bottom`
                , MIN(`left`) `left`
        FROM    `" . CURAH2O_TABLE_LAYERS . "`
        WHERE   TRUE
    ";
    $obj = $wpdb->get_row($sql);
    $obj->upper = floatval($obj->upper);
    $obj->right = floatval($obj->right);
    $obj->bottom = floatval($obj->bottom);
    $obj->left = floatval($obj->left);
    
    return $obj;
}
function cura_get_layers() {
    global $wpdb;
    $sql = "
        SELECT  `id`
                , `name`
                , DATE_FORMAT(`begintime`, '%Y-%m-%dT%H:%i:%sZ') `begintime`
                , DATE_FORMAT(`endtime`, '%Y-%m-%dT%H:%i:%sZ') `endtime`
                , `upper`
                , `right`
                , `bottom`
                , `left`
                , `total`   
        FROM    `" . CURAH2O_TABLE_LAYERS . "`
        WHERE   TRUE
    ";
    $objs = $wpdb->get_results($sql);
    
    foreach ($objs as $obj) {
        $obj->upper = floatval($obj->upper);
        $obj->right = floatval($obj->right);
        $obj->bottom = floatval($obj->bottom);
        $obj->left = floatval($obj->left);
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
        SELECT  a.`datetime`
                , a.`$field` `value`
                , a.`latitude` `lat`
                , a.`longitude` `lon`
                , a.`station_name`
                , a.`location_id`
                , a.`watershed_name`
        FROM    `" . CURAH2O_TABLE . "` AS a
        WHERE   `$field` IS NOT NULL
            AND `datetime` >= '$begintime'
            AND `datetime` <= '$endtime'
            AND `latitude` <= '$upper'
            AND `latitude` >= '$bottom'
            AND `longitude` <= '$right'
            AND `longitude` >= '$left'
    ";
    $objs = $wpdb->get_results($sql);
    
    foreach ($objs as $obj) {
        $obj->value = floatval($obj->value);
        $obj->lat = floatval($obj->lat);
        $obj->lon = floatval($obj->lon);
    }
    
    return $objs;
}
function cura_get_features() {
    global $wpdb;
    $sql = "
        SELECT  a.watershed_name
                , a.station_name
                , a.location_id
                , a.latitude
                , a.longitude
                , b.startDate
                , b.endDate
        FROM    (
            SELECT  MAX(id) id
                    , DATE_FORMAT(MIN(datetime), '%m/%d/%Y %h:%i %p') startDate
                    , DATE_FORMAT(MAX(datetime), '%m/%d/%Y %h:%i %p') endDate
            FROM    `" . CURAH2O_TABLE . "`
            WHERE   `latitude` IS NOT NULL
                AND `longitude` IS NOT NULL
            GROUP BY
                    watershed_name, location_id
        ) AS b
        JOIN    `" . CURAH2O_TABLE . "` AS a
            ON  a.id = b.id
    ";
    
    return $wpdb->get_results($sql);
}
function cura_get_feature($watershed_name, $location_id) {
    global $wpdb;
    $sql = "
        SELECT  MAX(id) id
                , DATE_FORMAT(MIN(datetime), '%m/%d/%Y %h:%i %p') startDate
                , DATE_FORMAT(MAX(datetime), '%m/%d/%Y %h:%i %p') endDate
        FROM    `" . CURAH2O_TABLE . "`
        WHERE   `latitude` IS NOT NULL
            AND `longitude` IS NOT NULL
            AND watershed_name = '" . addslashes($watershed_name) . "'
            AND location_id = '" . addslashes($location_id) . "'
    ";
    $sql = "
        SELECT  watershed_name
                , station_name
                , location_id
                , latitude
                , longitude
                , startDate
                , endDate
        FROM    `" . CURAH2O_TABLE . "` AS a
        JOIN    ($sql) t
            ON  a.id = t.id
    ";
    
    return $wpdb->get_row($sql);
}
function cura_update_layers() {
    global $wpdb;
    static $ignored_fields = null;
    if (!isset($ignored_fields)) {
        $ignored_fields = array_flip(array(
            'id',
            'location_id',
            'station_name',
            'watershed_name',
            'datetime',
            'latitude',
            'longitude',
            'lab_sample'
        ));
    }
    $fields = cura_table_info(CURAH2O_TABLE);
    
    foreach ($fields as $obj) {
        $field = $obj->Field;
        if (isset($ignored_fields[$field])) {
            continue;
        }
        $sql = "
            SELECT  MIN(datetime) `begintime`
                    , MAX(datetime) `endtime`
                    , MAX(latitude) `upper`
                    , MAX(longitude) `right`
                    , MIN(latitude) `bottom`
                    , MIN(longitude) `left`
            FROM    `" . CURAH2O_TABLE . "`
                    WHERE   `$field` IS NOT NULL
        ";
        $row = $wpdb->get_row($sql);
        $values = array();
        
        foreach ($row as $key => $value) {
            if (!is_null($value)) {
                $values[] = "`$key` = '" . addslashes($value) . "'";
            }
        }
        $layer = cura_get_layer_by_name($field);
        if (!$layer) {
            $sql = "
                INSERT INTO
                        `" . CURAH2O_TABLE_LAYERS . "`
                SET     `name` = '" . addslashes($field) . "'" . //
            (empty($values) ? "" : "
                        , " . implode("
                        , ", $values)) . "
            ";
            $wpdb->query($sql);
        } elseif (!empty($value)) {
            $sql = "
                UPDATE  `" . CURAH2O_TABLE_LAYERS . "`
                SET     " . implode("
                        , ", $values) . "
                WHERE   `name` = '" . addslashes($field) . "'
            ";
            $wpdb->query($sql);
        }
    }
}
function cura_get_layer_by_id($id) {
    global $wpdb;
    $sql = "
        SELECT  id, name
                , begintime, endtime
                , `upper`, `right`, `bottom`, `left`
        FROM    `" . CURAH2O_TABLE_LAYERS . "`
        WHERE   id = " . intval($id) . "
    ";
    
    return $wpdb->get_row($sql);
}
function cura_get_layer_by_name($name) {
    global $wpdb;
    $sql = "
        SELECT  id, name
                , begintime, endtime
                , `upper`, `right`, `bottom`, `left`
        FROM    `" . CURAH2O_TABLE_LAYERS . "`
        WHERE   name = '" . addslashes($name) . "'
    ";
    
    return $wpdb->get_row($sql);
}
/*
 * Table information
*/
function cura_table_info($tbname) {
    global $wpdb;
    $sql = "DESCRIBE `" . addslashes($tbname) . "`";
    
    return $wpdb->get_results($sql);
}
function cura_entry_info($id) {
    global $wpdb;
    $id = intval($id);
    $sql = "
        SELECT  DATE_FORMAT(MIN(a.datetime), '%m/%d/%Y %h:%i %p') startDate
                , DATE_FORMAT(MAX(a.datetime), '%m/%d/%Y %h:%i %p') endDate
        FROM    (
            SELECT  watershed_name, station_name, location_id
            FROM    `" . CURAH2O_TABLE . "`
            WHERE   id = $id
        ) AS b
        JOIN    `" . CURAH2O_TABLE . "` AS a
            ON  a.watershed_name = b.watershed_name
            AND a.station_name = b.station_name
            AND a.location_id = b.location_id
        GROUP BY
                a.watershed_name, a.station_name, a.location_id
    ";
    
    return $wpdb->get_row($sql);
}
/*
 * get/add/update/delete entry
*/
function cura_get_entry($id) {
    global $wpdb;
    $id = intval($id);
    // The fields order is important
    $rows = cura_fields();
    $fields = array();
    
    foreach ($rows as $row) {
        $fields[] = $row[0];
    }
    $sql = "
        SELECT  id
                , `" . implode("`
                , `", $fields) . "`
                , DATE_FORMAT(datetime, '%m/%d/%Y %h:%i %p') datetime
        FROM    `" . CURAH2O_TABLE . "`
        WHERE   id = $id
    ";
    
    return $wpdb->get_row($sql);
}
function cura_add_entry($params = array()) {
    global $wpdb;
    $fields = cura_fields();
    $map = array();
    
    foreach ($fields as $field) {
        $map[$field[0]] = 1;
    }
    
    foreach ($params as $k => $v) {
        if (empty($map[$k])) {
            continue;
        }
        if (is_null($v) || '' === $v) {
            $values[] = "`$k` = NULL";
        } else {
            $values[] = "`$k` = '" . addslashes($v) . "'";
        }
    }
    $sql = "INSERT INTO `" . CURAH2O_TABLE . "` SET
    " . implode("
            , ", $values);
    $affectedRows = $wpdb->query($sql);
    $entry = cura_get_entry($wpdb->insert_id);
    $info = cura_entry_info($wpdb->insert_id);
    $entry->startDate = $info->startDate;
    $entry->endDate = $info->endDate;
    
    return array(
        'affectedRows' => $affectedRows,
        'data' => $entry,
        'insertId' => $wpdb->insert_id
    );
}
function cura_update_entry($id, $params) {
    global $wpdb;
    $id = intval($id);
    $fields = cura_fields();
    $map = array();
    
    foreach ($fields as $field) {
        $map[$field[0]] = 1;
    }
    
    foreach ($params as $k => $v) {
        if (empty($map[$k])) {
            continue;
        }
        if (null === $v || '' === $v) {
            $values[] = "`$k` = NULL";
        } else {
            $values[] = "`$k` = '" . addslashes($v) . "'";
        }
    }
    $sql = "UPDATE `" . CURAH2O_TABLE . "` SET
    " . implode("
            , ", $values) . "
            WHERE   id = $id";
    $affectedRows = $wpdb->query($sql);
    $entry = cura_get_entry($id);
    
    return array(
        'affectedRows' => $affectedRows,
        'data' => $entry,
        'insertId' => 0
    );
}
function cura_delete_entry($id) {
    global $wpdb;
    $id = intval($id);
    $sql = "DELETE FROM `" . CURAH2O_TABLE . "` WHERE id = $id";
    $affectedRows = $wpdb->query($sql);
    
    return $affectedRows;
}
function cura_delete_entries($watershed_name, $station_name, $location_id, $datetime) {
    global $wpdb;
    $id = intval($id);
    $datetime = date('Y-m-d H:i:s', strtotime($datetime));
    $sql = "
        DELETE FROM
                `" . CURAH2O_TABLE . "`
        WHERE   watershed_name = '" . addslashes($watershed_name) . "'
            AND station_name = '" . addslashes($station_name) . "'
            AND location_id = '" . addslashes($location_id) . "'
            AND datetime = '$datetime'";
    $affectedRows = $wpdb->query($sql);
    
    return $affectedRows;
}
function cura_photo_path($path = '') {
    if ($path === '') {
        
        return CURAH2O_PLUGIN_DIR . 'photos/';
    } elseif (preg_match('/^(user|guest)-\d+/', $path)) {
        
        return CURAH2O_PLUGIN_DIR . "photos/$path/";
    }
    
    return CURAH2O_PLUGIN_DIR . 'photos/' . implode('/', str_split($path)) . '/';
}
function cura_photo_url($path = '') {
    if ($path === '') {
        
        return CURAH2O_PLUGIN_URL . 'photos/';
    } elseif (preg_match('/^(user|guest)-\d+/', $path)) {
        
        return CURAH2O_PLUGIN_URL . "photos/$path/";
    }
    
    return CURAH2O_PLUGIN_URL . 'photos/' . implode('/', str_split($path)) . '/';
}
function cura_photo_manager($id = 0, $path = '', $initialize = false) {
    require ('vendor/jquery-file-upload/UploadHandler.php');
    
    class Photo extends UploadHandler {
        public function setId($id) {
            $this->options = array_merge($this->options, array(
                'id' => $id,
                'upload_dir' => cura_photo_path($id) ,
                'upload_url' => cura_photo_url($id) ,
            ));
        }
        public function get($print_response = true) {
            $files = $this->get_file_objects();
            
            foreach ($files as $file) {
                $file->id = $this->options['id'];
            }
            
            return $this->generate_response($files, $print_response);
        }
        public function set_additional_file_properties($file) {
            $file->id = $this->options['id'];
        }
        public function delete() {
            parent::delete(false);
            $this->clear_dir();
        }
        public function delete_all() {
            $files = $this->get_file_objects();
            
            foreach ($files as $file) {
                $_GET['file'] = $file->name;
                $this->delete();
            }
            $this->clear_dir();
        }
        public function post() {
            $result = parent::post(false);
            
            return $this->generate_response($result[$this->options['param_name']], true);
        }
        public function clear_dir($dir) {
            if (empty($dir)) {
                $dir = $this->get_upload_path();
            }
            if (is_readable($dir)) {
                $empty = true;
                $handle = opendir($dir);
                
                while (false !== ($entry = readdir($handle))) {
                    if ($entry != "." && $entry != "..") {
                        if (is_dir("$dir$entry")) {
                            if (false === $this->clear_dir("$dir$entry/")) {
                                $empty = false;
                            }
                        } else {
                            $empty = false;
                        }
                    }
                }
                closedir($handle);
                if ($empty === true) {
                    rmdir($dir);
                }
                
                return $empty;
            } else {
                
                return null;
            }
        }
    }
    
    return new Photo($options = array(
        'id' => $id,
        'upload_dir' => cura_photo_path($path) ,
        'upload_url' => cura_photo_url($path) ,
        'image_versions' => array(
            'thumbnail' => array(
                'max_width' => 120,
                'max_height' => 120
            )
        )
    ) , $initialize);
}
function cura_zip_status($zipname) {
    $zippath = cura_photo_path();
    $zip_status = 'nozip';
    $zip_size = 0;
    $zip_time = '';
    if (file_exists($zippath . $zipname)) {
        $zip_status = 'zipped';
        $zip_size = filesize($zippath . $zipname);
        $zip_time = filectime($zippath . $zipname);
    } else {
        $files = scandir($zippath);
        
        foreach ($files as $file) {
            if (strpos($file, $zipname) === 0) {
                $zip_status = 'zipping';
                $zip_size = filesize($zippath . $file);
                $zip_time = fileatime($zippath . $file);
                break;
            }
        }
    }
    $zip_time = date('m/d/Y H:i a', $zip_time);
    
    return compact('zip_status', 'zip_size', 'zip_time');
}
function cura_observations_csv($observations, $ouput = false) {
    $return = false;
    if ($ouput === false) {
        $return = true;
        $ouput = 'php://output';
        ob_start();
    }
    $fp = fopen($ouput, 'w');
    $headers = array(
        "id"
    );
    $fields = cura_fields();
    
    foreach ($fields as $row) {
        $headers[] = $row[2];
    }
    fputcsv($fp, $headers);
    
    foreach ($observations as $row) {
        $array = array(
            $row->id
        );
        
        foreach ($fields as $field) {
            $array[] = $row->$field[0];
        }
        fputcsv($fp, $array);
    }
    fclose($fp);
    if ($return) {
        
        return ob_get_clean();
    }
}
function cura_get_observations($options = null) {
    global $wpdb;
    $sql_filter = array();
    if (!empty($options->location) && intval($options->location->id)) {
        $sql_filter[] = "b.id = " . intval($options->location->id);
    }
    if (!empty($options->searchText)) {
        $sql_filter[] = "station_name LIKE '%" . $options->searchText . "%'";
    }
    if (!empty($options->startDate)) {
        $dt = date('Y-m-d H:i:s', strtotime($options->startDate));
        $sql_filter[] = "datetime >= '$dt'";
    }
    if (!empty($options->endDate)) {
        $dt = date('Y-m-d H:i:s', strtotime($options->endDate));
        $sql_filter[] = "datetime <= '$dt'";
    }
    if (!empty($options->locationIds)) {
        $or = array();
        
        foreach ($options->locationIds as $row) {
            $or[] = "(a.location_id = '" . addslashes($row[0]) . "' AND a.watershed_name = '" . addslashes($row[1]) . "')";
        }
        $sql_filter[] = "(" . implode(" OR ", $or) . ")";
    }
    // The fields order is important
    $rows = cura_fields();
    $fields = array();
    
    foreach ($rows as $row) {
        $fields[] = $row[0];
    }
    $sql = "
        SELECT  a.id
                , a.`" . implode("`
                , a.`", $fields) . "`
                , DATE_FORMAT(datetime, '%m/%d/%Y %h:%i %p') datetime
        FROM    `" . CURAH2O_TABLE . "` AS a
        JOIN
                `" . CURAH2O_TABLE_LOCATION . "` AS b
            ON  a.watershed_name = b.watershed_name
        WHERE   1" . (empty($sql_filter) ? "" : "
            AND " . implode("
            AND ", $sql_filter)) . "
        ORDER BY
                a.id DESC
    ";
    $objs = $wpdb->get_results($sql);
    
    foreach ($objs as $obj) {
        
        foreach ($obj as $key => & $value) {
            if ($key != 'latitude' && $key != 'longitude') {
                is_numeric($value) && $value = floatval($value);
            }
        }
    }
    
    return $objs;
}
function cura_get_location($id) {
    global $wpdb;
    $sql = "
        SELECT  id, watershed_name, count
        FROM    `" . CURAH2O_TABLE_LOCATION . "`
        WHERE   id = " . intval($id) . "
        ORDER BY
                watershed_name
    ";
    $row = $wpdb->get_row($sql);
    if ($row) {
        $row->id = intval($row->id);
        $row->count = intval($row->count);
    }
    
    return $row;
}
function cura_get_locations() {
    global $wpdb;
    $sql = "
        SELECT  id, watershed_name, count
        FROM    `" . CURAH2O_TABLE_LOCATION . "`
        WHERE   1
        ORDER BY
                watershed_name
    ";
    $rows = $wpdb->get_results($sql, ARRAY_A);
    
    foreach ($rows as & $row) {
        $row['id'] = intval($row['id']);
        $row['count'] = intval($row['count']);
    }
    
    return $rows;
}
function cura_update_locations() {
    global $wpdb;
    $sql = "TRUNCATE TABLE `" . CURAH2O_TABLE_LOCATION . "`";
    $wpdb->query($sql);
    $sql = "
        INSERT INTO
            `" . CURAH2O_TABLE_LOCATION . "` (
                watershed_name,
                count
            )
        SELECT  a.watershed_name, count(*)
        FROM    `" . CURAH2O_TABLE . "` a
        LEFT JOIN
                `" . CURAH2O_TABLE_LOCATION . "` b
            ON  a.watershed_name = b.watershed_name
        WHERE   b.id IS NULL
        GROUP BY
                a.watershed_name
    ";
    $wpdb->query($sql);
}
function cura_update_location($watershed_name) {
    global $wpdb;
    $sql = "
        SELECT  watershed_name
        FROM    `" . CURAH2O_TABLE_LOCATION . "`
        WHERE   watershed_name = '" . addslashes($watershed_name) . "'
        LIMIT   1
    ";
    $row = $wpdb->get_row($sql, ARRAY_A);
    if ($row) {
        $sql = "
            SELECT  count(*)
            FROM    `" . CURAH2O_TABLE . "`
            WHERE   watershed_name = '" . addslashes($watershed_name) . "'
        ";
        $count = $wpdb->get_var($sql);
        $sql = "
            UPDATE  `" . CURAH2O_TABLE_LOCATION . "`
            SET     count = $count
            WHERE   watershed_name = '" . addslashes($watershed_name) . "'
            LIMIT   1
        ";
        $wpdb->query($sql);
        $sql = "
            DELETE FROM
                    `" . CURAH2O_TABLE_LOCATION . "`
            WHERE   count = 0
        ";
        $wpdb->query($sql);
    } else {
        $sql = "
            INSERT INTO
            `" . CURAH2O_TABLE_LOCATION . "`
            SET     count = 1
            , watershed_name = '" . addslashes($watershed_name) . "'
        ";
        $wpdb->query($sql);
    }
}
function cura_get_typeaheads_of_watershed() {
    global $wpdb;
    $sql = "
        SELECT  MAX(id) id
        FROM    `" . CURAH2O_TABLE . "`
        WHERE   1
        GROUP BY
                watershed_name
    ";
    $sql = "
        SELECT  watershed_name
        FROM    `" . CURAH2O_TABLE . "` AS a
        JOIN    ($sql) t
            ON  a.id = t.id
        ORDER BY
                a.id DESC
    ";
    
    return $wpdb->get_results($sql, ARRAY_A);
}
function cura_get_typeaheads_of_locationid($watershed_name, $station_name) {
    global $wpdb;
    $sql = "
        SELECT  MAX(id) id
        FROM    `" . CURAH2O_TABLE . "`
        WHERE   1" . ($watershed_name == '' ? '' : "
            AND watershed_name = '" . addslashes($watershed_name) . "'") . ($station_name == '' ? '' : "
            AND station_name = '" . addslashes($station_name) . "'") . "
        GROUP BY
                location_id
    ";
    $sql = "
        SELECT  location_id
                , station_name
                , latitude
                , longitude
                , datetime
        FROM    `" . CURAH2O_TABLE . "` AS a
        JOIN    ($sql) t
            ON  a.id = t.id
        ORDER BY
                a.id DESC
    ";
    
    return $wpdb->get_results($sql, ARRAY_A);
}
function cura_get_typeaheads_of_station($watershed_name) {
    global $wpdb;
    $sql = "
        SELECT  MAX(id) id
        FROM    `" . CURAH2O_TABLE . "`
        WHERE   " . ($watershed_name == '' ? '1' : "watershed_name = '" . addslashes($watershed_name) . "'") . "
        GROUP BY            
                location_id, station_name
    ";
    $sql = "
        SELECT  station_name
                , location_id
                , latitude
                , longitude
                , datetime
        FROM    `" . CURAH2O_TABLE . "` AS a
        JOIN    ($sql) t
            ON  a.id = t.id
        ORDER BY
                a.id DESC
    ";
    
    return $wpdb->get_results($sql, ARRAY_A);
}
