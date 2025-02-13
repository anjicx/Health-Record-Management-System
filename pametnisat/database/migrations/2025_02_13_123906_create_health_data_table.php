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
        // Kreiranje kolona, bez auto-increment za 'id'
        $table->unsignedBigInteger('id'); // ID bez auto-increment
        $table->foreignId('device_id')->constrained('device')->onDelete('cascade'); // Strani ključ za device_id

        // Složeni primarni ključ
        $table->primary(['id', 'device_id']); 

        // Definisanje kolona
        $table->time('time');
        $table->date('date');
        $table->float('value');
        $table->string('unit');
        
        // Strani ključ za category_id koristeći foreignId
        $table->foreignId('category_id')->constrained('category')->onDelete('cascade'); // Strani ključ za category_id

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
