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
        Schema::create('inventory_schedulings', function (Blueprint $table) {
            $table->id(); // Primary Key (auto-increment)

             // 👇 NEW: capture preparer
            $table->unsignedBigInteger('prepared_by_id')->nullable();
            $table->foreign('prepared_by_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');

            $table->unsignedBigInteger('building_id')->nullable();  // FK Buildings_Table
            $table->foreign('building_id')
                  ->references('id')
                  ->on('buildings')
                  ->onDelete('set null');


            $table->unsignedBigInteger('building_room_id')->nullable(); // FK BUILDING_ROOMS Table
            $table->foreign('building_room_id')
                  ->references('id')
                  ->on('building_rooms')
                  ->onDelete('set null');

            $table->unsignedBigInteger('unit_or_department_id')->nullable(); // Done FK UNIT_OR_DEPARTMENT Table
            $table->foreign('unit_or_department_id')
                  ->references('id')
                  ->on('unit_or_departments')
                  ->onDelete('set null'); // The onDelete('set null') ensures that if a unit is deleted, the value becomes null instead of breaking the reference.

            $table->unsignedBigInteger('user_id')->nullable();// FK Users_Table
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');

            $table->unsignedBigInteger('designated_employee')->nullable(); // FK Users_Table (Designated Employee)
            $table->foreign('designated_employee')                         // e.g. the one who will do the inventory
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            $table->unsignedBigInteger('assigned_by')->nullable(); // FK Users_Table (Assigned_By) 
            $table->foreign('assigned_by')                         // e.g. manager who assigned the task
                ->references('id')
                ->on('users')
                ->onDelete('set null');

           $table->string('inventory_schedule', 7); // Month Only
            $table->date('actual_date_of_inventory')->nullable(); // MM-DD-YYYY

            $table->string('checked_by')->nullable();
            $table->string('verified_by')->nullable();
            $table->string('received_by')->nullable();
                
            $table->enum('scheduling_status', ['Pending_Review', 'Pending', 'In_Progress' ,'Completed', 'Overdue', 'Cancelled'])->default('Pending_Review');
            $table->text('description')->nullable();


            // $table->enum('scheduling_type', ['counting', 'checking', 'transfer'])->default('checking');
           // Not Sure It's Still Vague

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('inventory_schedulings', function (Blueprint $table) {
            if (!Schema::hasColumn('inventory_schedulings', 'created_by_id')) {
                $table->unsignedBigInteger('created_by_id')->nullable();
                $table->foreign('created_by_id')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete()
                ;
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_schedulings', function (Blueprint $table) {
            $table->dropForeign(['building_id']);              // Drop FK for building
            $table->dropForeign(['building_room_id']);         // Drop FK for building room
            $table->dropForeign(['unit_or_department_id']);    // Drop FK for unit/department
            $table->dropForeign(['user_id']);                 // Drop FK for users
            $table->dropForeign(['designated_employee']);
            $table->dropForeign(['assigned_by']);
            $table->dropForeign(['created_by_id']);
        });

        Schema::dropIfExists('inventory_schedulings');
    }
};
