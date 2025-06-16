<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

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

        try {
            // Generate a simple token
            $token = Str::random(64);
            
            // Store token in password_reset_tokens table
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email_utilisateur],
                [
                    'email' => $user->email_utilisateur,
                    'token' => Hash::make($token),
                    'created_at' => now()
                ]
            );

            // Send email manually
            $resetUrl = "http://localhost:5173/reset-password?token={$token}&email=" . urlencode($user->email_utilisateur);
            
            Mail::send([], [], function ($message) use ($user, $resetUrl) {
                $message->to($user->email_utilisateur)
                        ->subject('Reset Password - Sudinvest')
                        ->html("
                            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                                <h2 style='color: #333;'>Password Reset Request</h2>
                                <p>Hello,</p>
                                <p>You are receiving this email because we received a password reset request for your account.</p>
                                <div style='text-align: center; margin: 30px 0;'>
                                    <a href='{$resetUrl}' style='background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>Reset Password</a>
                                </div>
                                <p>This password reset link will expire in 60 minutes.</p>
                                <p>If you did not request a password reset, no further action is required.</p>
                                <hr style='margin: 30px 0;'>
                                <p style='font-size: 12px; color: #666;'>If the button doesn't work, copy and paste this link into your browser:</p>
                                <p style='font-size: 12px; color: #666; word-break: break-all;'>{$resetUrl}</p>
                            </div>
                        ");
            });

            return response()->json(['message' => 'Password reset link sent successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send reset link',
                'details' => $e->getMessage()
            ], 500);
        }
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

        try {
            // Find the password reset record
            $resetRecord = DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->first();

            if (!$resetRecord) {
                return response()->json(['error' => 'Invalid reset token'], 400);
            }

            // Check if token matches
            if (!Hash::check($request->token, $resetRecord->token)) {
                return response()->json(['error' => 'Invalid reset token'], 400);
            }

            // Check if token is expired (60 minutes)
            if (now()->diffInMinutes($resetRecord->created_at) > 60) {
                return response()->json(['error' => 'Reset token has expired'], 400);
            }

            // Find user and update password
            $user = Utilisateur::where('email_utilisateur', $request->email)->first();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // Update password
            $user->forceFill([
                'password' => Hash::make($request->password),
            ])->save();

            // Delete the reset token
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();

            return response()->json(['message' => 'Password reset successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to reset password',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function test()
    {
        return response()->json(['message' => 'Password reset controller is working'], 200);
    }
}