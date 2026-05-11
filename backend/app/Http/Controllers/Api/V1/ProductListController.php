<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ProductList;
use Illuminate\Http\Request;

class ProductListController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->productLists()->withCount('products')->latest()->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $list = ProductList::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json($list, 201);
    }

    public function show(ProductList $product_list)
    {
        $this->authorize('view', $product_list);
        return $product_list->load('products');
    }

    public function update(Request $request, ProductList $product_list)
    {
        $this->authorize('update', $product_list);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:pending,analyzing,completed,failed',
        ]);

        $product_list->update($validated);

        return response()->json($product_list);
    }

    public function destroy(ProductList $product_list)
    {
        $this->authorize('delete', $product_list);
        $product_list->delete();
        return response()->json(null, 204);
    }
}
