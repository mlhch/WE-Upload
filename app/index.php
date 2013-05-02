<div id="curaApp" ng-app="curaApp">

	<!--[if lt IE 7]>
	<p class="chromeframe">You are using an outdated browser. <a href="http://browsehappy.com/">Upgrade your browser today</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to better experience this site.</p>
	<![endif]-->

	<!--[if lt IE 9]>
	<script src="<?php echo CURAH2O_PLUGIN_URL . "app/scripts/vendor/es5-shim.min.js"?>"></script>
	<script src="<?php echo CURAH2O_PLUGIN_URL . "app/scripts/vendor/json3.min.js"?>"></script>
	<![endif]-->

	<!-- Add your site or application content here -->
	<div class="container" ng-view></div>

	<script src="<?php echo CURAH2O_PLUGIN_URL . "app/scripts/vendor/leaflet.js"?>"></script>
	<script src="<?php echo CURAH2O_PLUGIN_URL . "app/scripts/vendor/leaflet.markercluster.js"?>"></script>
	<script src="<?php echo CURAH2O_PLUGIN_URL . "app/scripts/vendor/leaflet.awesome-markers.js"?>"></script>

	<script src="<?php echo CURAH2O_PLUGIN_URL . "app/scripts/vendor/angular.js"?>"></script>
	<script src="<?php echo CURAH2O_PLUGIN_URL . "app/scripts/vendor/angular-resource.js"?>"></script>

	<!-- build:js scripts/scripts.js -->
	<script src="<?php echo CURAH2O_PLUGIN_URL . "app/scripts/services.js"?>"></script>
	<script src="<?php echo CURAH2O_PLUGIN_URL . "app/scripts/directives.js"?>"></script>
	<script src="<?php echo CURAH2O_PLUGIN_URL . "app/scripts/app.js"?>"></script>
	<script src="<?php echo CURAH2O_PLUGIN_URL . "app/scripts/controllers/main.js"?>"></script>
	<!-- endbuild -->
</div>