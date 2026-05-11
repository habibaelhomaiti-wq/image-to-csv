<?php

namespace App\Policies;

use App\Models\ProductList;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProductListPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ProductList $productList): bool
    {
        return $user->id === $productList->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ProductList $productList): bool
    {
        return $user->id === $productList->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ProductList $productList): bool
    {
        return $user->id === $productList->user_id;
    }
}
