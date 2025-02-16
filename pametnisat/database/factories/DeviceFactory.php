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
             return [
                'name' => $this->faker->word,
                'type' => $this->faker->randomElement(['Wearable', 'Medical Device', 'Smartwatch']),
                'user_id' => User::factory(), // Automatski kreira korisnika ako ne postoji
            ];
            
        
     }
 
     /**
      * Configure the factory to assign the device to a user.
      *
      * @return \Illuminate\Database\Eloquent\Factories\Factory
      */
      public function configure()
      {
          return $this->afterCreating(function (Device $device) {
              // Uzimamo nasumičnog postojećeg korisnika
              $user = User::inRandomOrder()->first();
      
              // Ako nema nijednog korisnika u bazi, nemoj dodeljivati user_id (ako je nullable)
              if ($user) {
                  $device->user_id = $user->id;
                  $device->save();
              }
          });
      }
      
}
