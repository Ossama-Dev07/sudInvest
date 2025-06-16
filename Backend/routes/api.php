<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use  App\Http\Controllers\API\AuthController;
use  App\Http\Controllers\API\UtilisateurController;
use  App\Http\Controllers\API\ClientController;
use  App\Http\Controllers\API\HistoriqueJuridiqueController;
use  App\Http\Controllers\API\PasswordResetController;
use  App\Http\Controllers\API\AgoController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/password/reset/{token}', function ($token) {
    // Redirect to your React frontend with the token
    $email = request()->query('email');
    return redirect("http://localhost:5173/reset-password?token={$token}&email={$email}");
})->name('password.reset');

Route::get('/password/reset', function () {
    // Redirect to your React frontend forgot password page
    return redirect('http://localhost:5173/forgot-password');
})->name('password.request');
Route::get('/test',[PasswordResetController::class, 'test']);

// Protected routes


Route::middleware('auth:sanctum')->group(function () {
    //<<<<<<<<<<<< Routes of utilisateurs>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Route::get('/auth-test', [UtilisateurController::class, 'testAuth']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('/utilisateurs', UtilisateurController::class);
    Route::post('/{id}/deactivate', [UtilisateurController::class, 'deactivate']);
    Route::get('/archived', [UtilisateurController::class, 'getArchived']);
    Route::post('/{id}/restore', [UtilisateurController::class, 'restore']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    //<<<<<<<<<<<< Routes of Clients>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Route::apiResource('clients', ClientController::class);
    Route::post('clients/{id}/deactivate', [ClientController::class, 'deactivate']);

// Route for restoring a client
    Route::post('clients/{id}/restore', [ClientController::class, 'restore']);

// Route for fetching archived clients
    Route::get('/clients-archived', [ClientController::class, 'archivedClients']);
    
    Route::apiResource('/historique-juridique', HistoriqueJuridiqueController::class);
    Route::get('/historique-juridique/client/{clientId}', [HistoriqueJuridiqueController::class, 'getByClientId']);

    Route::apiResource('agos', AgoController::class);
        // Profile management routes
        Route::get('/profile', [AuthController::class, 'getProfile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
        Route::delete('/delete-account', [AuthController::class, 'deleteAccount']);

});
