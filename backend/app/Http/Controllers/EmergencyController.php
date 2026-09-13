<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;

class EmergencyController extends Controller
{
    private const OFFICE_RESET_TOPICS = [
        'office/floor1/reset' => 'RESET',
    ];

    private const WAREHOUSE_RESET_TOPICS = [
        'warehouse/floor2/reset' => 'RESET',
    ];

    private const SILENCE_TOPICS = [
        'office/floor1/reset' => 'RESET',
        'warehouse/floor2/reset' => 'RESET',
    ];

    public function restoreOffice()
    {
        return $this->publishTopics(
            self::OFFICE_RESET_TOPICS,
            'MANUAL_RESTORE_OFFICE',
            'office_reset'
        );
    }

    public function restoreWarehouse()
    {
        return $this->publishTopics(
            self::WAREHOUSE_RESET_TOPICS,
            'MANUAL_RESTORE_WAREHOUSE',
            'warehouse_reset'
        );
    }

    public function restoreAll()
    {
        return $this->publishTopics(
            array_merge(self::OFFICE_RESET_TOPICS, self::WAREHOUSE_RESET_TOPICS),
            'MANUAL_RESTORE_ALL',
            'restore_all'
        );
    }

    public function silenceAlarm()
    {
        return $this->publishTopics(
            self::SILENCE_TOPICS,
            'MANUAL_SILENCE_ALARM',
            'silence_alarm'
        );
    }

    private function publishTopics(array $topics, string $alertType, string $clientId)
    {
        try {
            $config = config('services.mqtt');

            $connectionSettings = (new ConnectionSettings())
                ->setUsername($config['username'] ?: null)
                ->setPassword($config['password'] ?: null)
                ->setConnectTimeout(4)
                ->setSocketTimeout(4);

            $client = new MqttClient(
                $config['host'],
                $config['port'],
                $clientId . '_' . uniqid()
            );

            $client->connect($connectionSettings, true);

            foreach ($topics as $topic => $payload) {
                Log::info("[{$clientId}] {$topic} => {$payload}");

                $client->publish(
                    $topic,
                    $payload,
                    MqttClient::QOS_AT_LEAST_ONCE
                );
            }

            $client->disconnect();

            DB::table('alerts')->insert([
                'alert_type' => $alertType,
                'timestamp'  => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Command sent.',
                'topics'  => $topics,
            ]);
        } catch (\Throwable $e) {
            Log::error("Emergency Control MQTT publish failed [{$clientId}]: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to reach MQTT broker: ' . $e->getMessage(),
            ], 500);
        }
    }
}

