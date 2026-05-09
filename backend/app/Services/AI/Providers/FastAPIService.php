<?php

namespace App\Services\AI\Providers;

use App\Services\AI\AIServiceInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Facades\Storage;

class FastAPIService implements AIServiceInterface
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.ai.base_url', 'http://localhost:5000');
    }

    public function analyze(string|array $imagePaths): array
    {
        $isBatch = is_array($imagePaths);
        $paths = $isBatch ? $imagePaths : [$imagePaths];
        
        Log::info("AI Analysis triggered for " . count($paths) . " image(s).");

        try {
            $request = Http::timeout(60);
            
            foreach ($paths as $path) {
                $imageFullPath = Storage::disk('public')->path($path);
                if (file_exists($imageFullPath)) {
                    $request->attach('images', file_get_contents($imageFullPath), basename($imageFullPath));
                }
            }

            $response = $request->post("{$this->baseUrl}/api/analyze/");

            if ($response->failed()) {
                Log::error("AI Service Error: " . $response->body());
                throw new \Exception("AI Service request failed with status: " . $response->status());
            }

            $results = $response->json();
            
            if (!$isBatch) {
                $aiData = is_array($results) && count($results) > 0 ? $results[0] : $results;
                return $this->mapResult($aiData);
            }

            return array_map([$this, 'mapResult'], $results);

        } catch (\Exception $e) {
            Log::error("Failed to connect to AI Service: " . $e->getMessage());
            throw $e;
        }
    }

    protected function mapResult(array $aiData): array
    {
        return [
            'name' => $aiData['nom'] ?? ($aiData['name'] ?? null),
            'description' => $aiData['description'] ?? null,
            'brand' => $aiData['marque'] ?? ($aiData['brand'] ?? null),
            'category' => $aiData['categorie'] ?? ($aiData['category'] ?? null),
            'color' => $aiData['couleur'] ?? ($aiData['color'] ?? []),
            'confidence_score' => $aiData['confiance'] ?? ($aiData['confidence'] ?? 0),
            'raw_results' => $aiData,
        ];
    }
}
