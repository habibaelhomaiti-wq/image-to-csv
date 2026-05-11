<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Platform;

class PlatformSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $platforms = [
            ['name' => 'Jumia Maroc', 'slug' => 'jumia-ma'],
            ['name' => 'Avito.ma', 'slug' => 'avito-ma'],
            ['name' => 'Marjane Online', 'slug' => 'marjane-ma'],
            ['name' => 'Shopify', 'slug' => 'shopify'],
            ['name' => 'WooCommerce', 'slug' => 'woocommerce'],
        ];

        foreach ($platforms as $platform) {
            Platform::updateOrCreate(['slug' => $platform['slug']], $platform);
        }
    }
}
