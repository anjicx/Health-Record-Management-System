<?php

namespace Database\Factories;

use App\Models\Device;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Device>
 */
class DeviceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    public function definition()
    {
        $type = $this->faker->randomElement(['Wearable', 'Medical Device', 'Smartwatch']);

        $name = match ($type) {
            'Wearable' => $this->faker->randomElement(['FitBand', 'HealthTracker', 'BioMonitor']),
            'Medical Device' => $this->faker->randomElement(['MediScan', 'PulseCheck', 'OxyMonitor']),
            'Smartwatch' => $this->faker->randomElement(['SmartFit', 'CardioWatch', 'LifeSync']),
            default => 'Unknown Device',
        };

        return [
            'name' => $name . ' ' . $this->faker->numerify('V#'),
            'type' => $type,
        ];


    }


}
