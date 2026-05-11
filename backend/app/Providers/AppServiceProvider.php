<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Services\AI\AIServiceInterface::class,
            \App\Services\AI\Providers\FastAPIService::class
        );

        $this->app->bind(
            \App\Services\Export\ExportServiceInterface::class,
            \App\Services\Export\CSVExporter::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Schema::defaultStringLength(191);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\ProductList::class, \App\Policies\ProductListPolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Product::class, \App\Policies\ProductPolicy::class);
    }
}
