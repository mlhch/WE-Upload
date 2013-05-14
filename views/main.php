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