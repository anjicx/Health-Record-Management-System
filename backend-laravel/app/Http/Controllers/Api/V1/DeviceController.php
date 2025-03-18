<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Device;
use Illuminate\Http\Request;
class DeviceController extends Controller
{

    //da dobiješ sve uređaje za cmb uređaja
    public function index()
    {
        $devices = Device::all(); // Dohvatanje svih uređaja iz baze
        return response()->json($devices); // Vraćamo listu uređaja
    }



    public function getRandomDevices()
    {
        $devices = Device::inRandomOrder()->limit(5)->get(); // vraća 5 nasumičnih uređaja
        return response()->json($devices);
    }


}
