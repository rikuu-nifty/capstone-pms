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
        // Create transfers table
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('current_building_room');
            $table->unsignedBigInteger('current_organization');
            $table->unsignedBigInteger('receiving_building_room');
            $table->unsignedBigInteger('receiving_organization');
            $table->unsignedBigInteger('designated_employee');
            $table->unsignedBigInteger('assigned_by');
            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();

            $table->date('scheduled_date');
            $table->date('actual_transfer_date')->nullable();
            $table->string('received_by')->nullable();
            $table->enum('status', ['pending_review', 'upcoming', 'in_progress', 'overdue', 'completed', 'cancelled'])->default('pending_review');
            $table->text('remarks')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('current_building_room')->references('id')->on('building_rooms')->onDelete('cascade');
            $table->foreign('current_organization')->references('id')->on('unit_or_departments')->onDelete('cascade');
            $table->foreign('receiving_building_room')->references('id')->on('building_rooms')->onDelete('cascade');
            $table->foreign('receiving_organization')->references('id')->on('unit_or_departments')->onDelete('cascade');
            $table->foreign('designated_employee')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('cascade');
        });

        // Add transfer_id column to inventory_lists
        Schema::table('inventory_lists', function (Blueprint $table) {
            $table->foreignId('transfer_id')
                ->nullable()
                ->constrained('transfers')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign key + column from inventory_lists first
        Schema::table('inventory_lists', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_lists', 'transfer_id')) {
                $table->dropForeign(['transfer_id']);
                $table->dropColumn('transfer_id');
            }
        });

        // Drop FKs from transfers
        Schema::table('transfers', function (Blueprint $table) {
            $table->dropForeign(['current_building_room']);
            $table->dropForeign(['current_organization']);
            $table->dropForeign(['receiving_building_room']);
            $table->dropForeign(['receiving_organization']);
            $table->dropForeign(['designated_employee']);
            $table->dropForeign(['assigned_by']);
            $table->dropForeign(['created_by_id']);
        });

        // Finally drop transfers table
        Schema::dropIfExists('transfers');
    }
};
