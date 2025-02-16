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
        Schema::create('health_data_report', function (Blueprint $table) {

            $table->id();//njegov id
            //id report i health_data
            $table->foreignId('health_data_id')->constrained('health_data')->onDelete('cascade');
            $table->foreignId('report_id')->constrained('report')->onDelete('cascade');
           //stvari koje se pamte na asocij klasi
            $table->text('summary')->nullable();
            $table->enum('risk_level', ['low', 'medium', 'high'])->default('low');
            $table->integer('average_heart_rate')->nullable();
            $table->integer('max_heart_rate')->nullable();
            $table->integer('min_heart_rate')->nullable();
            $table->string('average_bp')->nullable();
            $table->string('spo2_trend')->nullable();
            $table->integer('steps_total')->nullable();
            $table->float('calories_burned_total')->nullable();
            $table->integer('sleep_quality_avg')->nullable();
            $table->integer('stress_level_avg')->nullable();
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
        Schema::dropIfExists('health_data_report');
    }
};
