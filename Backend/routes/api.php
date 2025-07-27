<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use  App\Http\Controllers\API\AuthController;
use  App\Http\Controllers\API\UtilisateurController;
use  App\Http\Controllers\API\ClientController;
use  App\Http\Controllers\API\HistoriqueJuridiqueController;
use  App\Http\Controllers\API\PasswordResetController;
use  App\Http\Controllers\API\HistoriqueFiscalController; 
use  App\Http\Controllers\API\AgoController;
use  App\Http\Controllers\API\EventController;
use  App\Http\Controllers\API\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Password Reset API Routes
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);
Route::get('/test', [PasswordResetController::class, 'test']);

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
    Route::apiResource('/historique-fiscal', HistoriqueFiscalController::class);
    Route::patch('/historique-fiscal/{id}/status', [HistoriqueFiscalController::class, 'updateStatus']);
    Route::delete('/historique-fiscal/paiements/{id}', [HistoriqueFiscalController::class, 'deletePaiement']);
    Route::delete('/historique-fiscal/declarations/{id}', [HistoriqueFiscalController::class, 'deleteDeclaration']);

    Route::apiResource('events', EventController::class);
    
    // Profile management routes
    Route::get('/profile', [AuthController::class, 'getProfile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);
    Route::delete('/delete-account', [AuthController::class, 'deleteAccount']);


    //dashboard rourtes
    Route::get('/dashboard/clients-actifs', [DashboardController::class, 'getClientsActifs']);
    Route::get('/dashboard/ago-du-mois', [DashboardController::class, 'getAGODuMois']);
    Route::get('/dashboard/revenus', [DashboardController::class, 'getRevenus']);
    Route::get('/dashboard/taux-completion', [DashboardController::class, 'getTauxCompletion']);
    
    // Combined stats endpoint (recommended for dashboard)
    Route::get('/dashboard/task-distribution', [DashboardController::class, 'getTaskDistribution']);
    Route::get('/dashboard/acquisition-clients', [DashboardController::class, 'getAcquisitionClients']);
    Route::get('/dashboard/activites-recentes', [DashboardController::class, 'getActivitesRecentes']);
    Route::get('/dashboard/elements-retard', [DashboardController::class, 'getElementsEnRetard']);

    
});