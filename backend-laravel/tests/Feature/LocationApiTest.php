<?php

namespace Tests\Feature;

use App\Models\Location;
use Tests\TestCase;

class LocationApiTest extends TestCase
{
    private array $adminHeaders;
    private array $validLocationData;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminHeaders = [
            'X-Admin-Code' => 'test-admin-code',
        ];

        $this->validLocationData = [
            'nom' => 'Restaurant Test',
            'adresse' => '1 Rue de la Paix',
            'code_postal' => '79000',
            'ville' => 'Niort',
            'type' => 'Restaurant traditionnel',
            'niveau' => '3',
            'telephone' => '05 49 00 00 00',
            'contact' => 'M. Test',
            'email' => 'test@example.fr',
            'commentaire' => 'Lieu de test',
            'lat' => 46.3234,
            'lon' => -0.4648,
        ];
    }

    // ===== GET /locations =====

    public function test_index_returns_empty_list(): void
    {
        $response = $this->getJson('/api/v1/locations');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [],
                'total' => 0,
            ]);
    }

    public function test_index_returns_locations(): void
    {
        Location::create($this->validLocationData);

        $response = $this->getJson('/api/v1/locations');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('total', 1)
            ->assertJsonCount(1, 'data');
    }

    // ===== GET /locations/{id} =====

    public function test_show_returns_location(): void
    {
        $location = Location::create($this->validLocationData);

        $response = $this->getJson("/api/v1/locations/{$location->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nom', 'Restaurant Test')
            ->assertJsonPath('data.ville', 'Niort');
    }

    public function test_show_returns_404_for_missing_location(): void
    {
        $response = $this->getJson('/api/v1/locations/9999');

        $response->assertStatus(404)
            ->assertJson(['success' => false]);
    }

    public function test_show_returns_400_for_invalid_id(): void
    {
        $response = $this->getJson('/api/v1/locations/abc');

        $response->assertStatus(400)
            ->assertJson(['success' => false]);
    }

    // ===== POST /locations =====

    public function test_store_creates_location(): void
    {
        $response = $this->postJson(
            '/api/v1/locations',
            $this->validLocationData,
            $this->adminHeaders
        );

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nom', 'Restaurant Test');

        $this->assertDatabaseHas('locations', [
            'nom' => 'Restaurant Test',
            'ville' => 'Niort',
        ]);
    }

    public function test_store_requires_admin_code(): void
    {
        $response = $this->postJson('/api/v1/locations', $this->validLocationData);

        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    public function test_store_rejects_invalid_admin_code(): void
    {
        $response = $this->postJson(
            '/api/v1/locations',
            $this->validLocationData,
            ['X-Admin-Code' => 'wrong-code']
        );

        $response->assertStatus(403)
            ->assertJson(['success' => false]);
    }

    public function test_store_validates_required_fields(): void
    {
        $response = $this->postJson(
            '/api/v1/locations',
            ['nom' => 'Test'],
            $this->adminHeaders
        );

        $response->assertStatus(400)
            ->assertJson(['success' => false]);
    }

    public function test_store_validates_email_format(): void
    {
        $data = array_merge($this->validLocationData, ['email' => 'not-an-email']);

        $response = $this->postJson(
            '/api/v1/locations',
            $data,
            $this->adminHeaders
        );

        $response->assertStatus(400);
    }

    public function test_store_validates_lat_lon_range(): void
    {
        $data = array_merge($this->validLocationData, ['lat' => 200]);

        $response = $this->postJson(
            '/api/v1/locations',
            $data,
            $this->adminHeaders
        );

        $response->assertStatus(400);
    }

    // ===== PUT /locations/{id} =====

    public function test_update_modifies_location(): void
    {
        $location = Location::create($this->validLocationData);

        $response = $this->putJson(
            "/api/v1/locations/{$location->id}",
            ['nom' => 'Nouveau Nom'],
            $this->adminHeaders
        );

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nom', 'Nouveau Nom');

        $this->assertDatabaseHas('locations', ['nom' => 'Nouveau Nom']);
    }

    public function test_update_requires_admin_code(): void
    {
        $location = Location::create($this->validLocationData);

        $response = $this->putJson(
            "/api/v1/locations/{$location->id}",
            ['nom' => 'Nouveau Nom']
        );

        $response->assertStatus(401);
    }

    // ===== DELETE /locations/{id} =====

    public function test_destroy_soft_deletes_location(): void
    {
        $location = Location::create($this->validLocationData);

        $response = $this->deleteJson(
            "/api/v1/locations/{$location->id}",
            [],
            $this->adminHeaders
        );

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Soft deleted: still in DB but not visible
        $this->assertSoftDeleted('locations', ['id' => $location->id]);
    }

    public function test_destroy_requires_admin_code(): void
    {
        $location = Location::create($this->validLocationData);

        $response = $this->deleteJson("/api/v1/locations/{$location->id}");

        $response->assertStatus(401);
    }

    // ===== GET /locations/types =====

    public function test_types_returns_unique_types(): void
    {
        Location::create($this->validLocationData);
        Location::create(array_merge($this->validLocationData, [
            'nom' => 'Brasserie Test',
            'type' => 'Brasserie',
        ]));

        $response = $this->getJson('/api/v1/locations/types');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    // ===== GET /locations/cities =====

    public function test_cities_returns_unique_cities(): void
    {
        Location::create($this->validLocationData);
        Location::create(array_merge($this->validLocationData, [
            'nom' => 'Restaurant Poitiers',
            'ville' => 'Poitiers',
        ]));

        $response = $this->getJson('/api/v1/locations/cities');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    // ===== Soft delete & restore =====

    public function test_trashed_returns_deleted_locations(): void
    {
        $location = Location::create($this->validLocationData);
        $location->delete();

        $response = $this->getJson('/api/v1/locations/trashed', $this->adminHeaders);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }

    public function test_restore_recovers_deleted_location(): void
    {
        $location = Location::create($this->validLocationData);
        $location->delete();

        $response = $this->postJson(
            "/api/v1/locations/{$location->id}/restore",
            [],
            $this->adminHeaders
        );

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('locations', [
            'id' => $location->id,
            'deleted_at' => null,
        ]);
    }
}
