<?php

namespace App\Services\Export\Strategies;

use App\Models\Product;

class DynamicPlatformStrategy implements PlatformStrategyInterface
{
    protected array $mapping;
    protected array $defaults = [
        'name' => 'Product Name',
        'description' => 'Description',
        'price' => 'Price',
        'category' => 'Category',
        'brand' => 'Brand',
        'image_url' => 'Image URL',
    ];

    public function __construct(?array $mapping)
    {
        $this->mapping = $mapping ?? [];
    }

    public function getHeaders(): array
    {
        $headers = [];
        foreach ($this->defaults as $field => $defaultLabel) {
            // Use custom label if specified and not empty, otherwise use default
            $headers[] = (!empty($this->mapping[$field])) ? $this->mapping[$field] : $defaultLabel;
        }
        return $headers;
    }

    public function map(Product $product): array
    {
        $row = [];
        foreach ($this->defaults as $field => $defaultLabel) {
            $row[] = $this->getFieldValue($product, $field);
        }
        return $row;
    }

    protected function getFieldValue(Product $product, string $field): string
    {
        switch ($field) {
            case 'name': return $product->name ?? '';
            case 'description': return $product->description ?? '';
            case 'price': return (string) ($product->price ?? '');
            case 'category': return $product->category ?? '';
            case 'brand': return $product->brand ?? '';
            case 'image_url': return $product->image_path ? url('storage/' . $product->image_path) : '';
            default: return '';
        }
    }
}
