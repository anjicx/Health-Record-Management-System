<?php

use App\Http\Controllers\Api\V1\AuthController;
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
Route::post('/login', [AuthController::class, 'login']);


//zaboravljena lozinka-ne mozes se prijaviti!

//slanje linka za resetovanje na mejl
Route::post('/forgot-password', [AuthController::class, 'sendPasswordResetLink']);

//resetovanje lozinke

/*ovaj deo ne treba jer ce u react-u biti uradjeno bez blade fajla!*/
//kada se klikne na password reset dugme na mejlu vraca Blade view auth.passwords.reset
//token da verifikuje validnost url-a blade fajl je u resources delu view
//Route::get('/reset-password/{token}', function ($token) {
  //  return view('auth.passwords.reset', ['token' => $token]);
//})->name('password.reset'); 
//Route::post('/reset-password', [AuthController::class, 'resetPassword']); 


//korisnik mora biti vec prijavljen  da bi ovo se koristilo:
    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/user', function (Request $request) {
            return new UserResource($request->user());//podaci o korisniku
        });
    
        Route::post('/logout', [AuthController::class, 'logout']);//odjava  



    });
