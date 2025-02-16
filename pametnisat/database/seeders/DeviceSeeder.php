<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Device;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {// Proveravamo da li postoje korisnici, ako ne - kreiramo ih
if (User::count() == 0) {
    User::factory(10)->create(); // Kreiraj 10 korisnika
}

// Sada možemo kreirati uređaje
Device::factory(20)->create();

        Device::factory()->count(10)->create();

    }
}
