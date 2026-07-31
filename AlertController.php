<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class AlertController extends Controller
{
    /**
     * Feeds the Alerts page (3 sections). Adjusted to match the DB structure
     * we actually have:
     *  - normalActivity: sensor_data readings that are NOT alert-worthy
     *  - attackScenarios: rows from attack_scenarios
     *  - alertLog: rows from alerts (joined to the attack scenario + sensor
     *    that triggered them) — this replaces the old "Defense Activity"
     *    mock section, since there's no separate defense-log table.
     */
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
        $dangerWords = ['ATTACK', 'DANGER', 'ALARM', 'UNAUTHORIZED', 'ABNORMAL', 'FAKE', 'FORCED'];

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
            ->filter(function ($r) use ($dangerWords) {
                $v = strtoupper($r->value);
                foreach ($dangerWords as $w) {
                    if (str_contains($v, $w)) return false;
                }
                return true;
            });

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
        $rows = DB::table('attack_scenarios')
            ->orderByDesc('timestamp')
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
