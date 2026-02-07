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
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 255);
            $table->string('adresse', 500);
            $table->string('code_postal', 10);
            $table->string('ville', 100);
            $table->string('type', 100);
            $table->string('niveau', 20)->nullable();
            $table->string('telephone', 50)->nullable();
            $table->string('contact', 200)->nullable();
            $table->string('email', 255)->nullable();
            $table->text('commentaire')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lon', 10, 7)->nullable();
            $table->timestamps();
        });

        // Create indexes for common search fields
        Schema::table('locations', function (Blueprint $table) {
            $table->index('ville', 'idx_locations_ville');
            $table->index('type', 'idx_locations_type');
            $table->index('code_postal', 'idx_locations_code_postal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
