<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLocationRequest;
use App\Http\Requests\UpdateLocationRequest;
use App\Models\Location;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    use ApiResponse;

    /**
     * Get all locations with pagination
     * GET /api/v1/locations
     */
    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $limit = min(1000, max(1, (int) $request->query('limit', 1000)));
        $offset = ($page - 1) * $limit;

        $total = Location::count();
        $locations = Location::orderBy('id')
            ->offset($offset)
            ->limit($limit)
            ->get();

        return $this->paginated(
            $locations->toArray(),
            $total,
            $page,
            $limit
        );
    }

    /**
     * Get a single location by ID
     * GET /api/v1/locations/{id}
     */
    public function show(string $id): JsonResponse
    {
        if (!is_numeric($id)) {
            return $this->error('ID invalide', 400);
        }

        $location = Location::find((int) $id);

        if (!$location) {
            return $this->error('Location non trouvée', 404);
        }

        return $this->success($location);
    }

    /**
     * Create a new location
     * POST /api/v1/locations
     */
    public function store(StoreLocationRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Convert empty strings to null for optional fields
        foreach (['niveau', 'telephone', 'contact', 'email', 'commentaire'] as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        $location = Location::create($data);

        return $this->success($location, 'Location créée avec succès', 201);
    }

    /**
     * Update a location
     * PUT /api/v1/locations/{id}
     */
    public function update(UpdateLocationRequest $request, string $id): JsonResponse
    {
        if (!is_numeric($id)) {
            return $this->error('ID invalide', 400);
        }

        $location = Location::find((int) $id);

        if (!$location) {
            return $this->error('Location non trouvée', 404);
        }

        $data = $request->validated();

        // Check if there's anything to update
        if (empty($data)) {
            return $this->error('Aucune donnée à mettre à jour', 400);
        }

        // Convert empty strings to null for optional fields
        foreach (['niveau', 'telephone', 'contact', 'email', 'commentaire'] as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        $location->update($data);
        $location->refresh();

        return $this->success($location, 'Location mise à jour avec succès');
    }

    /**
     * Delete a location
     * DELETE /api/v1/locations/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        if (!is_numeric($id)) {
            return $this->error('ID invalide', 400);
        }

        $location = Location::find((int) $id);

        if (!$location) {
            return $this->error('Location non trouvée', 404);
        }

        $location->delete();

        return $this->success(null, 'Location supprimée avec succès');
    }

    /**
     * Restore a soft-deleted location
     * POST /api/v1/locations/{id}/restore
     */
    public function restore(string $id): JsonResponse
    {
        if (!is_numeric($id)) {
            return $this->error('ID invalide', 400);
        }

        $location = Location::onlyTrashed()->find((int) $id);

        if (!$location) {
            return $this->error('Location supprimée non trouvée', 404);
        }

        $location->restore();

        return $this->success($location, 'Location restaurée avec succès');
    }

    /**
     * List soft-deleted locations
     * GET /api/v1/locations/trashed
     */
    public function trashed(): JsonResponse
    {
        $locations = Location::onlyTrashed()
            ->orderBy('deleted_at', 'desc')
            ->get();

        return $this->success($locations);
    }

    /**
     * Get all unique types
     * GET /api/v1/locations/types
     */
    public function types(): JsonResponse
    {
        $types = Location::whereNotNull('type')
            ->distinct()
            ->orderBy('type')
            ->pluck('type')
            ->toArray();

        return $this->success($types);
    }

    /**
     * Get all unique cities
     * GET /api/v1/locations/cities
     */
    public function cities(): JsonResponse
    {
        $cities = Location::whereNotNull('ville')
            ->distinct()
            ->orderBy('ville')
            ->pluck('ville')
            ->toArray();

        return $this->success($cities);
    }
}
