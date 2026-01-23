<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $sortBy = $request->input('sort', 'created_at');
        $sortOrder = $request->input('order', 'desc');
        
        $perPage = min(max((int)$perPage, 1), 100);   
        
        $allowedSortFields = ['id', 'name', 'price', 'created_at', 'updated_at', 'sku'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }
        
        $sortOrder = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';

        $products = Product::orderBy($sortBy, $sortOrder)
                           ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'total_pages' => $products->lastPage(),
                'total_items' => $products->total(),
                'per_page' => $products->perPage(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem()
            ],
            'user' => [
                'id' => $request->attributes->get('user_id'),
                'email' => $request->attributes->get('user_email'),
                'role' => $request->attributes->get('user_role')
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sku' => 'required|string|unique:products,sku',
            'active' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('products', $imageName, 'public');
            $data['image_url'] = '/storage/' . $imagePath;
        }

        $product = Product::create($data);

        \Log::info('Product created by admin', [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'sku' => $product->sku,
            'admin_id' => $request->attributes->get('user_id'),
            'admin_email' => $request->attributes->get('user_email')
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully. Register inventory in Inventario Service.',
            'data' => $product
        ], 201);
    }

    public function show(string $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }


        return response()->json([
            'success' => true,
            'data' => $product
        ], 200);
    }

    public function update(Request $request, string $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'sku' => 'string|unique:products,sku,' . $id,
            'active' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            if ($product->image_url) {
                $oldImagePath = str_replace('/storage/', '', $product->image_url);
                \Storage::disk('public')->delete($oldImagePath);
            }
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('products', $imageName, 'public');
            $data['image_url'] = '/storage/' . $imagePath;
        }

        $product->update($data);

        \Log::info('Product updated by admin', [
            'product_id' => $product->id,
            'admin_id' => $request->attributes->get('user_id'),
            'admin_email' => $request->attributes->get('user_email')
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product
        ], 200);
    }

    public function destroy(Request $request, string $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        if ($product->image_url) {
            $imagePath = str_replace('/storage/', '', $product->image_url);
            \Storage::disk('public')->delete($imagePath);
        }

        \Log::info('Product deleted by admin', [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'sku' => $product->sku,
            'admin_id' => $request->attributes->get('user_id'),
            'admin_email' => $request->attributes->get('user_email')
        ]);

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully. Consider updating Inventario Service.'
        ], 200);
    }

    public function validateStock(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $results = [];
        $allAvailable = true;

        foreach ($request->items as $item) {
            $product = Product::find($item['id']);

            if (!$product) {
                $results[] = [
                    'product_id' => $item['id'],
                    'requested_quantity' => $item['quantity'],
                    'is_available' => false,
                    'error' => 'Product not found'
                ];
                $allAvailable = false;
                continue;
            }

            if (!$product->active) {
                $results[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'requested_quantity' => $item['quantity'],
                    'available_stock' => 0,
                    'is_available' => false,
                    'price' => $product->price,
                    'error' => 'Product is not active'
                ];
                $allAvailable = false;
                continue;
            }

            $availableStock = $product->stock ?? 0;

            $isAvailable = $availableStock >= $item['quantity'];

            if (!$isAvailable) {
                $allAvailable = false;
            }

            $results[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_sku' => $product->sku,
                'requested_quantity' => $item['quantity'],
                'available_stock' => $availableStock,
                'is_available' => $isAvailable,
                'price' => (float)$product->price,
                'subtotal' => (float)$product->price * $item['quantity']
            ];
        }

        return response()->json([
            'success' => true,
            'all_available' => $allAvailable,
            'data' => $results,
            'summary' => [
                'total_products' => count($results),
                'available_count' => count(array_filter($results, fn($r) => $r['is_available'])),
                'unavailable_count' => count(array_filter($results, fn($r) => !$r['is_available'])),
                'total_amount' => array_sum(array_column($results, 'subtotal'))
            ]
        ], 200);
    }

    public function updateStock(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        \DB::beginTransaction();
        
        try {
            $results = [];
            
            foreach ($request->items as $item) {
                $product = Product::find($item['id']);
                
                if (!$product) {
                    \DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Product with ID {$item['id']} not found"
                    ], 404);
                }
                
                $newStock = $product->stock + $item['quantity'];
                
                if ($newStock < 0) {
                    \DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Insufficient stock for product '{$product->name}'. Available: {$product->stock}, Requested: " . abs($item['quantity'])
                    ], 400);
                }
                
                $product->stock = $newStock;
                $product->save();
                
                $results[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'previous_stock' => $product->stock - $item['quantity'],
                    'quantity_change' => $item['quantity'],
                    'new_stock' => $product->stock
                ];
                
                \Log::info('Stock updated for product', [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity_change' => $item['quantity'],
                    'new_stock' => $product->stock
                ]);
            }
            
            \DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Stock updated successfully',
                'data' => $results
            ], 200);
            
        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('Error updating stock', [
                'error' => $e->getMessage(),
                'items' => $request->items
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error updating stock: ' . $e->getMessage()
            ], 500);
        }
    }
}