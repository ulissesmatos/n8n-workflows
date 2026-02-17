# WordPress Integration Guide

This guide explains how to integrate the n8n Workflow Library into your WordPress site.

## 📋 Table of Contents

1. [Embedding Workflows](#embedding-workflows)
2. [WordPress Plugin](#wordpress-plugin)
3. [Custom Integration](#custom-integration)
4. [Security Considerations](#security-considerations)
5. [Troubleshooting](#troubleshooting)

## 🎯 Embedding Workflows

### Method 1: iFrame Embed (Recommended)

The simplest way to embed a workflow detail page in WordPress:

```html
<iframe 
  src="https://your-workflow-domain.com/#/embed/workflow-slug"
  width="100%"
  height="500"
  frameborder="0"
  allow="none"
  style="border: 1px solid #ddd; border-radius: 8px;"
></iframe>
```

**Parameters:**
- `width` - Width of the iframe (pixels or percentage)
- `height` - Height of the iframe (pixels)
- `frameborder` - Border display (0 = no border)

#### WordPress Block

Add block with custom HTML:

1. In WordPress Editor, add a "Custom HTML" block
2. Paste the iframe code
3. Publish

#### WordPress Shortcode (Manual)

Create a custom shortcode by adding to `functions.php`:

```php
add_shortcode('n8n_workflow', function($atts) {
    $defaults = [
        'slug' => '',
        'width' => '100%',
        'height' => '500',
    ];
    $atts = shortcode_atts($defaults, $atts);
    
    if (empty($atts['slug'])) {
        return 'Error: workflow slug required';
    }
    
    $domain = get_option('n8n_workflow_domain', 'https://your-domain.com');
    
    return sprintf(
        '<iframe src="%s/#/embed/%s" width="%s" height="%s" frameborder="0" style="border: 1px solid #ddd; border-radius: 8px;"></iframe>',
        esc_url($domain),
        esc_attr($atts['slug']),
        esc_attr($atts['width']),
        esc_attr($atts['height'])
    );
});
```

Usage in posts/pages:
```
[n8n_workflow slug="workflow-slug" height="600"]
```

### Method 2: Script Tag Embed

For lightweight embedding without loading the entire SPA:

```html
<script src="https://your-workflow-domain.com/api/v1/embed/workflow-slug/script"></script>
<div id="n8n-workflow-embed"></div>
```

**Advantages:**
- Minimal payload
- Single HTTP request
- Self-contained styling
- No iframe overhead

## 🔌 WordPress Plugin

Create a WordPress plugin for easy management:

### Step 1: Create Plugin Structure

```
wp-content/plugins/n8n-workflows/
├── n8n-workflows.php          # Main plugin file
├── includes/
│   ├── admin-menu.php         # Settings page
│   ├── shortcode.php          # Shortcode handler
│   └── enqueue.php            # Scripts & styles
├── assets/
│   ├── css/
│   │   └── n8n-embed.css
│   └── js/
│       └── n8n-embed.js
└── readme.txt
```

### Step 2: Main Plugin File

```php
<?php
/**
 * Plugin Name: n8n Workflows
 * Plugin URI: https://your-domain.com
 * Description: Embed n8n workflow library in WordPress
 * Version: 1.0.0
 * Author: Your Name
 * License: MIT
 */

if (!defined('ABSPATH')) exit;

// Define constants
define('N8N_WORKFLOWS_PATH', plugin_dir_path(__FILE__));
define('N8N_WORKFLOWS_URL', plugin_dir_url(__FILE__));
define('N8N_WORKFLOWS_VERSION', '1.0.0');

// Include files
require_once N8N_WORKFLOWS_PATH . 'includes/admin-menu.php';
require_once N8N_WORKFLOWS_PATH . 'includes/shortcode.php';
require_once N8N_WORKFLOWS_PATH . 'includes/enqueue.php';

// Activation hook
register_activation_hook(__FILE__, function() {
    add_option('n8n_workflows_domain', 'https://your-domain.com');
    add_option('n8n_workflows_cache_ttl', 3600);
});

// Deactivation hook
register_deactivation_hook(__FILE__, function() {
    delete_option('n8n_workflows_domain');
    delete_option('n8n_workflows_cache_ttl');
});
?>
```

### Step 3: Admin Settings Page

```php
<?php
// includes/admin-menu.php

add_action('admin_menu', function() {
    add_menu_page(
        'n8n Workflows',
        'n8n Workflows',
        'manage_options',
        'n8n_workflows',
        'n8n_workflows_render_page',
        'dashicons-admin-plugins'
    );
});

function n8n_workflows_render_page() {
    ?>
    <div class="wrap">
        <h1>n8n Workflows Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields('n8n_workflows'); ?>
            <?php do_settings_sections('n8n_workflows'); ?>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

add_action('admin_init', function() {
    register_setting('n8n_workflows', 'n8n_workflows_domain');
    register_setting('n8n_workflows', 'n8n_workflows_cache_ttl');
    
    add_settings_section(
        'n8n_workflows_main',
        'Configuration',
        '__return_false',
        'n8n_workflows'
    );
    
    add_settings_field(
        'n8n_workflows_domain',
        'Workflow Library Domain',
        function() {
            $domain = get_option('n8n_workflows_domain');
            echo '<input type="text" name="n8n_workflows_domain" value="' . esc_attr($domain) . '" />';
        },
        'n8n_workflows',
        'n8n_workflows_main'
    );
    
    add_settings_field(
        'n8n_workflows_cache_ttl',
        'Cache TTL (seconds)',
        function() {
            $ttl = get_option('n8n_workflows_cache_ttl', 3600);
            echo '<input type="number" name="n8n_workflows_cache_ttl" value="' . esc_attr($ttl) . '" />';
        },
        'n8n_workflows',
        'n8n_workflows_main'
    );
});
?>
```

### Step 4: Shortcode Handler

```php
<?php
// includes/shortcode.php

add_shortcode('n8n_workflow', function($atts) {
    $defaults = [
        'slug' => '',
        'title' => true,
        'width' => '100%',
        'height' => '500',
    ];
    $atts = shortcode_atts($defaults, $atts);
    
    if (empty($atts['slug'])) {
        return '<p style="color: red;">Error: workflow slug required</p>';
    }
    
    $domain = get_option('n8n_workflows_domain');
    $cache_key = 'n8n_workflow_' . sanitize_key($atts['slug']);
    
    // Check cache
    $workflow = wp_cache_get($cache_key);
    
    if (!$workflow) {
        // Fetch from API
        $response = wp_remote_get(
            $domain . '/api/v1/workflows/' . sanitize_text_field($atts['slug'])
        );
        
        if (is_wp_error($response)) {
            return '<p style="color: red;">Error loading workflow</p>';
        }
        
        $workflow = json_decode(wp_remote_retrieve_body($response), true);
        
        // Cache result
        $ttl = (int) get_option('n8n_workflows_cache_ttl', 3600);
        wp_cache_set($cache_key, $workflow, '', $ttl);
    }
    
    return sprintf(
        '<iframe src="%s/#/embed/%s" width="%s" height="%s" frameborder="0" style="border: 1px solid #ddd; border-radius: 8px;"></iframe>',
        esc_url($domain),
        esc_attr($atts['slug']),
        esc_attr($atts['width']),
        esc_attr($atts['height'])
    );
});
?>
```

## 🔐 Security Considerations

### 1. CORS Configuration

The backend must be configured to allow requests from your WordPress domain:

```bash
# .env
CORS_ORIGIN=https://your-wordpress-domain.com,https://www.your-wordpress-domain.com
```

### 2. Content Security Policy

WordPress may enforce CSP headers. Update your configuration:

```php
add_filter('wp_headers', function($headers) {
    // Allow embedding from your workflow library
    $headers['Content-Security-Policy'] = "frame-src https://your-domain.com;";
    return $headers;
});
```

### 3. X-Frame-Options Header

Ensure the header is NOT set to `DENY`:

Backend configuration in `docker/nginx.conf`:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
```

### 4. Authentication Tokens

Never expose admin tokens in WordPress:
- Store tokens securely (transients)
- Use HTTP-only cookies
- Implement token refresh mechanism

### 5. Rate Limiting

Implement rate limiting in WordPress:

```php
function n8n_rate_limit_check($slug) {
    $key = 'n8n_requests_' . get_current_user_ip();
    $count = get_transient($key) ?: 0;
    
    if ($count > 30) { // Max 30 requests per minute
        wp_die('Too many requests');
    }
    
    set_transient($key, $count + 1, MINUTE_IN_SECONDS);
}
```

## 📱 Responsive Design

Add responsive CSS to WordPress theme:

```css
/* Responsive iframe */
.n8n-workflow-embed {
    position: relative;
    padding-bottom: 75%; /* 4:3 aspect ratio */
    height: 0;
    overflow: hidden;
    max-width: 100%;
}

.n8n-workflow-embed iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
}
```

## 🐛 Troubleshooting

### iFrame Not Displaying

**Issue**: Blank iframe or "Refused to display" error

**Solutions**:
1. Check CORS settings in backend `.env`
2. Verify X-Frame-Options header is not "DENY"
3. Check browser console for errors
4. Verify domain is accessible

### Styling Issues

**Issue**: Iframe content doesn't match expected styling

**Solutions**:
1. Check CSP headers allow style-src
2. Verify embed.css is loading
3. Check for CSS conflicts with WordPress theme

### API Errors

**Issue**: 404 or authentication errors

**Solutions**:
1. Verify workflow slug is correct
2. Check workflow is published
3. Verify API domain is correct
4. Check rate limiting isn't triggered

### Cache Issues

**Issue**: Old version of workflow showing

**Solutions**:
```php
// Clear WordPress cache
wp_cache_delete('n8n_workflow_' . $slug);
wp_cache_flush();
```

## 📊 Analytics & Tracking

Track embed views:

```php
add_action('wp_footer', function() {
    ?>
    <script>
    (function() {
        const embeds = document.querySelectorAll('iframe[src*="/embed/"]');
        embeds.forEach(embed => {
            embed.addEventListener('load', function() {
                // Send analytics event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'workflow_view', {
                        'workflow_id': this.src
                    });
                }
            });
        });
    })();
    </script>
    <?php
});
```

## 🚀 Performance Tips

1. **Enable caching** - Cache workflow metadata
2. **Use CDN** - Serve static assets from CDN
3. **Lazy load iframes** - Use Intersection Observer API
4. **Minify CSS/JS** - Reduce payload size
5. **Enable GZIP** - Compress responses

## 📚 Additional Resources

- [Main README](../README.md)
- [API Documentation](./API.md)
- [Security Checklist](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)
