<?php

namespace App\Services\Export;

use App\Models\Product;
use App\Models\Platform;

interface ExportServiceInterface
{
    /**
     * Generate a CSV file for a specific product and platform.
     *
     * @param Product $product
     * @param Platform $platform
     * @return string The URL or path to the generated file
     */
    public function generate(Product $product, Platform $platform): string;

    /**
     * Generate a CSV file for multiple products and a platform.
     *
     * @param \Illuminate\Support\Collection|array $products
     * @param Platform $platform
     * @return string
     */
    public function generateBatch($products, Platform $platform): string;
}
