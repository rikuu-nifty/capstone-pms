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
        Schema::create('form_approval_steps', function (Blueprint $table) {
            $table->id();

            $table->foreignId('form_approval_id')->constrained('form_approvals')->cascadeOnDelete();

            $table->unsignedSmallInteger('step_order');
            $table->string('code', 70); //prepared_by, noted_by, approved_by
            $table->string('label'); //display label
            $table->boolean('is_external')->default(false);
            $table->boolean('auto_approve_by_creator')->default(false);

            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('external_name')->nullable(); //non-users
            $table->string('external_title')->nullable();

            $table->enum('status', ['pending', 'approved', 'rejected', 'skipped'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('acted_at')->nullable();

            $table->timestamps();

            $table->unique(['form_approval_id', 'step_order']);
            $table->index(['form_approval_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_approval_steps');
    }
};
