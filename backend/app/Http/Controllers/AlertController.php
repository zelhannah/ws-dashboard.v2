<?php

namespace App\Http\Controllers;

use App\Support\SensorStatus;
use Illuminate\Support\Facades\DB;

class AlertController extends Controller
{

    public function index()
    {
        return response()->json([
            'normalActivity'  => $this->normalActivity(),
            'attackScenarios' => $this->attackScenarios(),
            'alertLog'        => $this->alertLog(),
        ]);
    }

    private function normalActivity()
    {
        $rows = DB::table('sensor_data')
            ->join('sensors', 'sensor_data.sensor_id', '=', 'sensors.sensor_id')
            ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
            ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
            ->select(
                'sensor_data.data_id as id',
                'sensor_data.value',
                'sensors.sensor_type',
                'zones.zone_name',
                'sensor_data.timestamp'
            )
            ->orderByDesc('sensor_data.timestamp')
            ->limit(30)
            ->get()
            ->filter(fn ($r) => !in_array(SensorStatus::resolve($r->value), ['danger', 'warning'], true));

        return $rows->map(fn ($r) => [
            'time'     => date('H:i', strtotime($r->timestamp)),
            'zone'     => $r->zone_name,
            'sensor'   => $r->sensor_type,
            'activity' => $r->value,
            'status'   => 'Normal',
        ])->values()->all();
    }

    private function attackScenarios()
    {
        $rows = DB::table('alerts')
        ->join('attack_scenarios', 'alerts.attack_id', '=', 'attack_scenarios.attack_id')
        ->select(
            'alerts.timestamp',
            'attack_scenarios.attack_id',
            'attack_scenarios.attack_type',
            'attack_scenarios.description'
        )
        ->orderByDesc('alerts.timestamp')
        ->limit(20)
        ->get();

        return $rows->map(fn ($r) => [
            'time'     => date('H:i', strtotime($r->timestamp)),
            'scenario' => 'Scenario ' . $r->attack_id,
            'attack'   => $r->attack_type,
            'result'   => $r->description,
            'severity' => 'Critical',
        ])->values()->all();
    }

    private function alertLog()
    {
        $rows = DB::table('alerts')
            ->leftJoin('attack_scenarios', 'alerts.attack_id', '=', 'attack_scenarios.attack_id')
            ->leftJoin('sensors', 'alerts.sensor_id', '=', 'sensors.sensor_id')
            ->select(
                'alerts.alert_id as id',
                'alerts.alert_type',
                'attack_scenarios.attack_type',
                'sensors.sensor_type',
                'alerts.timestamp'
            )
            ->orderByDesc('alerts.timestamp')
            ->limit(20)
            ->get();

        return $rows->map(fn ($r) => [
            'time'     => date('H:i', strtotime($r->timestamp)),
            'action'   => $r->alert_type,
            'response' => $r->attack_type
                ? "Triggered by {$r->attack_type}" . ($r->sensor_type ? " on {$r->sensor_type}" : '')
                : ($r->sensor_type ? "Sensor: {$r->sensor_type}" : 'System event'),
            'status'   => 'Logged',
        ])->values()->all();
    }
}
