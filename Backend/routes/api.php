<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use  App\Http\Controllers\API\AuthController;
use  App\Http\Controllers\API\UtilisateurController;
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

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    //<<<<<<<<<<<< Routes of uilisateurs>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('/utilisateurs', UtilisateurController::class);
    Route::post('/utilisateurs/{id}/archive', [UtilisateurController::class, 'Archived']);
    Route::get('/archived-utilisateurs', [UtilisateurController::class, 'getArchived']);
    Route::post('/archived-utilisateurs/{id}/restore', [UtilisateurController::class, 'restore']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    //<<<<<<<<<<<< Routes of Clients>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    

});
