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
        Schema::table('exports', function (Blueprint $table) {
            $table->foreignUlid('product_id')->nullable()->change();
            $table->foreignUuid('product_list_id')->nullable()->after('product_id')->constrained('product_lists')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exports', function (Blueprint $table) {
            $table->dropForeign(['product_list_id']);
            $table->dropColumn('product_list_id');
            $table->foreignUlid('product_id')->nullable(false)->change();
        });
    }
};
