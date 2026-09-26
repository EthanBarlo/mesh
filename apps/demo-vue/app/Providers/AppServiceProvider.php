<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Behind Coolify's TLS-terminating proxy the app receives plain HTTP, so
        // force generated URLs (assets, routes) to https in production to avoid
        // mixed-content errors on the https site.
        URL::forceHttps($this->app->isProduction());
    }
}
