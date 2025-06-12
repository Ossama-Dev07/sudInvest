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
        Schema::create('logs_actions', function (Blueprint $table) {
            $table->id();
            $table->enum("type_action",['update','delete','add','create']);
            $table->text("description");
            $table->unsignedBigInteger('id_utilisateur')->nullable();
            $table->timestamps();
            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('utilisateurs')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs_actions');
    }
};
