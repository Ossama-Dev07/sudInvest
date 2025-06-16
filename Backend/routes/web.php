<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('welcome');
});

// Password reset routes - these are needed for Laravel's password reset emails
Route::get('/password/reset/{token}', function ($token) {
    // Redirect to your React frontend with the token
    $email = request()->query('email');
    return redirect("http://localhost:5173/reset-password?token={$token}&email={$email}");
})->name('password.reset');

Route::get('/password/reset', function () {
    // Redirect to your React frontend forgot password page
    return redirect('http://localhost:5173/forgot-password');
})->name('password.request');