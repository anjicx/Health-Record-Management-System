<?php

namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;

use Log;
use Mail;
use Str;
use Validator;

class AuthController extends Controller
{

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:user',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();
            $message = 'Validation failed.';
            //moguće greške zbog kojih nije uspešna registracija
            if ($errors->has('email')) {
                $message = 'The email is already used.';
            } elseif ($errors->has('password')) {
                $message = 'The password must be at least 8 characters long and match the confirmation field.';
            } elseif ($errors->has('username')) {
                $message = 'The username field is required and must not exceed 255 characters.';
            }

            return response()->json([
                'message' => $message,
                'errors' => $errors
            ], 422);
        }
        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully.',
            'user' => new UserResource($user),
            'token' => $token
        ], 201);
    }
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login credentials.'
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User logged in successfully.',
            'user' => new UserResource($user),
            'token' => $token
        ], 200);
    }

    //generisanje linka koji preusmerava na formu i slanje na mejl
    //isklj avast 
    public function sendPasswordResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:user,email', // da l ima u bazi i da li je u formatu emaila
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        // Kreiranje tokena ručno jer Laravel-ov metod šalje link ka backendu
        $token = Str::random(60);
        DB::table('password_resets')->updateOrInsert(
            ['email' => $user->email],
            ['token' => $token, 'created_at' => Carbon::now()]
        );

        // FRONTEND URL koji korisnik treba da poseti
        $frontendUrl = env('FRONTEND_URL') . "/reset-password/" . $token;

        // Pošalji email
        Mail::raw("Click here to reset your password: " . $frontendUrl, function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Reset Your Password');
        });
        //     $user->sendPasswordResetNotification($frontendUrl);

        return response()->json(['message' => 'A password reset link has been sent to your email.']);



    }


    public function resetPassword(Request $request)
    {
        // VALIDACIJA
        $request->validate([
            'token' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        //passwordreset:: traži i mejl a ne treba jer je već poslato pa po tokenu primljenom može pretraga
        //na ovaj način pronalazi po tokenu
        $resetData = DB::table('password_resets')->where('token', $request->token)->first();

        if (!$resetData) {
            return response()->json(['message' => 'The reset token is invalid or expired. Please request a new link.'], 400);
        }
        // Pronađi email preko tokena u tabeli password_resets
        $user = User::where('email', $resetData->email)->first();
        if (!$user) {
            return response()->json(['message' => 'The provided email does not exist in our records.'], 400);
        }

        // Resetuj lozinku
        $user->update(['password' => Hash::make($request->password)]);

        // Obrisi token iz password_resets nakon resetovanja
        DB::table('password_resets')->where('email', $resetData->email)->delete();
        //vrati odgovor da je resetovana lozinka
        return response()->json(['message' => 'Your password has been successfully reset. You can now log in with your new password.']);
    }



    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'User logged out successfully.'], 200);
    }






}
