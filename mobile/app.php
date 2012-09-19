<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title></title>
<link rel="stylesheet"
	href="<?php echo $base_url?>/lib/jquery.mobile/jquery.mobile-1.1.1.min.css" />
<link rel="stylesheet"
	href="<?php echo $base_url?>/lib/jqm-datebox-1.1.0/jqm-datebox-1.1.0.min.css" />
<link rel='stylesheet'
	href="<?php echo $base_url?>/../lib/bootstrap/typeahead.css" />
<style>
/* App custom styles */
#details .field {
	background-color: #f0f0f0;
	height: 2em;
	padding: 0.5em 0.5em 0 0;
	margin: 1px 1px 0 -1px;
	text-align: right;
}

#details .value {
	background-color: white;
	height: 2em;
	padding: 0.5em 0 0 0.5em;
	margin: 1px 0 0 0;
}

#newob form .ui-block-a {
	width: 49%;
	margin-right: 1%;
}

#newob form .ui-block-b {
	width: 49%;
	margin-left: 1%;
}

.ui-input-datebox {
	width: 92% !important;
}

#list-observations li .date {
	display: block;
	color: silver;
	font-size: 10px;
	text-align: right;
	height: 1.5em;
	margin: -1.5em 40px 0 0;
}

#lab_sample_label {
	display: block;
	margin: 0 0 10px 0;
}

#div_coliform {
	text-align: center;
	margin: 0.5em 0 1.5em 0
}

div.ui-slider-switch {
	width: 150px !important;
	vertical-align: middle;
}
</style>
<script src="<?php echo $jq_src?>"></script>
<script
	src="<?php echo $base_url?>/lib/jquery.mobile/jquery.mobile-1.1.1.min.js"></script>
<script type="text/javascript"
	src="<?php echo $base_url?>/lib/jqm-datebox-1.1.0/jqm-datebox-1.1.0.core.min.js"></script>
<script type="text/javascript"
	src="<?php echo $base_url?>/lib/jqm-datebox-1.1.0/jqm-datebox-1.1.0.mode.calbox.min.js"></script>
<script type="text/javascript"
	src="<?php echo $base_url?>/lib/jqm-datebox-1.1.0/jqm-datebox-1.1.0.mode.datebox.min.js"></script>
<script type='text/javascript'
	src="<?php echo $base_url?>/../lib/bootstrap/typeahead.js"></script>
<script src="<?php echo $base_url?>/app.js"></script>
</head>

