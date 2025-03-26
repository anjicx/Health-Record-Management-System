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

        return [
            //preko funkcije dobija device_id i timestamp
            'device_id' => fn(array $attributes) => $attributes['device_id'],
            'timestamp' => fn(array $attributes) => $attributes['timestamp'],
            //ovo su delovi koje generiše(podaci sa uređaja koji su prikupljeni)
            'heart_rate' => $this->faker->numberBetween(60, 100),
            'systolic_bp' => $this->faker->numberBetween(110, 140),
            'diastolic_bp' => $this->faker->numberBetween(70, 90),
            'steps' => $this->faker->numberBetween(0, 2000),//koraci na 1h
            'calories_burned' => function (array $attributes) {
                return isset($attributes['steps']) ? round($attributes['steps'] * 0.04, 2) : 0;
            },
            'sleep_quality' => $this->faker->numberBetween(50, 100),
            'stress_level' => $this->faker->numberBetween(0, 100),
        ];
    }



}
