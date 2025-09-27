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
        Schema::create('audit_trails', function (Blueprint $table) {
            $table->id();

            // Polymorphic fields
            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();

            // Actor (user performing the action)
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->string('actor_name')->nullable();
            $table->unsignedBigInteger('unit_or_department_id')->nullable();

            // Action details
            $table->string('action');        // e.g., create, update, delete, login_success, login_failed, role_changed
            $table->string('subject_type');  // e.g., asset, transfer, off-campus, scheduling, turnover/disposal, form

            // Changes
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            // Context
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('route')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_trails');
    }
};
