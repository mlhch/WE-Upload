WE-Upload
=========

Extra steps to make the plugin work:
<ol>
<li><p>Add below lines to WordPress' .htaccess</p>
<pre>
RewriteCond %{REQUEST_URI} /m/water-quality/$
RewriteRule ^m/water-quality/(.*)$ wp-admin/admin-ajax.php?action=cura_mobile&%{QUERY_STRING} [NC,L]

RewriteCond %{REQUEST_URI} /water-quality/.*$
RewriteRule (?:^|/)water-quality/(.+)$ wp-admin/admin-ajax.php?action=cura_$1&%{QUERY_STRING} [NC,L]
</pre></li>
<li>The shortcode to trigger the plugin is [water-quality]</li>
</ol>
