<?php

namespace App\Services\Export;

use App\Models\Product;
use App\Models\Platform;
use App\Services\Export\Strategies\PlatformStrategyInterface;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CSVExporter implements ExportServiceInterface
{
    /**
     * Resolve the strategy class based on platform slug.
     */
    protected function resolveStrategy(Platform $platform): PlatformStrategyInterface
    {
        // 1. If dynamic mapping exists, use it
        if ($platform->mapping_config && count($platform->mapping_config) > 0) {
            return new \App\Services\Export\Strategies\DynamicPlatformStrategy($platform->mapping_config);
        }

        // 2. Try to find a static strategy class
        $className = "App\\Services\\Export\\Strategies\\" . Str::studly($platform->slug) . "Strategy";

        if (class_exists($className)) {
            return new $className();
        }

        // 3. Final fallback: Dynamic strategy with system defaults
        return new \App\Services\Export\Strategies\DynamicPlatformStrategy([]);
    }

    public function generate(Product $product, Platform $platform): string
    {
        $strategy = $this->resolveStrategy($platform);
        
        $headers = $strategy->getHeaders();
        $data = $strategy->map($product);

        $fileName = 'exports/' . \Illuminate\Support\Str::slug($platform->name) . '_' . $product->id . '_' . time() . '.csv';
        
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, $headers);
        fputcsv($handle, $data);
        rewind($handle);
        
        $content = stream_get_contents($handle);
        fclose($handle);

        \Illuminate\Support\Facades\Storage::disk('public')->put($fileName, $content);

        return \Illuminate\Support\Facades\Storage::disk('public')->url($fileName);
    }

    public function generateBatch($products, Platform $platform): string
    {
        $strategy = $this->resolveStrategy($platform);
        
        $headers = $strategy->getHeaders();
        $fileName = 'exports/batch_' . \Illuminate\Support\Str::slug($platform->name) . '_' . time() . '.csv';
        
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, $headers);
        
        foreach ($products as $product) {
            $data = $strategy->map($product);
            fputcsv($handle, $data);
        }
        
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        \Illuminate\Support\Facades\Storage::disk('public')->put($fileName, $content);

        return \Illuminate\Support\Facades\Storage::disk('public')->url($fileName);
    }
}
