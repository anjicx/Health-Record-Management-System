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
    $user = auth()->user(); // Trenutno ulogovani korisnik 

    // Uzimamo ID uređaja koji je korisnik odabrao iz zahteva
    $device_id = $request->device_id;

    // Proveri da li uređaj postoji u bazi -jer ti ga vratio react pa provera
    $device = Device::find($device_id);

    if (!$device) {
        return response()->json(['error' => 'Device not found.'], 404);
    }

    // Generiši 150 HealthData zapisa za odabrani uređaj i korisnika
    HealthData::factory()->count(150)->create([
        'user_id' => $user->id,    // Dodeljujemo ID trenutno ulogovanog korisnika
        'device_id' => $device->id // Dodeljujemo ID odabranog uređaja od učitanog find
    ]);

    return response()->json(['message' => 'Your data is successfully loaded.']);//uspešno upisano u bazu
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