<body>
	<!-- Home -->
	<div data-role="page" data-theme="b" id="home">
		<div data-theme="a" data-role="header">
			<a id="reload-locations" data-role="button" data-transition="fade"
				data-icon="refresh" data-iconpos="left" class="ui-btn-left">Refresh</a>
			<a href="#newob" data-role="button" data-transition="slide"
				data-icon="add" data-iconpos="right" class="ui-btn-right">New Ob</a>
			<h3>CuraH2O Mobile</h3>
		</div>
		<div data-role="content" style="padding: 15px">
			<ul id="list-locations" data-role="listview" data-divider-theme="b"
				data-inset="false">
				<li data-role="list-divider" role="heading">Watersheds</li>
			</ul>
		</div>
		<div data-role="footer" class="ui-bar" data-position="fixed">
			<a href="../../water-quality/" rel="external" data-role="button"
				data-inline="false">Desktop Site</a>
		</div>
	</div>
	<!-- Observation List -->
	<div data-role="page" data-theme="b" id="observations">
		<div data-theme="a" data-role="header">
			<a data-role="button" data-inline="true" href="#home"
				data-transition="slide" data-direction="reverse" data-icon="home"
				class="ui-btn-left">Home</a> <a data-role="button"
				data-transition="slide" href="#newob" data-icon="plus"
				data-iconpos="right" class="ui-btn-right">New Ob</a>
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
		<div data-theme="a" data-role="header">
			<a data-role="button" data-inline="true" data-rel="back"
				data-transition="slide" href="#observations" data-icon="back"
				class="ui-btn-left">Back</a>
			<h3></h3>
		</div>
		<div data-role="content" style="padding: 5px"></div>
	</div>
	<div data-role="page" data-theme="b" id="newob">
		<div data-theme="a" data-role="header">
			<a data-role="button" data-inline="true" href="#home"
				data-transition="slide" data-direction="reverse" data-icon="home"
				class="ui-btn-left">Home</a><a data-role="button" data-inline="true"
				data-icon="back" data-iconpos="right" data-rel="back">Back </a>
			<h3>New Observation</h3>
		</div>
		<div data-role="content" style="padding: 5px">
			<form>
				<input type="hidden" name="id" value="0" /> <label for="textinput1">
					Watershed Name </label> <input name="watershed_name"
					id="textinput1" type="text" />
				<fieldset class="ui-grid-a">
					<div class="ui-block-a">
						<label for="textinput2"> Station Name </label> <input
							name="station_name" id="textinput2" type="text" />
					</div>
					<div class="ui-block-b">
						<label for="textinput3"> Location ID </label> <input
							name="location_id" id="textinput3" type="text" />
					</div>
				</fieldset>
				<div class="ui-grid-a">
					<div class="ui-block-a">
						<label for="textinput6">Date</label> <input id="date" name="date"
							type="text" data-role="datebox"
							data-options='{"mode":"calbox", "useFocus":true}' />
					</div>
					<div class="ui-block-b">
						<label for="textinput10">Time </label> <input id="time"
							name="time" type="text" data-role="datebox"
							data-options='{"mode":"timebox", "useFocus":true}' />
					</div>
				</div>
				<div class="ui-grid-a">
					<div class="ui-block-a">
						<label for="textinput7"> Latitude </label> <input name="latitude"
							id="textinput7" type="number" />
					</div>
					<div class="ui-block-b">
						<label for="textinput8"> Longitude </label> <input
							name="longitude" id="textinput8" type="number" />
					</div>
				</div>
				<div class="ui-grid-a">
					<div class="ui-block-a">
						<label for="textinput9"> DO (mg/L) </label> <input name="do_mgl"
							id="textinput9" placeholder="0-15" type="number" />
					</div>
					<div class="ui-block-b">
						<label for="textinput11"> DO (%) </label> <input name="do_%"
							id="textinput11" placeholder="0-110" type="number" />
					</div>
				</div>
				<div class="ui-grid-a">
					<div class="ui-block-a">
						<label for="textinput12"> Cond. (µS/cm) </label> <input
							name="cond" id="textinput12" placeholder="0-1500" type="number" />
					</div>
					<div class="ui-block-b">
						<label for="textinput13"> Salinity (ppt) </label> <input
							name="salinity" id="textinput13" placeholder="0-1" type="number" />
					</div>
				</div>
				<div class="ui-grid-a">
					<div class="ui-block-a">
						<label for="textinput14"> Temp. (⁰C) </label> <input name="temp"
							id="textinput14" placeholder="0-30" type="number" />
					</div>
					<div class="ui-block-b">
						<label for="textinput15"> pH </label> <input name="ph"
							id="textinput15" placeholder="4-8" type="number" />
					</div>
				</div>
				<div class="ui-grid-a">
					<div class="ui-block-a">
						<label for="textinput16"> Secchi Disc Reading A </label> <input
							name="secchi_a" id="textinput16" placeholder="0-20" type="number" />
					</div>
					<div class="ui-block-b">
						<label for="textinput17"> Secchi Disc Reading B </label> <input
							name="secchi_b" id="textinput17" placeholder="between A+/-2"
							value="" type="number" />
					</div>
				</div>
				<label for="textinput18"> Secchi Disc Depth </label> <input
					name="secchi_d" id="textinput18" placeholder="average A and B"
					value="" type="number" />
				<div class="ui-grid-a">
					<div class="ui-block-a">
						<label id="lab_sample_label" for="toggleswitch1"> Lab Sample </label>
						<select name="lab_sample" id="lab_sample" data-theme="b"
							data-role="slider" data-mini="true">
							<option value="N">No</option>
							<option value="Y">Yes</option>
						</select>
					</div>
					<div class="ui-block-b">
						<label for="textinput19"> Lab ID </label> <input name="lab_id"
							id="textinput19" type="number" />
					</div>
				</div>
				<div class="ui-grid-a">
					<div class="ui-block-a">
						<label for="textinput20"> Nitrate Count </label> <input
							name="nitrate" id="textinput20" placeholder="0-40" type="number" />
					</div>
					<div class="ui-block-b">
						<label for="textinput21"> Phosphate Count </label> <input
							name="phosphate" id="textinput21" placeholder="0-4" type="number" />
					</div>
				</div>
				<div id="div_coliform">
					<label for="toggleswitch2"> Coliform </label> &nbsp; <select
						name="coliform" id="coliform" data-theme="b" data-role="slider"
						data-mini="true">
						<option value="Absent">Absent</option>
						<option value="Present">Present</option>
					</select>
				</div>
				<button id="save" type="button" data-icon="check"
					data-iconpos="right" data-theme="b">Submit</button>
			</form>
		</div>
	</div>
</body>
</html>