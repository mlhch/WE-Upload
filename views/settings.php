<div class="wrap">
	<h2>WaterQuality Settings</h2>
	<form method="post" action="">
		<input type="hidden" name="action" value="update" />
		<table class="form-table">
			<tr valign="top">
				<th scope="row"><label for="title"><?php _e('Service Title') ?></label></th>
				<td><input name="title" type="text" id="title"
					value="<?php form_option('cura_title'); ?>" class="regular-text" /></td>
			</tr>
			<tr valign="top">
				<th scope="row"><label for="keywords"><?php _e('Keywords') ?></label></th>
				<td><input name="keywords" type="text" id="keywords"
					value="<?php form_option('cura_keywords'); ?>" class="regular-text" /></td>
			</tr>
			<tr valign="top">
				<th scope="row"><label for="providername"><?php _e('Provider Name') ?></label></th>
				<td><input name="providername" type="text" id="providername"
					value="<?php form_option('cura_providername'); ?>"
					class="regular-text" /></td>
			</tr>
			<tr valign="top">
				<th scope="row"><label for="website"><?php _e('Website') ?></label></th>
				<td><input name="website" type="text" id="website"
					value="<?php form_option('cura_website'); ?>" class="regular-text" /></td>
			</tr>
			<tr valign="top">
				<th scope="row"><label for="description"><?php _e('Description') ?></label></th>
				<td><input name="description" type="text" id="description"
					value="<?php form_option('cura_description'); ?>"
					class="regular-text" /></td>
			</tr>
			<tr valign="top">
				<th scope="row"><label for="authorname"><?php _e('Author Name') ?></label></th>
				<td><input name="authorname" type="text" id="authorname"
					value="<?php form_option('cura_authorname'); ?>"
					class="regular-text" /></td>
			</tr>
			<tr valign="top">
				<th scope="row"><label for="type"><?php _e('Type') ?></label></th>
				<td><input name="type" type="text" id="type"
					value="<?php form_option('cura_type'); ?>" class="regular-text" /></td>
			</tr>
			<tr valign="top">
				<th scope="row"><label for="contact"><?php _e('Contact') ?></label></th>
				<td><input name="contact" type="text" id="contact"
					value="<?php form_option('cura_contact'); ?>" class="regular-text" /></td>
			</tr>
		</table>
		<?php submit_button(); ?>
	</form>
</div>