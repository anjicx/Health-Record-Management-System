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
            // Koristi prosleđenu vrednost iz jsona za deviceid da bi znali na koji se uređaj povezao korisnik
            'device_id' => function (array $attributes) {
                // Ako nije prosleđen, bacamo grešku; ili možeš ostaviti da bude null ako želiš
                if (!isset($attributes['device_id'])) {//ako došlo do greške prekida izvršenje programa
                    throw new \Exception("device_id nije postavljen!");
                }
                return $attributes['device_id'];
            },//postavlja vrednost timestampa tako da se nastavlja na poslednju ucitanu vr timestampa za taj uređaj-tad
            //je zadnje sinhronizovan uredjaj
            'timestamp' => function (array $attributes) {
                $deviceId = $attributes['device_id'];//dodeljulje se vr prom da se dalje koristi
                //proverava statičku promenjivu koja je niz i def u modelu HealthData
                //ako je postavljeno vreme uzmi to vreme i uvećaj za 30s
                //ovo znači da će se pri generisanju podataka u bazi samo 1 izvršiti upit ako nema vr u stat prom
                //ostalo će se sve menjati vrednost timestamp u njoj
                if (isset(HealthData::$deviceTimestamps[$deviceId])) {
                    HealthData::$deviceTimestamps[$deviceId] = date("Y-m-d H:i:s", strtotime(HealthData::$deviceTimestamps[$deviceId] . " +30 seconds"));
                } else {
                    //ako nije def onda traži iz baze poslednji zapis i uvećava za 30s
                    $lastTimestamp = HealthData::where('device_id', $deviceId)
                        ->orderBy('timestamp', 'desc')
                        ->value('timestamp');

                    HealthData::$deviceTimestamps[$deviceId] = $lastTimestamp
                        ? date("Y-m-d H:i:s", strtotime($lastTimestamp . " +30 seconds"))
                        : date("Y-m-d H:i:s");
                }
                return HealthData::$deviceTimestamps[$deviceId];
            },
            //ovo su delovi koje generiše(podaci sa uređaja koji su prikupljeni)
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
