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
    Schema::create('sensor_data', function (Blueprint $table) {
        $table->id('data_id'); // Unique identifier 
        $table->string('value'); // The actual sensor reading 
        
        // The string connecting this reading to a specific sensor 
        $table->unsignedBigInteger('sensor_id');
        $table->foreign('sensor_id')->references('sensor_id')->on('sensors');
        
        $table->timestamp('timestamp')->useCurrent(); // The exact time it was captured 
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sensor_data');
    }
};
