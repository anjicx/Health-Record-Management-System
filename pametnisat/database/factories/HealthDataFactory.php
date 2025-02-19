<?php

namespace Database\Factories;

use App\Models\Device;
use App\Models\HealthData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\HealthData>
 */
class HealthDataFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = HealthData::class;

//ovo se generišu podaci svi sem id-eva fk jer oni će biti odabrani
     public function definition()
     {   
         // Izaberi postojeći uređaj
         $deviceId = null; 

         
         if ($deviceId) {
            if (isset(HealthData::$deviceTimestamps[$deviceId])) {
                HealthData::$deviceTimestamps[$deviceId] = date("Y-m-d H:i:s", strtotime(HealthData::$deviceTimestamps[$deviceId] . " +30 seconds"));
            } else {
                $lastTimestamp = HealthData::where('device_id', $deviceId)
                    ->orderBy('timestamp', 'desc')
                    ->value('timestamp');

                HealthData::$deviceTimestamps[$deviceId] = $lastTimestamp 
                    ? date("Y-m-d H:i:s", strtotime($lastTimestamp . " +30 seconds")) 
                    : date("Y-m-d H:i:s");
            }
        }
         return [
             'timestamp' => HealthData::$deviceTimestamps[$deviceId], // Pristup statičkoj promenljivoj
             'heart_rate' => $this->faker->numberBetween(60, 100),
             'systolic_bp' => $this->faker->numberBetween(110, 140),
             'diastolic_bp' => $this->faker->numberBetween(70, 90),
             'spo2' => $this->faker->numberBetween(90, 100),
             'steps' => $this->faker->numberBetween(0, 15000),
             'calories_burned' => $this->faker->randomFloat(2, 100, 2000),
             'sleep_quality' => $this->faker->numberBetween(50, 100),
             'stress_level' => $this->faker->numberBetween(0, 100),
         ];
     }
     
}
