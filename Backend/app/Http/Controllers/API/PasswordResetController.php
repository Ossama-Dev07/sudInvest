<?php

namespace App\Http\Controllers\API;

use Illuminate\Support\Facades\Password;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Validator;

class PasswordResetController extends Controller
{
    public function sendResetLinkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email_utilisateur' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid email format',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user exists
        $user = Utilisateur::where('email_utilisateur', $request->email_utilisateur)->first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Send password reset link using the utilisateurs broker
        $status = Password::broker('utilisateurs')->sendResetLink([
            'email_utilisateur' => $request->email_utilisateur
        ]);

        if ($status == Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Password reset link sent successfully'], 200);
        }

        // Return more detailed error information
        return response()->json([
            'error' => 'Unable to send reset link',
            'status' => $status,
            'details' => $this->getPasswordResetStatusMessage($status)
        ], 400);
    }

    public function reset(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Use the utilisateurs broker for password reset
        $status = Password::broker('utilisateurs')->reset(
            [
                'email_utilisateur' => $request->email, // Map email to email_utilisateur
                'password' => $request->password,
                'password_confirmation' => $request->password_confirmation,
                'token' => $request->token,
            ],
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                ])->save();
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password reset successfully'], 200);
        }

        return response()->json([
            'error' => 'Failed to reset password',
            'status' => $status,
            'details' => $this->getPasswordResetStatusMessage($status)
        ], 400);
    }

    public function test()
    {
        return response()->json(['message' => 'Password reset controller is working'], 200);
    }

    private function getPasswordResetStatusMessage($status)
    {
        switch ($status) {
            case Password::RESET_LINK_SENT:
                return 'Reset link sent';
            case Password::RESET_THROTTLED:
                return 'Reset throttled, please wait before retrying';
            case Password::INVALID_USER:
                return 'Invalid user';
            case Password::INVALID_TOKEN:
                return 'Invalid token';
            case Password::PASSWORD_RESET:
                return 'Password reset successful';
            default:
                return 'Unknown status: ' . $status;
        }
    }
}