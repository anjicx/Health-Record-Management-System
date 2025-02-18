<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(UserResource::collection(User::all()));

    }

  
    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $user = UserResource::create($request->all());
        return response()->json($user, 201);
    
    }

   
    public function show(User $user)
    {
        return $user;
    }

    
    public function edit(User $user)
    {
        //
    }

    
    public function update(Request $request, User $user)
    {
        //
    }

    
    public function destroy(User $user)
    {
        //
    }
}
