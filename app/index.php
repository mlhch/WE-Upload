<?php $url = CURAH2O_PLUGIN_URL?>
<div id="curaApp" ng-app="curaApp">

	<!--[if lt IE 7]>
	<p class="chromeframe">You are using an outdated browser. <a href="http://browsehappy.com/">Upgrade your browser today</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to better experience this site.</p>
	<![endif]-->

	<!--[if lt IE 9]>
	<script src="<?php echo $url?>app/scripts/vendor/es5-shim.min.js"></script>
	<script src="<?php echo $url?>app/scripts/vendor/json3.min.js"></script>
	<![endif]-->

	<!-- Add your site or application content here -->
	<div ng-view></div>

	<script src="<?php echo $url?>vendor/bootstrap/js/bootstrap-typeahead-2.1.0-customized.js"></script>
	<script src="<?php echo $url?>vendor/bootstrap/js/bootstrap-affix.js"></script>

	<script src="<?php echo $url?>vendor/jquery-file-upload/jquery.iframe-transport.js"></script>
	<script src="<?php echo $url?>vendor/jquery-file-upload/jquery.fileupload.js"></script>

	<script src="<?php echo $url?>vendor/jquery-validation/jquery.validate.js"></script>
	<script src="<?php echo $url?>vendor/jquery-validation/additional-methods.js"></script>
	<script src="<?php echo $url?>app/scripts/vendor/ucsv.js"></script>
	<script src="<?php echo $url?>vendor/jquery.tablesorter/jquery.tablesorter.js"></script>
	<script src="<?php echo $url?>vendor/jquery.tablesorter/addons/pager/jquery.tablesorter.pager.js"></script>

	<script src="<?php echo $url?>app/scripts/vendor/leaflet.js"></script>
	<script src="<?php echo $url?>app/scripts/vendor/leaflet.markercluster.js"></script>
	<script src="<?php echo $url?>app/scripts/vendor/leaflet.awesome-markers.js"></script>

	<script src="<?php echo $url?>app/scripts/vendor/angular.js"></script>
	<script src="<?php echo $url?>app/scripts/vendor/angular-resource.js"></script>
	<script src="<?php echo $url?>app/scripts/vendor/angular-cookies.js"></script>

	<script src="<?php echo $url?>app/scripts/curah2o/cura.leaflet.js"></script>
	<script src="<?php echo $url?>app/scripts/curah2o/cura.leaflet.geojson.js"></script>

	<!-- build:js scripts/scripts.js -->
	<script src="<?php echo $url?>app/scripts/services.js"></script>
	<script src="<?php echo $url?>app/scripts/directives.js"></script>
	<script src="<?php echo $url?>app/scripts/app.js"></script>
	<script src="<?php echo $url?>app/scripts/controllers/main.js"></script>
	<!-- endbuild -->
</div>