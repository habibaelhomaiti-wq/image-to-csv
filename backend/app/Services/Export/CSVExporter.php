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
        $className = "App\\Services\\Export\\Strategies\\" . Str::studly($platform->slug) . "Strategy";

        if (!class_exists($className)) {
            throw new \Exception("Export strategy not found for platform: {$platform->name}");
        }

        return new $className();
    }

    public function generate(Product $product, Platform $platform): string
    {
        $strategy = $this->resolveStrategy($platform);
        
        $headers = $strategy->getHeaders();
        $data = $strategy->map($product);

        $fileName = 'exports/' . Str::slug($platform->name) . '_' . $product->id . '_' . time() . '.csv';
        
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, $headers);
        fputcsv($handle, $data);
        rewind($handle);
        
        $content = stream_get_contents($handle);
        fclose($handle);

        Storage::disk('public')->put($fileName, $content);

        return Storage::url($fileName);
    }
}
