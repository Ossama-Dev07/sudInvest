<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use  App\Http\Controllers\API\AuthController;
use  App\Http\Controllers\API\UtilisateurController;
use  App\Http\Controllers\API\ClientController;
use  App\Http\Controllers\API\HistoriqueJuridiqueController;
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

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

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
});
