<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Platform;
use App\Models\Export;
use App\Services\Export\ExportServiceInterface;

class ExportController extends Controller
{
    protected $exportService;

    public function __construct(ExportServiceInterface $exportService)
    {
        $this->exportService = $exportService;
    }

    public function index(Request $request)
    {
        return $request->user()->exports()->with(['product', 'platform'])->latest()->paginate(20);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'platform_id' => 'required|exists:platforms,id',
        ]);

        $product = Product::findOrFail($request->product_id);
        $platform = Platform::findOrFail($request->platform_id);

        $this->authorize('update', $product);

        try {
            $fileUrl = $this->exportService->generate($product, $platform);

            $export = Export::create([
                'user_id' => $request->user()->id,
                'product_id' => $product->id,
                'platform_id' => $platform->id,
                'file_url' => $fileUrl,
            ]);

            return response()->json($export, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'La génération du CSV a échoué', 'error' => $e->getMessage()], 500);
        }
    }

    public function storeList(Request $request)
    {
        $request->validate([
            'product_list_id' => 'required|exists:product_lists,id',
            'platform_id' => 'required|exists:platforms,id',
        ]);

        $list = \App\Models\ProductList::with('products')->findOrFail($request->product_list_id);
        $platform = Platform::findOrFail($request->platform_id);

        $this->authorize('view', $list);

        $completedProducts = $list->products->filter(fn($p) => in_array($p->status, ['completed', 'analyzed']));

        if ($completedProducts->isEmpty()) {
            return response()->json(['message' => 'Aucun produit prêt à être exporté dans cette liste.'], 400);
        }

        try {
            $fileUrl = $this->exportService->generateBatch($completedProducts, $platform);

            $export = Export::create([
                'user_id' => $request->user()->id,
                'product_list_id' => $list->id,
                'platform_id' => $platform->id,
                'file_url' => $fileUrl,
            ]);

            return response()->json($export, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'La génération du CSV groupé a échoué', 'error' => $e->getMessage()], 500);
        }
    }

    public function download($id)
    {
        $export = Export::findOrFail($id);
        $this->authorize('view', $export->product_id ? Product::find($export->product_id) : \App\Models\ProductList::find($export->product_list_id));

        $path = str_replace(url('storage/'), '', $export->file_url);
        $path = ltrim($path, '/');

        if (!Storage::disk('public')->exists($path)) {
            return abort(404);
        }

        return Storage::disk('public')->download($path);
    }
}
