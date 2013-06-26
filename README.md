WE-Upload
=========

Extra steps to make the plugin work:
<ol>
<li style="text-decoration:line-through"><p>Add below lines to WordPress' .htaccess</p>
<pre>
RewriteCond %{REQUEST_URI} /m/water-quality/$
RewriteRule ^m/water-quality/(.*)$ wp-admin/admin-ajax.php?action=cura_mobile&%{QUERY_STRING} [NC,L]

RewriteCond %{REQUEST_URI} /water-quality/.*$
RewriteRule (?:^|/)water-quality/(.+)$ wp-admin/admin-ajax.php?action=cura_$1&%{QUERY_STRING} [NC,L]
</pre>
<p>And insert them to right place</p>
<pre>RewriteRule ^index\.php$ - [L]

# above lines should be probably here

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [L]</pre>
</li>
<li>Create a page with /water-quality/ URL and use [water-quality] as page content to trigger the plugin of Desktop version</li>
<li>In order to support password protected Mobile version, below 2 pages are needed again. But [water-quality] shortcode is no longer required.
  <ol>
    <li>Create a page with /m/ URL as parent URL</li>
    <li>Create a page with /m/water-quality/ URL and use password to protect it.</li>
  </ol>
</li>
<li><p>Plugin installation NOTES of ZIP format:</p>
  <ul>
    <li>Make a ZIP format package of the source files on Github</li>
    <li>Make sure <wordpress_root>/wp-content/uploads exits and writable</li>
    <li>Make sure the owner of file <wordpress_root>/wp-admin/includes/update.php the same as the owner of the httpd process, this is to avoid the requirement of ftp access information. For example, if the Apache User/Group configured in httpd.conf is _www/_www, then simply use chown -R _www:_www <wordpress_root></p></li>
    <li>Make sure the directory <wordpress_root>/wp-content/plugins writable and <wordpress_root>/wp-content/upgrade writable if it is existing</li>
    <li>Currently the uploaded photo file size is limited by 'upload_max_filesize' in php.ini, so we need to ask the server administrator for support, 5M is required</li>
    <li>A filename of water-quality.zip to be uploaded and install is preferred</li>
    <li>Need php-gd library enabled to generate photo thumbnail</li>
</ol>
