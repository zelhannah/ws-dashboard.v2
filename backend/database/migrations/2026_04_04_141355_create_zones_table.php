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
    Schema::create('zones', function (Blueprint $table) {
        $table->id('zone_id'); // This is your unique INT identifier 
        $table->string('zone_name'); // This holds "Warehouse" or "Office" 
        $table->text('description')->nullable(); // This holds the description 
        $table->timestamps(); // Laravel adds this automatically to track when records are made
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zones');
    }
};
