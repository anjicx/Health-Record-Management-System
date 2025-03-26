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

    public function update(Request $request)
    {
        // \Log::info('PATCH /api/user data:', $request->all()); // ulazni podaci

        $user = auth()->user(); // Autentifikovan korisnik
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $validatedProfileData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'surname' => 'sometimes|string|max:255',
            'age' => 'sometimes|integer',
            'weight' => 'sometimes|numeric',
            'height' => 'sometimes|numeric',
        ]);

        // Ako nema podataka za update
        if (empty($validatedProfileData)) {
            return response()->json(['message' => 'No data provided for update.'], 400);
        }

        // Update ili kreiranje profile 
        if (!empty($validatedProfileData)) {
            if ($user->profile) {
                $user->profile->update($validatedProfileData);
            } else {
                $user->profile()->create($validatedProfileData);
            }
        }

        return response()->json([
            'message' => 'Successfully updated profile.',
            'user' => $user->load('profile') // Vraća korisnika sa ažuriranim profilom
        ]);
    }



}
