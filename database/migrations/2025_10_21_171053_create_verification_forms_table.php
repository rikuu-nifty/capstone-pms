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
        Schema::create('verification_forms', function (Blueprint $table) {
            $table->id();

            $table->foreignId('unit_or_department_id')->constrained('unit_or_departments')->restrictOnDelete();
            $table->foreignId('requested_by_personnel_id')->nullable()->constrained('personnels')->nullOnDelete();

            $table->string('requested_by_name')->nullable();
            $table->string('requested_by_title')->nullable();
            $table->string('requested_by_contact')->nullable();

            $table->foreignId('verified_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->text('remarks')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'verified_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verification_forms');
    }
};
