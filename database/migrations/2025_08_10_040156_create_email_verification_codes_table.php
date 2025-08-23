<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('email_verification_codes', function (Blueprint $table) {
            $table->id();

            // If you want FK now (recommended for auth): 
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // For OTP verification, I’d recommend cascadeOnDelete, 
            // because OTPs are short-lived and tied to active users only:

            $table->string('code_hash', 255);       // bcrypt/argon hash of 6-digit OTP
            $table->timestamp('expires_at');        // now()->addMinutes(10)
            $table->unsignedTinyInteger('max_attempts')->default(5);
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('consumed_at')->nullable();

            // Audit & rate limiting context
            $table->string('sent_to_email', 191);
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 255)->nullable();

            $table->timestamps();

            // Helpful indexes
            $table->index(['user_id', 'consumed_at', 'expires_at'], 'evc_user_state_idx');
            $table->index('expires_at', 'evc_expires_idx');

            // If you didn’t add the FK above and still want referential integrity later:
            // $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
            Schema::table('email_verification_codes', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
                $table->dropIndex('evc_user_state_idx');
                $table->dropIndex('evc_expires_idx');
            });

            Schema::dropIfExists('email_verification_codes');
        }
    };
