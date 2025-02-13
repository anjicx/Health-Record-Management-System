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
            // Definisanje kolona, koristićemo foreignId za strane ključeve
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('health_data_id')->constrained('health_data')->onDelete('cascade');
            
            // Složeni primarni ključ
            $table->primary(['user_id', 'health_data_id']); // Definišemo složeni primarni ključ
    
            // Ostale kolone
            $table->date('creationDate');
            $table->time('creationTime');
            $table->string('category');
            
            // Dodavanje vremena kada je red kreiran i ažuriran
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
