<!-- CuraH2O Phase2 start-->
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

	<script src="<?php echo $url?>app/scripts/water-quality.js?<?php echo CURAH2O_VERSION?>"></script>
	<script src="<?php echo $url?>app/scripts/app.js?<?php echo CURAH2O_VERSION?>"></script>
	<script src="<?php echo $url?>app/scripts/main.js?<?php echo CURAH2O_VERSION?>"></script>
	<!-- endbuild -->
</div>
<!-- CuraH2O Phase2 end-->