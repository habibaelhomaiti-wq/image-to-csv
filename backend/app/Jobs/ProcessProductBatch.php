<?php

namespace App\Jobs;

use App\Models\Product;
use App\Services\AI\AIServiceInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessProductBatch implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected array $products
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AIServiceInterface $aiService): void
    {
        try {
            $paths = array_map(fn($p) => $p->image_path, $this->products);
            
            $allAiData = $aiService->analyze($paths);
            
            foreach ($this->products as $index => $product) {
                if (isset($allAiData[$index])) {
                    $aiData = $allAiData[$index];
                    $product->update([
                        'name' => $aiData['name'] ?? null,
                        'description' => $aiData['description'] ?? null,
                        'brand' => $aiData['brand'] ?? null,
                        'category' => $aiData['category'] ?? null,
                        'status' => 'analyzed',
                        'ai_raw_metadata' => $aiData,
                    ]);
                }
            }

            Log::info(count($this->products) . " products successfully processed by AI batch.");
        } catch (\Exception $e) {
            foreach ($this->products as $product) {
                $product->update(['status' => 'failed']);
            }
            Log::error("AI batch processing failed: " . $e->getMessage());
            throw $e;
        }
    }
}
