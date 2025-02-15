<?php

namespace Database\Factories;

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
    public function definition()
    {
        return [
            'device_id' => DeviceFactory::inRandomOrder()->first()->id ?? DeviceFactory::factory(),
            'timestamp' => now(),
            'heart_rate' => $this->faker->numberBetween(60, 100),
            'systolic_bp' => $this->faker->numberBetween(110, 140),
            'diastolic_bp' => $this->faker->numberBetween(70, 90),
            'spo2' => $this->faker->numberBetween(90, 100),
            'steps' => $this->faker->numberBetween(0, 15000),
            'calories_burned' => $this->faker->randomFloat(2, 100, 5000),
            'sleep_quality' => $this->faker->numberBetween(50, 100),
            'stress_level' => $this->faker->numberBetween(0, 100),
        ];
    }
}
