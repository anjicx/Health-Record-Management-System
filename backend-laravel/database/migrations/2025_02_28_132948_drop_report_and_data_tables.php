<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('data_report');

        Schema::dropIfExists('report');

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('report', function (Blueprint $table) {
            Schema::create('report', function (Blueprint $table) {
                $table->id();
                $table->date('creationDate');
                $table->time('creationTime');
                $table->string('category');
                $table->integer('average_heart_rate');
                $table->integer('max_heart_rate');
                $table->integer('min_heart_rate');
                $table->integer('average_bp');
                $table->integer('steps_total');
                $table->integer('calories_burned_total');
                $table->integer('sleep_quality_avg');
                $table->integer('stress_level_avg');
                $table->timestamps();
            });

            Schema::create('data_report', function (Blueprint $table) {
                $table->id();
                $table->foreignId('idHealthData')->constrained('health_data')->onDelete('cascade');
                $table->foreignId('idReport')->constrained('report')->onDelete('cascade');
                $table->timestamps();
            });
        });
    }
};
