<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title></title>
<link rel="stylesheet"
	href="<?php echo $base_url?>/lib/jquery.mobile/jquery.mobile-1.1.1.min.css" />
<style>
/* App custom styles */
</style>
<script src="<?php echo $jq_src?>"></script>
<script
	src="<?php echo $base_url?>/lib/jquery.mobile/jquery.mobile-1.1.1.min.js"></script>
<script src="<?php echo $base_url?>/app.js"></script>
</head>

<body>
	<!-- Home -->
	<div data-role="page" data-theme="b" id="home">
		<div data-theme="a" data-role="header">
			<a id="reload-locations" data-role="button" data-transition="fade"
				data-icon="refresh" data-iconpos="left" class="ui-btn-right">Reload</a>
			<h3>CuraH2O Mobile</h3>
		</div>
		<div data-role="content" style="padding: 15px">
			<ul id="list-locations" data-role="listview" data-divider-theme="b"
				data-inset="false">
				<li data-role="list-divider" role="heading">Watersheds</li>
			</ul>
		</div>
	</div>
	<!-- Observation List -->
	<div data-role="page" data-theme="b" id="observations">
		<div data-theme="b" data-role="header">
			<a data-role="button" data-inline="true" data-rel="back"
				data-transition="slide" href="#home" data-icon="home"
				data-iconpos="notext" class="ui-btn-left"> </a> <a
				data-role="button" data-transition="fade" href="#page2"
				data-icon="plus" data-iconpos="left" class="ui-btn-right"> Add </a>
			<h3>Annapolis</h3>
		</div>
		<div data-role="content" style="padding: 15px">
			<ul id="list-observations" data-role="listview"
				data-divider-theme="b" data-inset="false">
				<li data-role="list-divider" role="heading">Observations</li>
			</ul>
		</div>
	</div>
	<!-- Observation Details -->
	<div data-role="page" data-theme="b" id="details">
		<div data-theme="b" data-role="header">
			<a data-role="button" data-inline="true" data-rel="back"
				data-transition="slide" href="#observations" data-icon="back"
				data-iconpos="notext" class="ui-btn-left"> </a> <a
				data-role="button" data-transition="fade" href="#editDetails"
				data-icon="gear" data-iconpos="left" class="ui-btn-right"> Edit </a>
			<h3></h3>
		</div>
		<div data-role="content" style="padding: 15px">
			<form>
				<!-- /grid-a 
				<ul data-role="listview" data-inset="true">
					<li data-role="fieldcontain"><label for="name">Text Input:</label>
						<input type="text" name="name" id="name" value="" /></li>
				</ul>-->
			</form>
			<!-- div data-role="fieldcontain">
				<label for="name">Text Input:</label> <input type="text" name="name"
					id="name" value="" />
			</div -->
		</div>
	</div>
</body>
</html>