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
	?>
<div class="ui-block-<?php echo $pos == 'left' ? 'a' : 'b'?>">
	<label for="<?php echo $field[0]?>"> <?php echo $field[2]?> </label> <input
		id="<?php echo $field[0]?>" name="<?php echo $field[0]?>"
		placeholder="<?php echo $field[1]?>" type="number" />
</div>
<?php
}

include CURAH2O_PLUGIN_DIR . "/mobile/app.php";
?>