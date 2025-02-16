<?php

namespace Database\Factories;

use App\Models\HealthData;
use App\Models\HealthDataReport;
use App\Models\Report;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\HealthDataReport>
 */
class HealthDataReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    public function definition()
    {//OVO IZMENITI KASNIJE U SKLADU SA TIPOM IZVESTAJA DA BUDE(MESECNI)
        return [
            'report_id' => Report::inRandomOrder()->first()->id ?? Report::factory(),
            'health_data_id' => HealthData::inRandomOrder()->first()->id ?? HealthData::factory(),
            'summary' => $this->faker->sentence,
            'risk_level' => $this->faker->randomElement(['low', 'medium', 'high']),
            'average_heart_rate' => $this->faker->numberBetween(60, 100),
            'max_heart_rate' => $this->faker->numberBetween(100, 180),
            'min_heart_rate' => $this->faker->numberBetween(50, 70),
            'average_bp' => $this->faker->numberBetween(110, 140) . '/' . $this->faker->numberBetween(70, 90) . ' mmHg',
            'spo2_trend' => $this->faker->randomElement(['Stable', 'Increasing', 'Decreasing']),
            'steps_total' => $this->faker->numberBetween(2000, 15000),
            'calories_burned_total' => $this->faker->randomFloat(2, 100, 5000),
            'sleep_quality_avg' => $this->faker->numberBetween(50, 100),
            'stress_level_avg' => $this->faker->numberBetween(0, 100),
        ];
    }
}
