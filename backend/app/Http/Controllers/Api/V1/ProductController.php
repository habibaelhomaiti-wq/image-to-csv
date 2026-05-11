<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Product;
use App\Services\AI\AIServiceInterface;
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
        $request->validate([
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp,avif|max:5120',
            'images' => 'required|array|min:1',
            'product_list_id' => 'nullable|exists:product_lists,id',
        ]);

        $products = [];
        $listId = $request->product_list_id;

        foreach ($request->file('images') as $image) {
            $path = $image->store('products/images', 'public');
            
            $product = Product::create([
                'user_id' => $request->user()->id,
                'product_list_id' => $listId,
                'image_path' => $path,
                'status' => 'pending',
            ]);
            $products[] = $product;
        }

        // If part of a list, update list status
        if ($listId) {
            \App\Models\ProductList::where('id', $listId)->update(['status' => 'analyzing']);
        }

        // Dispatch batch background job
        \App\Jobs\ProcessProductBatch::dispatch($products);

        return response()->json([
            'message' => count($products) . ' images téléchargées. Analyse groupée en cours.',
            'products' => $products
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

        return response()->json(null, 204);
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        return response()->json(null, 204);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:products,id'
        ]);

        $products = Product::whereIn('id', $request->ids)
            ->where('user_id', $request->user()->id)
            ->get();

        foreach ($products as $product) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $product->delete();
        }

        return response()->json(['message' => count($products) . ' produits supprimés.']);
    }
}
