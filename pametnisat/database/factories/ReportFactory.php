<?php

namespace Database\Factories;

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
        return [
            'user_id' => User::inRandomOrder()->first()->id ?? UserFactory::factory(),
            'creationDate' => now()->toDateString(),
            'creationTime' => now()->toTimeString(),
            'category' => $this->faker->randomElement(['Daily Report', 'Health Risk', 'Activity Summary']),
        ];
    }
}
