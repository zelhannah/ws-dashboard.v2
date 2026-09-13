<?php

namespace App\Console\Commands;

use App\Support\SensorStatus;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PhpMqtt\Client\ConnectionSettings;
use PhpMqtt\Client\MqttClient;

class MqttListen extends Command
{
    protected $signature = 'mqtt:listen';
    protected $description = 'Subscribe to the WareSafe MQTT topics and persist sensor_data / alerts (replaces mqtt_subscriber.py)';

    private const TOPIC = [
        'OFFICE_SYSTEM'      => 'office/floor1/system',
        'OFFICE_SECURITY'    => 'office/floor1/security',
        'OFFICE_ATTACK'      => 'office/floor1/attack',
        'OFFICE_IR'          => 'office/floor1/IRsensor',
        'OFFICE_REED'        => 'office/floor1/reedA',
        'OFFICE_DOOR'        => 'office/floor1/maindoor',
        'OFFICE_VIBRATION'   => 'office/floor1/vibration',
        'OFFICE_BUZZER'      => 'office/floor1/buzzerA',
        'WAREHOUSE_SYSTEM'   => 'warehouse/floor2/system',
        'WAREHOUSE_SECURITY' => 'warehouse/floor2/security',
        'WAREHOUSE_ACCESS'   => 'warehouse/floor2/access',
        'WAREHOUSE_ATTACK'   => 'warehouse/floor2/attack',
        'WAREHOUSE_REED'     => 'warehouse/floor2/reedB',
        'WAREHOUSE_DOOR'     => 'warehouse/floor2/warehousedoor',
        'WAREHOUSE_LED'      => 'warehouse/floor2/ledlight',
        'WAREHOUSE_BUZZER'   => 'warehouse/floor2/buzzerB',
        'WAREHOUSE_LCD'      => 'warehouse/floor2/displaytext',
        'WAREHOUSE_ALARM'    => 'warehouse/floor2/alarm',
    ];

    private const SENSOR = [
        'IR' => 1,
        'REEDA' => 2,
        'VIBRATION' => 3,
        'BUZZERA' => 4,
        'RFID' => 5,
        'REEDB' => 6,
        'LED_GREEN' => 7,
        'LED_YELLOW' => 8,
        'LED_RED' => 9,
        'BUZZERB' => 10,
        'LCD' => 11,
    ];

    private const ATTACK = [
        'SCENARIO_1' => 1,
        'SCENARIO_2' => 2,
        'SCENARIO_3' => 3,
        'SCENARIO_4' => 4,
    ];

    private array $sensorTopic = [];
    private array $ledSensor = [];
    private array $attackRules = [];

    private array $topics = [];

    public function __construct()
    {
        parent::__construct();

        $topic_map = self::TOPIC;
        $sensor = self::SENSOR;
        $attack_map = self::ATTACK;

        $this->topics = array_values($topic_map);

        $this->sensorTopic = [
            $topic_map['OFFICE_SYSTEM']      => $sensor['IR'],
            $topic_map['OFFICE_SECURITY']    => $sensor['IR'],
            $topic_map['OFFICE_IR']          => $sensor['IR'],
            $topic_map['OFFICE_REED']        => $sensor['REEDA'],
            $topic_map['OFFICE_DOOR']        => $sensor['REEDA'],
            $topic_map['OFFICE_VIBRATION']   => $sensor['VIBRATION'],
            $topic_map['OFFICE_BUZZER']      => $sensor['BUZZERA'],
            $topic_map['WAREHOUSE_SYSTEM']   => $sensor['LCD'],
            $topic_map['WAREHOUSE_SECURITY'] => $sensor['LCD'],
            $topic_map['WAREHOUSE_ACCESS']   => $sensor['RFID'],
            $topic_map['WAREHOUSE_REED']     => $sensor['REEDB'],
            $topic_map['WAREHOUSE_DOOR']     => $sensor['REEDB'],
            $topic_map['WAREHOUSE_BUZZER']   => $sensor['BUZZERB'],
            $topic_map['WAREHOUSE_LCD']      => $sensor['LCD'],
            $topic_map['WAREHOUSE_ALARM']    => $sensor['BUZZERB'],
            $topic_map['WAREHOUSE_LED']      => null,
        ];

        $this->ledSensor = [
            'GREEN'  => $sensor['LED_GREEN'],
            'YELLOW' => $sensor['LED_YELLOW'],
            'RED'    => $sensor['LED_RED'],
        ];

        $this->attackRules = [
            $topic_map['OFFICE_ATTACK'] => [
                [['SCENARIO_1_STARTED', 'SCENARIO_1_BLOCKED'], $sensor['IR'], $attack_map['SCENARIO_1']],
                [['SCENARIO_2_STARTED', 'SCENARIO_2_BLOCKED'], $sensor['VIBRATION'], $attack_map['SCENARIO_2']],
            ],
            $topic_map['WAREHOUSE_ATTACK'] => [
                [['SCENARIO_3_STARTED', 'SCENARIO_3_BLOCKED', 'FLOODING_ATTACK'], $sensor['BUZZERB'], $attack_map['SCENARIO_3']],
                [['SCENARIO_4_STARTED', 'SCENARIO_4_BLOCKED'], $sensor['RFID'], $attack_map['SCENARIO_4']],
            ],
        ];
    }

