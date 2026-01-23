<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'sku',
        'active',
        'image_url'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'active' => 'boolean'
    ];
}