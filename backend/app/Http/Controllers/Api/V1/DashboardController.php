<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductList;
use App\Models\Export;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $stats = [
            [
                'id' => 1,
                'label' => 'Total Produits',
                'value' => Product::where('user_id', $user->id)->count(),
                'trend' => 'up',
                'change' => '+12%' // Hardcoded for UI demo
            ],
            [
                'id' => 2,
                'label' => 'Listes Créées',
                'value' => ProductList::where('user_id', $user->id)->count(),
                'trend' => 'up',
                'change' => '+5%'
            ],
            [
                'id' => 3,
                'label' => 'Fichiers Exportés',
                'value' => Export::where('user_id', $user->id)->count(),
                'trend' => 'up',
                'change' => '+18%'
            ]
        ];

        $recentProducts = Product::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_products' => $recentProducts
        ]);
    }
}
