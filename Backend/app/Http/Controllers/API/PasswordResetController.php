<?php
namespace App\Http\Controllers\API;

use Illuminate\Support\Facades\Password;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Utilisateur;

class PasswordResetController extends Controller
{
    // Send password reset link email
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email_utilisateur' => 'required|email',
        ]);

        // Check if user exists
        $user = Utilisateur::where('email_utilisateur', $request->email_utilisateur)->first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Use the 'utilisateurs' password broker
        $status = Password::broker('utilisateurs')->sendResetLink([
            'email' => $request->email_utilisateur
        ]);

        return $status == Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Password reset link sent'], 200)
            : response()->json(['error' => 'Unable to send reset link. Status: ' . $status], 400);
    }

    // Reset password
    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                ])->save();
            }
        );

        return $status == Password::PASSWORD_RESET
            ? response()->json(['message' => 'Password reset successfully'], 200)
            : response()->json(['error' => 'Failed to reset password'], 400);
    }
    public function test(){
        return response()->json(['message' => 'Test successful'], 200);
    }
}

