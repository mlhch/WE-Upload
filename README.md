WE-Upload
=========

Extra steps to make the plugin work:
1. Add below lines to WordPress' .htaccess

RewriteCond %{REQUEST_URI} /water-quality/.*\.json$
RewriteRule ^water-quality/(.*\.json)$ wp-admin/admin-ajax.php?action=$1&%{QUERY_STRING} [NC,L]

2. Use WordPress' Visibility attribute of Page to control the access

3. The shortcode to trigger the plugin is [water-quality]
