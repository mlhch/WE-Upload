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
<li><p>Plugin installation NOTES of ZIP format:</p>
  <ul>
    <li>Make sure the owner of file <wordpress_root>/wp-admin/includes/update.php the same as the owner of the httpd process, this is to avoid the requirement of ftp access information. </p></li>
    <li>Make sure the directory <wordpress_root>/wp-content/plugins writable(7xx) and <wordpress_root>/wp-content/upgrade writable(7xx) if it is existing</li>
</ol>
