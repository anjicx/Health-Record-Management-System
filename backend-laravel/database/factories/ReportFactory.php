<?php

namespace Database\Factories;

use App\Models\Device;
use App\Models\HealthData;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Report>
 */
class ReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    
     public function definition()
     {
         // Pronađi nasumičnog korisnika
         $user = User::inRandomOrder()->first();
     
         if (!$user) {
             throw new \Exception("Nema korisnika u bazi za kreiranje izveštaja.");
         }
     
         // Pronađi healthdata SAMO od uređaja koji pripadaju tom korisniku
         $healthDataSet = HealthData::whereHas('device', function ($query) use ($user) {
             $query->where('user_id', $user->id);
         })->whereDate('timestamp', now()->toDateString())->get();
     
         if ($healthDataSet->isEmpty()) {
            // Pronađi nasumičan uređaj koji pripada korisniku
            $device = $user->devices()->inRandomOrder()->first(); 
        
            if (!$device) {
                // Ako nema uređaja, generiši novi uređaj i poveži ga sa korisnikom
                $device = Device::factory()->create([
                    'user_id' => $user->id, // Povezujemo uređaj sa korisnikom
                ]);
            }
        
            // Dobijanje ID-a uređaja
            $deviceId = $device->id;
            
        
           
            // Ako već postoji vreme za ovaj uređaj, dodaj 30 sekundi; inače, postavi na sadašnje vreme
            if (isset(HealthData::$deviceTimestamps[$deviceId])) {
                HealthData::$deviceTimestamps[$deviceId] = date("Y-m-d H:i:s", strtotime(HealthData::$deviceTimestamps[$deviceId] . " +30 seconds"));
            } else {
                HealthData::$deviceTimestamps[$deviceId] = date("Y-m-d H:i:s");
            }
        
            // Kreiraj novi health data za taj uređaj koristeći novo vreme
            $healthDataSet = collect([HealthData::factory()->create([
                'device_id' => $device->id,
                'timestamp' => HealthData::$deviceTimestamps[$deviceId], // Korišćenje vremena za health data
            ])]);
        }
         // Računanje stvarnih vrednosti na osnovu HealthData zapisa
         $averageHeartRate = $healthDataSet->avg('heart_rate');
         $maxHeartRate = $healthDataSet->max('heart_rate');
         $minHeartRate = $healthDataSet->min('heart_rate');
 
         $averageBpSystolic = $healthDataSet->avg('systolic_bp');
         $averageBpDiastolic = $healthDataSet->avg('diastolic_bp');
         $averageBp = round($averageBpSystolic) . '/' . round($averageBpDiastolic) . ' mmHg';
 
         $totalSteps = $healthDataSet->sum('steps');
         $totalCalories = $healthDataSet->sum('calories_burned');
 
         $averageSleepQuality = $healthDataSet->avg('sleep_quality');
         $averageStressLevel = $healthDataSet->avg('stress_level');
 
         return [
             'user_id' => $user->id,
             'creationDate' => now()->toDateString(),
             'creationTime' => now()->toTimeString(),
             'health_data_ids' => json_encode($healthDataSet->pluck('id')->toArray()), // Čuva ID-eve kao JSON niz
     
             'category' => $this->faker->randomElement(['Daily Report', 'Health Risk', 'Activity Summary']),
             'risk_level' => $this->faker->randomElement(['low', 'medium', 'high']),
 
             'average_heart_rate' => round($averageHeartRate),
             'max_heart_rate' => round($maxHeartRate),
             'min_heart_rate' => round($minHeartRate),
             
             'average_bp' => $averageBp,
             'spo2_trend' => $this->faker->randomElement(['Stable', 'Increasing', 'Decreasing']),
             
             'steps_total' => $totalSteps,
             'calories_burned_total' => round($totalCalories, 2),
             
             'sleep_quality_avg' => round($averageSleepQuality),
             'stress_level_avg' => round($averageStressLevel),
         ];
     }     
     
     
}
