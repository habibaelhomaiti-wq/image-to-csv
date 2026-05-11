<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Platform;
use Illuminate\Http\Request;

class PlatformController extends Controller
{
    public function index()
    {
        return Platform::all();
    }

    public function update(Request $request, Platform $platform)
    {
        $validated = $request->validate([
            'mapping_config' => 'required|array',
            'is_active' => 'sometimes|boolean'
        ]);

        $platform->update($validated);

        return response()->json($platform);
    }
}
