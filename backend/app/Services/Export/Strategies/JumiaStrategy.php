<?php

namespace App\Services\Export\Strategies;

use App\Models\Product;

class JumiaStrategy implements PlatformStrategyInterface
{
    public function getHeaders(): array
    {
        return [
            'Seller SKU',
            'Product Name',
            'Description',
            'Brand',
            'Price',
            'Quantity',
            'Main Image URL'
        ];
    }

    public function map(Product $product): array
    {
        return [
            $product->id,
            $product->name,
            $product->description,
            $product->brand ?? 'Generic',
            $product->price,
            $product->stock,
            asset('storage/' . $product->image_path)
        ];
    }
}
