<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ZoneController;
use App\Http\Controllers\SensorController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\EmergencyController;

Route::get('/zones', [ZoneController::class, 'index']);
Route::post('/zones', [ZoneController::class, 'store']);
Route::put('/zones/{id}', [ZoneController::class, 'update']);
Route::delete('/zones/{id}', [ZoneController::class, 'destroy']);

Route::get('/devices', [DeviceController::class, 'index']);

Route::get('/dashboard', [DashboardController::class, 'summary']);
Route::get('/dashboard/overview', [DashboardController::class, 'overview']);

Route::get('/sensors/office', [SensorController::class, 'office']);
Route::get('/sensors/warehouse', [SensorController::class, 'warehouse']);
Route::get('/sensors/office/history', [SensorController::class, 'officeHistory']);
Route::get('/sensors/warehouse/history', [SensorController::class, 'warehouseHistory']);

Route::get('/alerts', [AlertController::class, 'index']);

Route::get('/users', [UserController::class, 'index']);

Route::post('/emergency/restore-office', [EmergencyController::class, 'restoreOffice']);
Route::post('/emergency/restore-warehouse', [EmergencyController::class, 'restoreWarehouse']);
Route::post('/emergency/restore-all', [EmergencyController::class, 'restoreAll']);
Route::post('/emergency/silence-alarm', [EmergencyController::class, 'silenceAlarm']);

Route::post("/login", [AuthController::class, "login"]);
Route::post("/logout", [AuthController::class, "logout"]);
Route::get("/me", [AuthController::class, "me"]);
