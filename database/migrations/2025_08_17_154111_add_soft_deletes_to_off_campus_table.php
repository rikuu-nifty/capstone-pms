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
       Schema::table('off_campuses', function (Blueprint $table) {
            if (!Schema::hasColumn('off_campuses', 'deleted_at')) {
                $table->softDeletes()->after('updated_at');
                $table->foreignId('deleted_by')->nullable()->after('deleted_at')->constrained('users')->nullOnDelete();
                $table->index('deleted_at');
            }
        });

        Schema::table('off_campus_assets', function (Blueprint $table) {
            if (!Schema::hasColumn('off_campus_assets', 'deleted_at')) {
                $table->softDeletes()->after('updated_at');
                $table->index('deleted_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('off_campuses', function (Blueprint $table) {
            if (Schema::hasColumn('off_campuses', 'deleted_by')) {
                $table->dropConstrainedForeignId('deleted_by');
                $table->dropSoftDeletes();
            }
        });

        Schema::table('off_campus_assets', function (Blueprint $table) {
            if (Schema::hasColumn('off_campus_assets', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
