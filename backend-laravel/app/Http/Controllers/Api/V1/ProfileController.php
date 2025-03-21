<?php

namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;
class ProfileController extends Controller
{

    public function getUserProfile(Request $request)
    {
        $user = auth()->user(); // Dobijamo trenutno ulogovanog korisnika

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Učitavamo usera zajedno sa njegovim profilom (ako postoji)
        $user->load('profile');

        return response()->json($user);
    }


    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }


    public function show(Profile $profile)
    {
        //
    }

    public function edit(Profile $profile)
    {
        //
    }


    public function update(Request $request, Profile $profile)
    {
        //
    }


    public function destroy(Profile $profile)
    {
        //
    }





}
