<?php

namespace App\Services\Export\Strategies;

use App\Models\Product;

interface PlatformStrategyInterface
{
    /**
     * Map product data to platform-specific CSV columns.
     *
     * @param Product $product
     * @return array
     */
    public function map(Product $product): array;

    /**
     * Get CSV headers for the platform.
     *
     * @return array
     */
    public function getHeaders(): array;
}
