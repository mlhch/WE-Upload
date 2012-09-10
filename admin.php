<?php
/*
 * Plugin "Settings" link
*/
function cura_plugin_action_links($links, $file) {
	$links [] = '<a href="admin.php?page=cura-settings">' . __ ( 'Settings' ) . '</a>';
	return $links;
}
/*
 *  "Settings" Menu
 */
function cura_menu() {
	add_menu_page ( 'title', 'Cura Settings', 'manage_options', 'cura-settings', 'cura_page_settings' );
}
/*
 * "Settings" page and its "update" action.
 */
function cura_page_settings() {
	$action = isset ( $_POST ['action'] ) ? $_POST ['action'] : '';
	
	if ('update' == $action) {
		$options = array ('title', 'keywords', 'providername', 'website', //
'description', 'authorname', 'type', 'contact' );
		foreach ( $options as $option ) {
			$option = trim ( $option );
			$value = null;
			if (isset ( $_POST [$option] ))
				$value = $_POST [$option];
			if (! is_array ( $value ))
				$value = trim ( $value );
			$value = stripslashes_deep ( $value );
			update_option ( 'cura_' . $option, $value );
		}
		$goback = add_query_arg ( 'settings-updated', 'true', wp_get_referer () );
		echo '<script type="text/javascript">history.back()</script>';
		exit ();
	}
	
	include 'views/settings.php';
}