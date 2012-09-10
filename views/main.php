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
		<img src="<?php echo $icon_url?>/first.png" class="first" width="30" />
		<img src="<?php echo $icon_url?>/prev.png" class="prev" width="30" />
		<input type="text" class="pagedisplay" /> <img
			src="<?php echo $icon_url?>/next.png" class="next" width="30" /> <img
			src="<?php echo $icon_url?>/last.png" class="last" width="30" /> <select
			class="pagesize">
			<option selected="selected" value="10">10</option>
			<option value="20">20</option>
			<option value="50">50</option>
			<option value="100">100</option>
		</select>
	</form>
</div>

<div id="dialog-data-entry" style="display: none;"
	title="Add New Observation">
	<form id="form-data-entry" method="post">
		<input class="field" type="hidden" name="id" />
		<table style="width: 100%; margin-top: 10px">
			<?php foreach (cura_fields() as $row) {?>
			<?php if ($row[0] == 'coliform') {?>
			<tr>
				<td
					style="text-align: right; width: 40%; padding: 0.5em 2em 0.5em 0;"><?php echo $row[2]?></td>
				<td><label><input type="radio" name="<?php echo $row[0]?>"
						value="Present" /> Present</label> &nbsp; <label><input
						type="radio" name="<?php echo $row[0]?>" value="Absent" /> Absent</label></td>
			</tr>
			<?php } elseif ($row[0] == 'lab_sample') {?>
			<tr>
				<td
					style="text-align: right; width: 40%; padding: 0.5em 2em 0.5em 0;"><?php echo $row[2]?></td>
				<td><label><input type="radio" name="<?php echo $row[0]?>" value="Y" />
						Yes</label> &nbsp; <label><input type="radio"
						name="<?php echo $row[0]?>" value="N" /> No</label></td>
			</tr>
			<?php } else {?>
			<tr>
				<td
					style="text-align: right; width: 40%; padding: 0.5em 2em 0.5em 0;"><?php echo $row[2]?></td>
				<td><input class="field" type="text" name="<?php echo $row[0]?>"
					placeHolder="<?php echo $row[1]?>" style="width: 100%" /><label
					class="msg"></label></td>
			</tr>
			<?php }?>
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
	canEdit: <?php echo intval(current_user_can('cura-edit'))?>,
	canDelete: <?php echo intval(current_user_can('cura-delete'))?>,
	canAdd: 1,
});
</script>