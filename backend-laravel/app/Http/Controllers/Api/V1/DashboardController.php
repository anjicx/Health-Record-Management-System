<?php

namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\HealthData;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    //dnevni izvštaj
    public function getDailySummary(Request $request)
    { //treba nam prvo uređaj za koji biramo
        $validated = $request->validate([
            'device_id' => 'required|integer|exists:device,id',
        ]);

        $device_id = $validated['device_id'];

        // za današnji  datum (od 00:00 do 23:59)
        $today = Carbon::today(); // Vraća 00:00:00 današnjeg datuma
        $tomorrow = Carbon::tomorrow(); // Vraća 00:00:00 sledećeg dana (ne uključuje ga)

        // podaci iz HealthData za današnji dan za sinhronizovani uređaj
        $summary = HealthData::where('device_id', $device_id)
            ->whereBetween('timestamp', [$today, $tomorrow])
            ->selectRaw('
                SUM(steps) as total_steps, 
                SUM(calories_burned) as total_calories, 
                AVG(heart_rate) as avg_heart_rate, 
                AVG(sleep_quality) as avg_sleep_quality, 
                AVG(stress_level) as avg_stress_level, 
                AVG(systolic_bp) as avg_systolic_bp, 
                AVG(diastolic_bp) as avg_diastolic_bp
            ')
            ->first();

        return response()->json([
            'steps' => $summary->total_steps ?? 0,
            'calories' => round($summary->total_calories, precision: 2) ?? 0,
            'heart_rate' => round($summary->avg_heart_rate, 2) ?? 0,
            'sleep' => round($summary->avg_sleep_quality, 2) ?? 0,
            'stress' => round($summary->avg_stress_level, 2) ?? 0,
            'blood_pressure' => [
                'systolic' => round($summary->avg_systolic_bp, 1) ?? 0,
                'diastolic' => round($summary->avg_diastolic_bp, 1) ?? 0,
            ]
        ]);
    }
}
