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
        Schema::create('alerts', function (Blueprint $table) {
            $table->id('alert_id');
            $table->string('alert_type');
            /* $table->string('description'); */
            
            // Links back to the attack scenario
            $table->unsignedBigInteger('attack_id')->nullable();
            $table->foreign('attack_id')->references('attack_id')->on('attack_scenarios');

            // Links back to the sensor that triggered the alert
            $table->unsignedBigInteger('sensor_id')->nullable();
            $table->foreign('sensor_id')->references('sensor_id')->on('sensors');

            $table->timestamp('timestamp')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
