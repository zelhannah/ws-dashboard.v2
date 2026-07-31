<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. ZONES
        |--------------------------------------------------------------------------
        */
        DB::table('zones')->insert([
            [
                'zone_id' => 1,
                'zone_name' => 'Office',
                'description' => 'First floor office'
            ],
            [
                'zone_id' => 2,
                'zone_name' => 'Warehouse',
                'description' => 'Second floor warehouse'
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 2. DEVICES
        |--------------------------------------------------------------------------
        */
        DB::table('devices')->insert([
            [
                'device_id' => 1,
                'device_type' => 'ESP32A',
                'status' => 'Active',
                'zone_id' => 1
            ],
            [
                'device_id' => 2,
                'device_type' => 'ESP32B',
                'status' => 'Active',
                'zone_id' => 2
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 3. SENSORS
        |--------------------------------------------------------------------------
        */
        DB::table('sensors')->insert([
            [
                'sensor_id' => 1,
                'sensor_type' => 'PIR Motion',
                'status' => 'Active',
                'device_id' => 1,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'sensor_id' => 2,
                'sensor_type' => 'Door Reed Switch A',
                'status' => 'Active',
                'device_id' => 1,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'sensor_id' => 3,
                'sensor_type' => 'Vibration Sensor',
                'status' => 'Active',
                'device_id' => 1,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'sensor_id' => 4,
                'sensor_type' => 'Buzzer A',
                'status' => 'Active',
                'device_id' => 1,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'sensor_id' => 5,
                'sensor_type' => 'RFID',
                'status' => 'Active',
                'device_id' => 2,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'sensor_id' => 6,
                'sensor_type' => 'Door Reed Switch B',
                'status' => 'Active',
                'device_id' => 2,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'sensor_id' => 7,
                'sensor_type' => 'LED Light Green',
                'status' => 'Active',
                'device_id' => 2,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'sensor_id' => 8,
                'sensor_type' => 'LED Light Yellow',
                'status' => 'Active',
                'device_id' => 2,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'sensor_id' => 9,
                'sensor_type' => 'LED Light Red',
                'status' => 'Active',
                'device_id' => 2,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'sensor_id' => 10,
                'sensor_type' => 'Buzzer B',
                'status' => 'Active',
                'device_id' => 2,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'sensor_id' => 11,
                'sensor_type' => 'LCD Display',
                'status' => 'Active',
                'device_id' => 2,
                'created_at' => null,
                'updated_at' => null,
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 4. SENSOR DATA
        |--------------------------------------------------------------------------
        */
        $officePayloads = [
            'NORMAL VIBRATION', 'ATTACK_BLOCKED', 'SCENARIO_2_STARTED',
            'REPLAY_DATA_REJECTED', 'CLOSED', 'COUNT_1', 'OFF', 'CLOSED',
        ];
        $warehousePayloads = [
            'NORMAL CONDITION', 'SYSTEM ACTIVE', 'ATTACK RESET',
            'UNAUTHORIZED ACCESS', 'ALARM ACTIVE', 'CLOSED', 'CONTINUOUS',
            'LOCKED', 'Scan RFID', 'ON', 'OFF',
        ];

        $officeSensorIds = [1, 2, 3, 4];
        $warehouseSensorIds = [5, 6, 7, 8, 9, 10, 11];

        $fakeData = [];
        for ($i = 0; $i < 20; $i++) {
            $isOffice = rand(0, 1);
            $sensorIds = $isOffice ? $officeSensorIds : $warehouseSensorIds;
            $payloads = $isOffice ? $officePayloads : $warehousePayloads;
            $fakeData[] = [
                'sensor_id' => $sensorIds[array_rand($sensorIds)],
                'value' => $payloads[array_rand($payloads)],
                'timestamp' => now()->subMinutes(rand(0, 60))
            ];
        }

        DB::table('sensor_data')->insert($fakeData);

        /*
        |--------------------------------------------------------------------------
        | 5. USERS
        |--------------------------------------------------------------------------
        */
        DB::table('users')->insert([
            [
                'user_id' => 1,
                'name' => 'Security Admin',
                'email' => 'admin@waresafe.local',
                'password' => bcrypt('password123'),
                'role' => 'Admin'
            ]
        ]);

        /*
        |--------------------------------------------------------------------------
        | 6. ATTACK SCENARIOS
        |--------------------------------------------------------------------------
        */
        DB::table('attack_scenarios')->insert([
            [
                'attack_id' => 1,
                'attack_type' => 'Replay Attack',
                'target_component' => 'PIR Motion Sensor, MQTT PIR Topic, Door Access',
                'description' => 'Fake PIR data replayed',
                'timestamp' => now(),
            ],
            [
                'attack_id' => 2,
                'attack_type' => 'Vibration Spoofing Attack',
                'target_component' => 'Vibration Sensor, MQTT Vibration Topic',
                'description' => 'Fake vibration data injected',
                'timestamp' => now(),
            ],
            [
                'attack_id' => 3,
                'attack_type' => 'Flooding Attack',
                'target_component' => 'MQTT Alarm Topic, Alarm Module',
                'description' => 'Repeated danger alarm packets flood',
                'timestamp' => now(),
            ],
            [
                'attack_id' => 4,
                'attack_type' => 'Security Suppression',
                'target_component' => 'RFID Authentication Logic, Alarm Module',
                'description' => 'Security alerts suppressed',
                'timestamp' => now(),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 7. ALERTS
        |--------------------------------------------------------------------------
        */
        DB::table('alerts')->insert([
            [
                'alert_id' => 1,
                'attack_id' => 1,
                'sensor_id' => 1,
                'alert_type' => 'Replay Attack',
                'timestamp' => now()
            ],
            [
                'alert_id' => 2,
                'attack_id' => 2,
                'sensor_id' => 3,
                'alert_type' => 'Vibration Spoofing Attack',
                'timestamp' => now()
            ],
            [
                'alert_id' => 3,
                'attack_id' => 3,
                'sensor_id' => 10,
                'alert_type' => 'Flooding Attack',
                'timestamp' => now()
            ],
            [
                'alert_id' => 4,
                'attack_id' => 4,
                'sensor_id' => 5,
                'alert_type' => 'Security Suppression',
                'timestamp' => now()
            ],
            
        ]);

            }
}