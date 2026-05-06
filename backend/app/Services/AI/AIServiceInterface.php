<?php

namespace App\Services\AI;

interface AIServiceInterface
{
    /**
     * Analyze an image and return extracted product data.
     *
     * @param string $imagePath Path to the image in storage
     * @return array
     */
    public function analyze(string $imagePath): array;
}
