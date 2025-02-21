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
            $table->id();
            $table->foreignId('health_data_id')->constrained('health_data')->onDelete('cascade'); // Spoljni ključ za health_data
            $table->foreignId('report_id')->constrained('report')->onDelete('cascade'); // Spoljni ključ za report
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
