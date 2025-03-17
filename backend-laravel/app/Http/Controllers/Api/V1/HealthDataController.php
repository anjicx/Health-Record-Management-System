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
            // Pronađi poslednji timestamp u bazi
            $lastTimestamp = HealthData::where('device_id', $device_id)
                ->orderBy('timestamp', 'desc')
                ->value('timestamp');

            if (!$lastTimestamp) {
                // Ako nema podataka, kreće se unazad 150h- da bi onda se izgenerisalo 150 redova
                $lastTimestamp = now()->subHours(150);
            } else {
                // Pretvori u Carbon objekat
                $lastTimestamp = \Carbon\Carbon::parse($lastTimestamp);
            }

            // Generiši podatke sve dok ne dostignemo sadašnji trenutak
            $recordsGenerated = 0;
            $currentTime = now();

            while ($lastTimestamp < $currentTime) {
                HealthData::factory()
                    ->create([
                        'user_id' => $user->id,
                        'device_id' => $device_id,
                        'timestamp' => $lastTimestamp->toDateTimeString(), // Postavljamo ručno timestamp
                    ]);

                $lastTimestamp->addHour(); // Pomeraj za 1h unapred
                $recordsGenerated++;
            }

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
