<?php

namespace Tests\Feature;

use Tests\TestCase;

class AuthApiTest extends TestCase
{
    public function test_verify_with_valid_code_returns_success(): void
    {
        $response = $this->postJson('/api/v1/auth/verify', [
            'code' => 'test-admin-code',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_verify_with_invalid_code_returns_401(): void
    {
        $response = $this->postJson('/api/v1/auth/verify', [
            'code' => 'wrong-code',
        ]);

        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    public function test_verify_without_code_returns_400(): void
    {
        $response = $this->postJson('/api/v1/auth/verify', []);

        $response->assertStatus(400)
            ->assertJson(['success' => false]);
    }
}
