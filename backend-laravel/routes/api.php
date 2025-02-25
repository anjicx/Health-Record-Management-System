<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DeviceController;
use App\Http\Controllers\Api\V1\HealthDataController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Resources\V1\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


//rute koje ne zahtevaju middleware(javno dostupne):
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('api.login');


//zaboravljena lozinka-ne mozes se prijaviti!

//slanje linka za resetovanje na mejl
Route::post('/forgot-password', action: [AuthController::class, 'sendPasswordResetLink']);

Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');



//korisnik mora biti vec prijavljen  da bi ovo se koristilo:
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/devices/random', [DeviceController::class, 'getRandomDevices']);

    Route::get('/user', function (Request $request) {
        return new UserResource($request->user());//podaci o korisniku
    });

    Route::post('/logout', [AuthController::class, 'logout']);//odjava  

    Route::post('/generate-health-data', [HealthDataController::class, 'generateHealthData']);
    //za generisanje podataka healthdata od kojih se izveštaji onda prave



});
