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
            Schema::create('building_rooms', function (Blueprint $table) {
                $table->id();

                $table->unsignedBigInteger('building_id');
                $table->foreign('building_id')
                    ->references('id')
                    ->on('buildings')
                    ->onDelete('restrict'); 

                $table->string('room', 50);
                $table->text('description')->nullable();

                $table->timestamps();
                $table->softDeletes();
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::table('building_rooms', function (Blueprint $table) {
                $table->dropForeign(['building_id']);
            });

            Schema::dropIfExists('building_rooms');
        }
    };
