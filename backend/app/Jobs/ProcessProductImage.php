<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

use App\Models\Product;
use App\Services\AI\AIServiceInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessProductImage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected Product $product
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AIServiceInterface $aiService): void
    {
        try {
            $aiData = $aiService->analyze($this->product->image_path);
            
            $this->product->update([
                'name' => $aiData['name'] ?? null,
                'description' => $aiData['description'] ?? null,
                'brand' => $aiData['brand'] ?? null,
                'category' => $aiData['category'] ?? null,
                'status' => 'analyzed',
                'ai_raw_metadata' => $aiData,
            ]);

            Log::info("Product #{$this->product->id} successfully processed by AI.");
        } catch (\Exception $e) {
            $this->product->update(['status' => 'failed']);
            Log::error("AI processing failed for Product #{$this->product->id}: " . $e->getMessage());
            
            // Allow retry if needed
            throw $e;
        }
    }
}
