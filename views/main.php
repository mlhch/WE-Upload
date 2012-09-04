<?php
function cura_view_main() {
	?>
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
</div>
<ol id="fields-selector" style="float: right;"></ol>

<div style="clear: both"></div>
<table id="data-entry-list" class="tablesorter"
	style="border-spacing: 1px;"></table>
<?php $icon_url = CURAH2O_PLUGIN_URL . '/lib/tablesorter/addons/pager/icons'?>
<div id="data-entry-pager" class="tablesorterPager">
	<form>
		<img src="<?php echo $icon_url?>/first.png" class="first" /> <img
			src="<?php echo $icon_url?>/prev.png" class="prev" /> <input
			type="text" class="pagedisplay" /> <img
			src="<?php echo $icon_url?>/next.png" class="next" /> <img
			src="<?php echo $icon_url?>/last.png" class="last" /> <select
			class="pagesize">
			<option selected="selected" value="5">5</option>
			<option value="20">20</option>
			<option value="50">50</option>
			<option value="100">100</option>
		</select>
	</form>
</div>

<div id="dialog-data-entry" style="display: none;"
	title="Add New Observation">
	<form id="form-data-entry" method="post"
		action="<?php echo home_url()?>/wp-admin/admin-ajax.php">
		<input type="hidden" name="action" value="save_data_entry" /> <input
			class="field" type="hidden" name="id" />
		<table style="width: 100%">
			<?php foreach (cura_fields() as $row) {?>
			<tr>
				<td
					style="text-align: right; width: 40%; padding: 0.5em 2em 0.5em 0;"><?php echo $row[2]?></td>
				<td><input class="field" type="text" name="<?php echo $row[0]?>"
					placeHolder="<?php echo $row[2]?>" style="width: 100%" /></td>
			</tr>
			<?php }?>
		</table>
	</form>
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
});
</script>
<?php
}