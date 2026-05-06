<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Platform extends Model
{
    /** @use HasFactory<\Database\Factories\PlatformFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'mapping_config',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'mapping_config' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
