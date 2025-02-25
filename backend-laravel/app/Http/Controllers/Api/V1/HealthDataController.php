<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\HealthData;
use Illuminate\Http\Request;

class HealthDataController extends Controller
{
    public function generateHealthData(Request $request)
    {
        try {

            $user = auth()->user(); // Trenutno ulogovani korisnik 
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $validated = $request->validate([
                'device_id' => 'required|integer|exists:device,id',
            ]);

            $device_id = $validated['device_id'];


            // Generiši 150 HealthData zapisa za odabrani uređaj i korisnika
            HealthData::factory()
                ->count(150)
                ->create([
                    'user_id' => $user->id, // Postavi ID trenutno ulogovanog korisnika
                    'device_id' => $device_id, // Dodaj device_id direktno u create

                ]);

            return response()->json(['message' => 'Your data is successfully loaded.']);//uspešno upisano u bazu


        } catch (\Exception $e) {
            \Log::error('Error in generateHealthData: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
    public function index()
    {
        //
    }


    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }


    public function show(HealthData $healthData)
    {
        //
    }

    public function edit(HealthData $healthData)
    {
        //
    }


    public function update(Request $request, HealthData $healthData)
    {
        //
    }


    public function destroy(HealthData $healthData)
    {
        //
    }
}
