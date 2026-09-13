<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('sensors', function (Blueprint $table) {
        $table->id('sensor_id'); // Unique identifier
        $table->string('sensor_type'); // Holds "RFID", "PIR", etc.
        $table->enum('status', ['Active', 'Inactive']); // Active or Inactive
        
        // This is the "string" connecting it to the Device drawer
        $table->unsignedBigInteger('device_id');
        $table->foreign('device_id')->references('device_id')->on('devices');
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sensors');
    }
};
