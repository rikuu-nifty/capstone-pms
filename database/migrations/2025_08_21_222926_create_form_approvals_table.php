<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\ApprovalStatus;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('form_approvals', function (Blueprint $table) {
            $table->id();

            $table->morphs('approvable');
            $table->foreignId('requested_by_id')->constrained('users'); //the one who prepared
            // $table->foreginId('prepared_by_id')->nullable()->constrained('users');
            $table->foreignId('reviewed_by_id')->nullable()->constrained('users'); //nullable until acted upon
            $table->string('form_type', 64);
            $table->string('form_title');
            $table->string('status')->default(ApprovalStatus::PENDING_REVIEW->value);
            $table->text('review_notes')->nullable();

            $table->time('requested_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'requested_at']);
            $table->index(['form_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_approvals');
    }
};
