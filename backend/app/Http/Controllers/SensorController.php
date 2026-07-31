<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class SensorController extends Controller
{
    public function office()
    {
        return $this->latestByZone('Office');
    }

    public function warehouse()
    {
        return $this->latestByZone('Warehouse');
    }

    public function officeHistory()
    {
        return $this->history('Office');
    }

    public function warehouseHistory()
    {
        return $this->history('Warehouse');
    }

    /** Last 10 raw readings (not deduped by sensor) — used for the activity log. */
    private function history(string $zoneName)
    {
        $rows = DB::table('sensor_data')
            ->join('sensors', 'sensor_data.sensor_id', '=', 'sensors.sensor_id')
            ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
            ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
            ->where('zones.zone_name', $zoneName)
            ->select(
                'sensor_data.data_id as id',
                'sensors.sensor_type as device',
                'sensor_data.value as status',
                'sensor_data.timestamp'
            )
            ->orderByDesc('sensor_data.timestamp')
            ->limit(10)
            ->get();

        return $rows->map(fn ($r) => [
            'id'     => $r->id,
            'time'   => date('H:i:s', strtotime($r->timestamp)),
            'device' => $r->device,
            'status' => $r->status,
            'color'  => $this->resolveStatus($r->status) === 'danger' || $this->resolveStatus($r->status) === 'warning'
                ? 'danger'
                : ($this->resolveStatus($r->status) === 'off' ? 'secondary' : 'success'),
        ])->values()->all();
    }

    private function latestByZone(string $zoneName)
    {
        return DB::table('sensor_data')
            ->join('sensors', 'sensor_data.sensor_id', '=', 'sensors.sensor_id')
            ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
            ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
            ->where('zones.zone_name', $zoneName)
            ->select(
                'sensors.sensor_type as label',
                'sensor_data.value as value',
                'sensor_data.timestamp'
            )
            ->orderByDesc('sensor_data.timestamp')
            ->get()
            ->groupBy('label')
            ->map(fn($items) => $items->first())
            ->values()
            ->map(function ($row) {
                $row->status = $this->resolveStatus($row->value);
                return $row;
            });
    }

    /**
     * Maps a raw sensor value/payload into a badge status the frontend
     * understands: success | warning | danger | secondary | off.
     */
    private function resolveStatus(?string $value): string
    {
        $v = strtoupper((string) $value);

        if (str_contains($v, 'OFF')) {
            return 'off';
        }

        $danger = ['ATTACK', 'DANGER', 'ALARM', 'UNAUTHORIZED', 'ABNORMAL', 'FAKE', 'FORCED'];
        foreach ($danger as $needle) {
            if (str_contains($v, $needle)) {
                return 'danger';
            }
        }

        $warning = ['WARNING', 'MOTION', 'OPEN', 'SCENARIO', 'SPOOFED', 'REPLAY', 'CONTINUOUS', 'DETECTED'];
        foreach ($warning as $needle) {
            if (str_contains($v, $needle)) {
                // "NO OBJECT DETECTED" / "NO MOTION" are actually fine, not a warning
                if (str_contains($v, 'NO ')) {
                    return 'success';
                }
                return 'warning';
            }
        }

        $success = ['NORMAL', 'SAFE', 'ONLINE', 'CLOSED', 'LOCKED', 'ACCEPTED', 'GRANTED', 'READY', 'ACTIVE', 'ON'];
        foreach ($success as $needle) {
            if (str_contains($v, $needle)) {
                return 'success';
            }
        }

        return 'secondary';
    }
}