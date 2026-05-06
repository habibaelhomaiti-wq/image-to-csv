<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Product;
use App\Models\Platform;
use App\Models\Export;
use App\Services\Export\ExportServiceInterface;
use Illuminate\Http\Request;

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
}
