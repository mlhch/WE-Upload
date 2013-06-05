<?php
global $wp_scripts;

$base_url = CURAH2O_PLUGIN_URL . 'mobile';
// in case that 'jquery' was not registered
global $wp_scripts;
if (! is_a ( $wp_scripts, 'WP_Scripts' )) {
	$wp_scripts = new WP_Scripts ();
}
$jq_src = $wp_scripts->base_url . $wp_scripts->registered ['jquery']->src;
/*
 *
 */
function cura_form_field($name, $pos = 'left', $type = 'number') {
	static $fields = null;
	if (!$fields) {
		$rows = cura_fields ();
		foreach ($rows as $row) {
			$fields[$row[0]] = $row;
		}
	}
	$field = $fields [$name];
	if ($name == 'note') {
?>
<label for="<?php echo $field[0]?>"> <?php echo $field[2]?> </label> <textarea
	id="<?php echo $field[0]?>" name="<?php echo $field[0]?>"
	placeholder="<?php echo $field[1]?>"></textarea>
<?php

	} elseif ($name == 'coliform') {
?>
<div id="div_<?php echo $name?>">
	<label for="toggleswitch2"> <?php echo $field[2]?> </label> &nbsp; <select
		name="<?php echo $name?>" id="<?php echo $name?>" data-theme="b" data-role="slider"
		data-mini="true">
		<option value="Absent">Absent</option>
		<option value="Present">Present</option>
	</select>
</div>
<?php

	} elseif ($name == 'lab_sample') {
?>
<div class="ui-block-a">
	<label id="<?php echo $name?>_label" for="toggleswitch1"> <?php echo $field[2]?> </label>
	<select name="<?php echo $name?>" id="<?php echo $name?>" data-theme="b"
		data-role="slider" data-mini="true">
		<option value="N">No</option>
		<option value="Y">Yes</option>
	</select>
</div>
<?php

	} else {
	?>
<div class="ui-block-<?php echo $pos == 'left' ? 'a' : 'b'?>">
	<label for="<?php echo $field[0]?>"> <?php echo $field[2]?> </label> <input
		id="<?php echo $field[0]?>" name="<?php echo $field[0]?>"
		placeholder="<?php echo $field[1]?>" type="<?php echo $type?>" />
</div>
<?php
	}
}

include CURAH2O_PLUGIN_DIR . "/mobile/app.php";
?>