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
    Schema::create('report', function (Blueprint $table) {
        $table->id(); 
        
        $table->date('creationDate');
        $table->time('creationTime');
        $table->string('category'); //dnevni mesecni itd
        $table->json('health_data_ids')->nullable(); // Čuva listu ID-eva


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




        $table->foreignId('user_id')->constrained('user')->onDelete('cascade');

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
        Schema::dropIfExists('report');
    }
};
