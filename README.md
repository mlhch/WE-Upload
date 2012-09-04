WE-Upload
=========

Extra steps to make the plugin work:
<ol>
<li><p>Add below lines to WordPress' .htaccess</p>
<pre>
RewriteCond %{REQUEST_URI} /water-quality/.*\.json$
RewriteRule ^water-quality/(.*\.json)$ wp-admin/admin-ajax.php?action=$1&%{QUERY_STRING} [NC,L]
</pre></li>
<li>Use WordPress' Visibility attribute of Page to control the access</li>
<li>The shortcode to trigger the plugin is [water-quality]</li>
</ol>
