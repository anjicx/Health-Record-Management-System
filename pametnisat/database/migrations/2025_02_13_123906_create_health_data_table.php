<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('health_data', function (Blueprint $table) {
            $table->id(); // Primarni ključ
            $table->timestamp('timestamp'); // Vreme merenja
            $table->integer('heart_rate'); // BPM
            $table->integer('systolic_bp');
            $table->integer('diastolic_bp');
            $table->integer('spo2');
            $table->integer('steps');
            $table->float('calories_burned');
            $table->integer('sleep_quality');
            $table->integer('stress_level');
            $table->foreignId('device_id')->constrained('device')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('health_data');
    }
};