    public function handle(): int
    {
        $config = config('services.mqtt');

        $connectionSettings = (new ConnectionSettings())
            ->setUsername($config['username'] ?: null)
            ->setPassword($config['password'] ?: null)
            ->setConnectTimeout(5)
            ->setSocketTimeout(5)
            ->setKeepAliveInterval(60);

        $this->info('[SYSTEM] WareSafe MQTT Listener Running...');
        while (true) {
            try {
                $client = new MqttClient( $config['host'], $config['port'], $config['client_id']);
                $client->connect($connectionSettings, true);

                $this->info('[MQTT] Connected');
                foreach ($this->topics as $topic) {
                    $client->subscribe(
                        $topic,
                        function (string $topic, string $payload) {
                            $this->onMessage($topic, $payload);
                        },
                        MqttClient::QOS_AT_MOST_ONCE
                    );

                    $this->info("[MQTT] Subscribe : {$topic}");
                }

                $client->loop(true);

            } catch (\Throwable $e) {
                $this->error("[MQTT] Connection Lost");
                $this->error($e->getMessage());
                sleep(3);

                $this->info("[MQTT] Reconnecting...");
            }
        }
        return self::SUCCESS;
    }

    private function onMessage(string $topic, string $payload): void
    {
        $this->line("[MQTT] {$topic} -> {$payload}");

        if (array_key_exists($topic, $this->sensorTopic)) {
            $this->handleSensorData($topic, $payload);
        } elseif (array_key_exists($topic, $this->attackRules)) {
            $this->handleAttack($topic, $payload);
        }
    }

    private function handleSensorData(string $topic, string $payload): void
    {
        if ($topic === self::TOPIC['WAREHOUSE_LED']) {
            $sensorId = $this->ledSensor[$payload] ?? null;
        } else {
            $sensorId = $this->sensorTopic[$topic] ?? null;
        }

        if ($sensorId !== null) {
            $this->insertSensorData($sensorId, $payload);
        }
    }

    private function handleAttack(string $topic, string $payload): void
    {
        foreach ($this->attackRules[$topic] ?? [] as [$payloads, $sensorId, $attackId]) {
            if (in_array($payload, $payloads, true)) {
                $this->insertAlert($sensorId, $attackId, $payload);
                return;
            }
        }
    }

    private function insertSensorData(int $sensorId, string $value): void
    {
        $previousValue = DB::table('sensor_data')
            ->where('sensor_id', $sensorId)
            ->orderByDesc('timestamp')
            ->value('value');

        DB::table('sensor_data')->insert([
            'sensor_id' => $sensorId,
            'value'     => $value,
            'timestamp' => now(),
        ]);

        $newStatus      = SensorStatus::resolve($value);
        $previousStatus = $previousValue !== null ? SensorStatus::resolve($previousValue) : 'secondary';

        // Only write a new alert row when the sensor is entering or escalating
        // a warning/danger state (i.e. its status actually changed). Without
        // this check, a sensor that keeps re-publishing the same "DANGER..."
        // value every tick would flood the alerts table with one row per
        // message instead of one row per real event.
        if (in_array($newStatus, ['warning', 'danger'], true) && $newStatus !== $previousStatus) {
            $this->insertAlert($sensorId, null, $value);
        }
    }

    private function insertAlert(int $sensorId, ?int $attackId, string $alertType): void
    {
        DB::table('alerts')->insert([
            'sensor_id'  => $sensorId,
            'attack_id'  => $attackId,
            'alert_type' => $alertType,
            'timestamp'  => now(),
        ]);
    }
}
