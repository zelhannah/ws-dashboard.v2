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
        Schema::create('attack_scenarios', function (Blueprint $table) {
            $table->id('attack_id');
            $table->string('attack_type'); // e.g., 'Spoofing', 'Replay'
            $table->string('target_component');
            $table->text('description')->nullable();
            $table->timestamp('timestamp')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attack_scenarios');
    }
};
