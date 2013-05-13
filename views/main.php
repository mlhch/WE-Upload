<?php $fields = cura_fields ()?>
<script type="text/javascript">
var wqOptions = {
	selectors: {
		btnAddNew: '#new-data-entry',
		selector: '#fields-selector',
		form: '#form-data-entry',
		dialog: '#dialog-data-entry',
		filterLocations: '#filter-locations',
		table: '#data-entry-list',
		pager: '#data-entry-pager',
	},
	fields: <?php echo $fields ? json_encode($fields) : '{}'?>,
	canEdit: <?php echo intval(current_user_can('cura-edit'))?>,
	canDelete: <?php echo intval(current_user_can('cura-delete'))?>,
	canAdd: 1,
};
</script>

<!-- CuraH2O Phase2 start-->
<?php include dirname(dirname(__FILE__)) . "/app/index.php"?>
<!-- CuraH2O Phase2 end-->

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


<div class="tooltip_description" title="Mobile site available!"
	style="display: none">
	<p>
		<span>Looks like you are on a mobile device. </span>Would you like to
		be redirected to the site optimized for mobile devices?
	</p>
	<p style="margin: 10px; text-align: left">
		<label><input type="checkbox" id="remember-choice" /> Remember my
			choice on this device</label>
	</p>
	<p style="margin-bottom: 0px; text-align: center">
		<button id="gotoMobile" style="padding: 3px 20px; margin: 10px 20px">Yes</button>
		<button id="notgoMobile" style="padding: 3px 20px; margin: 10px 20px">No</button>
	</p>
</div>