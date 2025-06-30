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
        Schema::create('declaration_fiscals', function (Blueprint $table) {
            $table->id();
            $table->date('dateDeclaration');
            $table->decimal('montant_declare', 10, 2);
            $table->string('statut_declaration');
            
            // NEW FIELDS we're adding for DECLARATIONS:
            $table->string('type_declaration', 100);
            $table->year('annee_declaration');
            $table->date('date_limite')->nullable(); // Deadline
            $table->boolean('obligatoire')->default(true);
            $table->text('commentaire')->nullable();
            
            $table->foreignId('id_HFiscal')->constrained('historique_fiscals', 'id')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('declaration_fiscals');
    }
};