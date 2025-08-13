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
        Schema::create('off_campus_assets', function (Blueprint $table) {
            $table->id();

            // Off-Campus ID [FK]

        $table->unsignedBigInteger('off_campus_id'); // Done FK OFF CAMPUS Table
        $table->foreign('off_campus_id')
                ->references('id')
                ->on('off_campus')
                ->onDelete('set null');   

        $table->unsignedBigInteger('asset_model_id'); // Done FK ASSET MODEL Table
        $table->foreign('asset_model_id')
                ->references('id')
                ->on('asset_models')
                ->onDelete('set null');   // ->onDelete('set null'); 

        $table->enum('status', [
                'pending_return',   // Borrowed, due to return
                'returned',         // Returned on time
                'returned_late',    // Returned after due date
                'still_out',        // Still off-campus and not due yet
                'transferred',      // Moved to another location
                'lost',             // Asset lost while off-campus
                'replaced'          // Asset replaced with another unit
            ])->nullable();


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('off_campus_assets');
    }
};
