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
        $products = Product::all();

        return response()->json([
            'success' => true,
            'data' => $products,
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

        // TEMPORARY WORKAROUND: Inventario Service is unhealthy
        // Hardcoding stock until service is fixed
        $product->stock = 50;

        /* TODO: Re-enable once Inventario Service is healthy
        try {
            $inventarioUrl = env('INVENTARIO_SERVICE_URL', 'http://inventario_api:5002');
            $response = \Http::get("{$inventarioUrl}/sku/{$product->sku}");

            if ($response->successful()) {
                $inventoryData = $response->json();
                $product->stock = $inventoryData['stock'] ?? 0;
            } else {
                $product->stock = 0;
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to fetch inventory for product', [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'error' => $e->getMessage()
            ]);
            $product->stock = 0;
        }
        */

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
            // Delete old image if exists
            if ($product->image_url) {
                $oldImagePath = str_replace('/storage/', '', $product->image_url);
                \Storage::disk('public')->delete($oldImagePath);
            }

            // Store new image
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

        // Delete image if exists
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
}