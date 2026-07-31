<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;

class EmergencyController extends Controller
{
    /**
     * NOTE FOR JEEE: the exact topic names below are my best guess based on
     * MqttTopics.tsx / the sensor data already in the DB. Double check them
     * against your actual ESP32 firmware (sketch) before the demo — if the
     * firmware expects a different topic or payload string for "reset"/"off",
     * update the arrays below to match. Everything else in this controller
     * (the MQTT connection + logging) will work regardless.
     */
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
        return $this->publishAndLog(self::OFFICE_RESET_TOPICS, 'MANUAL_RESTORE_OFFICE');
    }

    public function restoreWarehouse()
    {
        return $this->publishAndLog(self::WAREHOUSE_RESET_TOPICS, 'MANUAL_RESTORE_WAREHOUSE');
    }

    public function restoreAll()
    {
        $topics = array_merge(self::OFFICE_RESET_TOPICS, self::WAREHOUSE_RESET_TOPICS);
        return $this->publishAndLog($topics, 'MANUAL_RESTORE_ALL');
    }

    public function silenceAlarm()
    {
        return $this->publishAndLog(self::SILENCE_TOPICS, 'MANUAL_SILENCE_ALARM');
    }

    /**
     * Publishes each topic => payload pair over MQTT, then writes one row
     * to `alerts` so the action shows up in the Alerts page's Alert Log too.
     */
    private function publishAndLog(array $topics, string $alertType)
    {
        try {
            $config = config('services.mqtt');

            $connectionSettings = (new ConnectionSettings())
                ->setUsername($config['username'] ?: null)
                ->setPassword($config['password'] ?: null)
                ->setConnectTimeout(4)
                ->setSocketTimeout(4);

            $client = new MqttClient($config['host'], $config['port'], $config['client_id']);
            $client->connect($connectionSettings, true);

            foreach ($topics as $topic => $payload) {
                $client->publish($topic, $payload, MqttClient::QOS_AT_LEAST_ONCE);
            }

            $client->disconnect();

            DB::table('alerts')->insert([
                'alert_type' => $alertType,
                'timestamp'  => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Command sent successfully.',
                'topics'  => $topics,
            ]);
        } catch (\Throwable $e) {
            Log::error('Emergency Control MQTT publish failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to reach MQTT broker: ' . $e->getMessage(),
            ], 500);
        }
    }
}
