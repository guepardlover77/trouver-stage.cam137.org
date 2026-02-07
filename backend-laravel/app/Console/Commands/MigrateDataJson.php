<?php

namespace App\Console\Commands;

use App\Models\Location;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateDataJson extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'migrate:datajson
                            {--force : Force migration without confirmation}
                            {--path= : Custom path to data.json}';

    /**
     * The console command description.
     */
    protected $description = 'Migrate data from data.json to PostgreSQL';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting migration from data.json to PostgreSQL...');

        // Find data.json file
        $dataFile = $this->findDataFile();

        if (!$dataFile) {
            $this->error('Could not find data.json in any expected location');
            return Command::FAILURE;
        }

        $this->info("Reading data from: {$dataFile}");

        // Read and parse JSON
        $rawData = file_get_contents($dataFile);
        $locations = json_decode($rawData, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Invalid JSON in data file: ' . json_last_error_msg());
            return Command::FAILURE;
        }

        $this->info("Found " . count($locations) . " locations to migrate");

        // Check for existing data
        $existingCount = Location::count();

        if ($existingCount > 0) {
            $this->warn("Database already contains {$existingCount} locations.");

            if (!$this->option('force')) {
                if (!$this->confirm('Do you want to delete existing data and reimport?')) {
                    $this->info('Migration cancelled.');
                    return Command::SUCCESS;
                }
            }

            // Truncate table
            DB::statement('TRUNCATE locations RESTART IDENTITY');
            $this->info('Existing data deleted.');
        }

        // Insert data in batches
        $batchSize = 100;
        $inserted = 0;
        $errors = 0;

        $progressBar = $this->output->createProgressBar(count($locations));
        $progressBar->start();

        foreach (array_chunk($locations, $batchSize) as $batch) {
            DB::beginTransaction();

            try {
                foreach ($batch as $loc) {
                    try {
                        Location::create([
                            'nom' => $loc['nom'] ?? '',
                            'adresse' => $loc['adresse'] ?? '',
                            // Handle both camelCase (legacy) and snake_case
                            'code_postal' => $loc['code_postal'] ?? $loc['codePostal'] ?? '',
                            'ville' => $loc['ville'] ?? '',
                            'type' => $loc['type'] ?? '',
                            'niveau' => $loc['niveau'] ?? null,
                            'telephone' => $loc['telephone'] ?? null,
                            'contact' => $loc['contact'] ?? null,
                            'email' => $loc['email'] ?? null,
                            'commentaire' => $loc['commentaire'] ?? null,
                            'lat' => $loc['lat'] ?? null,
                            'lon' => $loc['lon'] ?? null,
                        ]);
                        $inserted++;
                    } catch (\Exception $e) {
                        $this->newLine();
                        $this->error("Error inserting location \"{$loc['nom']}\": " . $e->getMessage());
                        $errors++;
                    }
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $this->newLine();
                $this->error('Batch failed, rolling back: ' . $e->getMessage());
            }

            $progressBar->advance(count($batch));
        }

        $progressBar->finish();
        $this->newLine(2);

        // Summary
        $this->info('--- Migration Summary ---');
        $this->info("Total locations in file: " . count($locations));
        $this->info("Successfully inserted: {$inserted}");

        if ($errors > 0) {
            $this->warn("Errors: {$errors}");
        }

        $finalCount = Location::count();
        $this->info("Total in database: {$finalCount}");
        $this->info('Migration completed!');

        return Command::SUCCESS;
    }

    /**
     * Find the data.json file in various possible locations
     */
    private function findDataFile(): ?string
    {
        // Custom path from option
        if ($customPath = $this->option('path')) {
            if (file_exists($customPath)) {
                return $customPath;
            }
            $this->warn("Custom path not found: {$customPath}");
        }

        // Possible paths to check
        $possiblePaths = [
            '/app/data.json',                          // Docker container
            base_path('../data.json'),                 // Parent directory
            base_path('data.json'),                    // Same directory as Laravel
            storage_path('app/data.json'),             // Storage directory
        ];

        foreach ($possiblePaths as $path) {
            $this->line("Checking: {$path}");
            if (file_exists($path)) {
                return $path;
            }
        }

        return null;
    }
}
