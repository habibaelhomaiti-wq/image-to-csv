<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Product;
use App\Services\AI\AIServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    protected $aiService;

    public function __construct(AIServiceInterface $aiService)
    {
        $this->aiService = $aiService;
    }

    public function index(Request $request)
    {
        return $request->user()->products()->latest()->paginate(20);
    }

    public function store(Request $request)
    {
        // This is the 'Analyze' endpoint
        $request->validate([
            'image' => 'required|image|max:5120', // 5MB max
        ]);

        $path = $request->file('image')->store('products/images', 'public');

        $product = Product::create([
            'user_id' => $request->user()->id,
            'image_path' => $path,
            'status' => 'pending',
        ]);

        // Dispatch background job for AI Analysis
        \App\Jobs\ProcessProductImage::dispatch($product);

        return response()->json([
            'message' => 'L\'image a été téléchargée et l\'analyse est en cours.',
            'product' => $product
        ], 202);
    }

    public function show(Product $product)
    {
        $this->authorize('view', $product);
        return $product;
    }

    public function update(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'brand' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
        ]);

        $product->update($validated);

        return response()->json($product);
    }
}
