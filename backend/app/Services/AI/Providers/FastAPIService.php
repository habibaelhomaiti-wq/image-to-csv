<?php

namespace App\Services\AI\Providers;

use App\Services\AI\AIServiceInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FastAPIService implements AIServiceInterface
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.ai.base_url', 'http://localhost:8000');
    }

    public function analyze(string $imagePath): array
    {
        // For now, returning mock data as the microservice might not be ready
        // In production, this would use Http::attach('image', ...) to send to FastAPI
        
        Log::info("AI Analysis triggered for: {$imagePath}");

        // Simulate a delay (optional)
        // usleep(500000); 

        return [
            'name' => 'Produit Détecté ' . rand(100, 999),
            'description' => 'Ceci est une description générée automatiquement par l\'IA pour le produit.',
            'brand' => 'Marque Générique',
            'category' => 'Électronique',
            'color' => 'Noir',
            'confidence_score' => 0.95,
            'raw_results' => [
                'labels' => ['product', 'gadget', 'tech'],
            ]
        ];
    }
}
