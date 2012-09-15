<div style="float: left;">
	Select Watershed: <select id="filter-locations"
		class="ui-button ui-widget ui-state-default ui-corner-all"
		style="font-size: 12px; height: 30px; width: 300px"></select>
</div>

<div style="float: right; margin-bottom: 10px">
	<button id="fields-config" type="button" style="font-size: 12px"
		class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">
		<span class="ui-button-text">More fields...</span>
	</button>
	<button id="new-data-entry" type="button" style="font-size: 12px"
		class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">
		<span class="ui-button-text">Add new entry</span>
	</button>
	<button id="export_as_csv" type="button" style="font-size: 12px"
		class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">
		<span class="ui-button-text">Export as CSV</span>
	</button>
	<button id="mobile-site" type="button" style="font-size: 12px"
		class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">
		<span class="ui-button-text">Mobile Site</span>
	</button>
</div>

<ol id="fields-selector" style="float: right;"></ol>

<div style="clear: both"></div>
<table id="data-entry-list" class="tablesorter"
	style="border-spacing: 1px;"></table>
<?php $icon_url = CURAH2O_PLUGIN_URL . '/lib/tablesorter/addons/pager/icons'?>
<div id="data-entry-pager" class="tablesorterPager"
	style="display: none">
	<form>
		<img src="<?php echo $icon_url?>/first.png" class="first" width="30" />
		<img src="<?php echo $icon_url?>/prev.png" class="prev" width="30" />
		<input type="text" class="pagedisplay" /> <img
			src="<?php echo $icon_url?>/next.png" class="next" width="30" /> <img
			src="<?php echo $icon_url?>/last.png" class="last" width="30" /> <select
			class="pagesize">
			<option selected="selected" value="100">100</option>
		</select>
	</form>
</div>

<?php
$fields = cura_fields ();
function cura_form_field($row, $single = false) {
	if ($row [0] == 'lab_sample') {
		?>
<td class="label"><?php echo $row[2]?></td>
<td><label><input type="radio" name="<?php echo $row[0]?>" value="Y" />
		Yes</label> &nbsp; <label><input type="radio"
		name="<?php echo $row[0]?>" value="N" /> No</label></td>
<?php
	} elseif ($row [0] == 'coliform') {
		?>
<td class="label"><?php echo $row[2]?></td>
<td><label><input type="radio" name="<?php echo $row[0]?>"
		value="Present" /> Present</label> &nbsp; <label><input type="radio"
		name="<?php echo $row[0]?>" value="Absent" /> Absent</label></td>
<?php
	} else {
		?>
<td class="label"><?php echo $row[2]?></td>
<td <?php echo $single ? 'colspan="3"' : ''?>><input class="field"
	type="text" name="<?php echo $row[0]?>"
	placeHolder="<?php echo $row[1]?>" style="width: 100%" /></td>
<?php
	}
}
?>
<div id="dialog-data-entry" style="display: none; margin: 10px 0 -3px">
	<form id="form-data-entry" method="post">
		<input class="field" type="hidden" name="id" />
		<table style="width: 100%;">
			<tr>
				<?php cura_form_field($fields['watershed_name'])?>
				<?php cura_form_field($fields['datetime'])?>
			</tr>
			<tr>
				<?php cura_form_field($fields['station_name'])?>
				<?php cura_form_field($fields['location_id'])?>
			</tr>
			<tr>
				<?php cura_form_field($fields['latitude'])?>
				<?php cura_form_field($fields['longitude'])?>
			</tr>
			<tr>
				<?php cura_form_field($fields['do_mgl'])?>
				<?php cura_form_field($fields['do_%'])?>
			</tr>
			<tr>
				<?php cura_form_field($fields['cond'])?>
				<?php cura_form_field($fields['salinity'])?>
			</tr>
			<tr>
				<?php cura_form_field($fields['temp'])?>
				<?php cura_form_field($fields['ph'])?>
			</tr>
			<tr>
				<?php cura_form_field($fields['secchi_a'])?>
				<?php cura_form_field($fields['secchi_b'])?>
			</tr>
			<tr>
				<?php cura_form_field($fields['secchi_d'], 1)?>
			</tr>
			<tr>
				<?php cura_form_field($fields['lab_sample'])?>
				<?php cura_form_field($fields['lab_id'])?>
			</tr>
			<tr>
				<?php cura_form_field($fields['nitrate'])?>
				<?php cura_form_field($fields['phosphate'])?>
			</tr>
			<tr>
				<?php cura_form_field($fields['coliform'], 1)?>
			</tr>
		</table>
	</form>
</div>
<div class="tooltip_description" title="Mobile site available!"
	style="display: none">
	<p>Looks like you are on a mobile device. Would you like to be directed
		to the mobile specific version of this page?</p>
	<p style="margin-bottom: 5px; text-align: right">
		<label><input type="checkbox" id="remember-choice" /> Remember my choice</label>
	</p>
	<p style="margin-bottom: 0px; text-align: center">
		<button id="gotoMobile">Yes</button>
		<button id="notgoMobile">No</button>
	</p>
</div>
<script type="text/javascript">
new WaterQuality({
	btnAddNew: document.getElementById('new-data-entry'),
	selector: document.getElementById('fields-selector'),
	form: document.getElementById('form-data-entry'),
	dialog: document.getElementById('dialog-data-entry'),
	filterLocations: document.getElementById('filter-locations'),
	table: document.getElementById('data-entry-list'),
	pager: document.getElementById('data-entry-pager'),
	canEdit: <?php echo intval(current_user_can('cura-edit'))?>,
	canDelete: <?php echo intval(current_user_can('cura-delete'))?>,
	canAdd: 1,
});
</script>