<?php

namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;

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


    public function sendPasswordResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:user,email', // da l ima u bazi i da li je u formatu emaila
        ]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'A password reset link has been sent to your email.']);
        }

        // greške moguće pri slanju linka
        $errorMessages = [
            Password::INVALID_USER => 'The provided email does not exist in the base.',
            Password::RESET_THROTTLED => 'Too many reset attempts. Please try again later.',
            Password::RESET_LINK_SENT => 'Reset link was already sent. Check your email.',
        ];

        return response()->json([
            'message' => $errorMessages[$status] ?? 'An unexpected error occurred while sending the reset link. Please try again later.'
        ], 400);
    }




    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:user,email',
            'token' => 'required',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();
            }
        );
        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Your password has been successfully reset. You can now log in with your new password.']);
        }
        $errorMessages = [
            Password::INVALID_TOKEN => 'The reset token is invalid or expired. Please request a new link.',
            Password::INVALID_USER => 'The provided email does not exist in our records.',
        ];

        return response()->json([
            'message' => $errorMessages[$status] ?? 'An unexpected error occurred. Please try again.'
        ], 400);
    }





    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'User logged out successfully.'], 200);
    }






}
