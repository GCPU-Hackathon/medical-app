<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class HealthCheckService
{
    /**
     * Check if a service is healthy by making a health check request
     */
    public static function checkServiceHealth(string $url, int $timeout = 5): array
    {
        try {
            $response = Http::timeout($timeout)->get($url);
            
            if ($response->successful()) {
                $data = $response->json();
                
                // Check if response has the expected format
                if (isset($data['status']) && $data['status'] === 'ok') {
                    return [
                        'status' => 'online',
                        'message' => $data['message'] ?? 'Service is healthy',
                        'response_time' => $response->transferStats?->getTransferTime() ?? null,
                        'last_check' => now()->format('Y-m-d H:i:s'),
                    ];
                }
                
                return [
                    'status' => 'degraded',
                    'message' => 'Service responded but status is not ok',
                    'response' => $data,
                    'last_check' => now()->format('Y-m-d H:i:s'),
                ];
            }
            
            return [
                'status' => 'offline',
                'message' => "Service returned HTTP {$response->status()}",
                'last_check' => now()->format('Y-m-d H:i:s'),
            ];
            
        } catch (Exception $e) {
            Log::warning("Health check failed for {$url}: " . $e->getMessage());
            
            return [
                'status' => 'offline',
                'message' => 'Service unreachable: ' . $e->getMessage(),
                'last_check' => now()->format('Y-m-d H:i:s'),
            ];
        }
    }
    
    /**
     * Check multiple services health in parallel
     */
    public static function checkMultipleServices(array $services): array
    {
        $results = [];
        
        foreach ($services as $name => $config) {
            $url = $config['url'];
            $timeout = $config['timeout'] ?? 5;
            
            $results[$name] = array_merge(
                $config,
                self::checkServiceHealth($url, $timeout)
            );
        }
        
        return $results;
    }
    
    /**
     * Get the overall system health status
     */
    public static function getOverallStatus(array $services): string
    {
        $statuses = array_column($services, 'status');
        
        if (in_array('offline', $statuses)) {
            return 'degraded';
        }
        
        if (in_array('degraded', $statuses)) {
            return 'degraded';
        }
        
        return 'healthy';
    }
}
