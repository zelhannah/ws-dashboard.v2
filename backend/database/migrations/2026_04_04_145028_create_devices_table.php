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
    Schema::create('devices', function (Blueprint $table) {
        $table->id('device_id'); // Unique identifier
        $table->string('device_type'); // Holds "Arduino" or "ESP32"
        $table->enum('status', ['Active', 'Inactive']); // Active or Inactive
        
        // This is the "string" connecting it to the Zone drawer
        $table->unsignedBigInteger('zone_id'); 
        $table->foreign('zone_id')->references('zone_id')->on('zones');
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
