<?php
global $wp_scripts;

$base_url = CURAH2O_PLUGIN_URL . 'mobile';
$jq_src = $wp_scripts->base_url . $wp_scripts->registered ['jquery']->src;

include CURAH2O_PLUGIN_DIR . "/mobile/app.php";
?>