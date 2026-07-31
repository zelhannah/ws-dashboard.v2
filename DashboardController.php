<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /* total zones / devices / sensors / active alerts. */
    public function summary()
    {
        return response()->json([
            'zone'   => DB::table('zones')->count(),
            'device' => DB::table('devices')->count(),
            'sensor' => DB::table('sensors')->count(),
            'alert'  => DB::table('alerts')
                ->whereDate('timestamp', now()->toDateString())
                ->count(),
        ]);
    }


    public function overview()
    {
        return response()->json([
            'hourlyData'      => $this->hourlyActivity(),
            'latestAlerts'    => $this->latestAlerts(),
            'recentActivity'  => $this->recentActivity(),
            'officeStatus'    => $this->zoneStatus('Office'),
            'warehouseStatus' => $this->zoneStatus('Warehouse'),
        ]);
    }

    /** Sensor event count grouped by hour, today */
    private function hourlyActivity(): array
    {
        $rows = DB::table('sensor_data')
            ->whereDate('timestamp', now()->toDateString())
            ->selectRaw("DATE_FORMAT(timestamp, '%H') as hour, COUNT(*) as count")
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        return $rows->map(fn ($r) => [
            'hour'  => $r->hour,
            'count' => (int) $r->count,
        ])->values()->all();
    }

    /** Latest 6 alerts, newest first, joined with sensor + zone info. */
    private function latestAlerts(): array
    {
        $rows = DB::table('alerts')
            ->leftJoin('sensors', 'alerts.sensor_id', '=', 'sensors.sensor_id')
            ->leftJoin('devices', 'sensors.device_id', '=', 'devices.device_id')
            ->leftJoin('zones', 'devices.zone_id', '=', 'zones.zone_id')
            ->select(
                'alerts.alert_id as id',
                'alerts.alert_type as badge',
                DB::raw("COALESCE(sensors.sensor_type, 'Security') as sensor"),
                DB::raw("COALESCE(zones.zone_name, 'Unknown') as area"),
                'alerts.timestamp'
            )
            ->orderByDesc('alerts.timestamp')
            ->limit(6)
            ->get();

        return $rows->map(fn ($r) => [
            'id'         => $r->id,
            'badge'      => $r->badge,
            'badgeColor' => $this->badgeColorFor($r->badge),
            'sensor'     => $r->sensor,
            'area'       => $r->area,
            'time'       => date('H:i:s', strtotime($r->timestamp)),
        ])->values()->all();
    }

    /** Latest sensor_data rows across both zones */
    private function recentActivity(): array
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
            ->limit(10)
            ->get();

        return $rows->map(fn ($r) => [
            'id'    => $r->id,
            'dot'   => $this->dotColorFor($r->value),
            'label' => "{$r->value} on {$r->sensor_type}",
            'sub'   => "{$r->zone_name} Area",
            'time'  => date('H:i:s', strtotime($r->timestamp)),
        ])->values()->all();
    }

    /** Sensor count + active-alert count + a NORMAL/WARNING/DANGER status for one zone. */
    private function zoneStatus(string $zoneName): array
    {
        $sensorCount = DB::table('sensors')
            ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
            ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
            ->where('zones.zone_name', $zoneName)
            ->count();

        $todayAlerts = DB::table('alerts')
            ->join('sensors', 'alerts.sensor_id', '=', 'sensors.sensor_id')
            ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
            ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
            ->where('zones.zone_name', $zoneName)
            ->whereDate('alerts.timestamp', now()->toDateString())
            ->pluck('alerts.alert_type');

        $status = 'NORMAL';
        foreach ($todayAlerts as $type) {
            if ($this->badgeColorFor($type) === 'red') {
                $status = 'DANGER';
                break;
            }
            if ($this->badgeColorFor($type) === 'orange') {
                $status = 'WARNING';
            }
        }

        return [
            'status'       => $status,
            'sensors'      => $sensorCount,
            'activeAlerts' => $todayAlerts->count(),
            'description'  => $todayAlerts->isEmpty() ? 'No security event' : 'Security event detected',
        ];
    }

    private function badgeColorFor(string $alertType): string
    {
        $v = strtoupper($alertType);
        $color = 'yellow';

        if (str_contains($v, 'ATTACK') && str_contains($v, 'BLOCK')) {
            $color = 'green';
        } elseif (str_contains($v, 'DEFENSE') || str_contains($v, 'BLOCKED')) {
            $color = 'green';
        } elseif (str_contains($v, 'SCENARIO')) {
            $color = 'purple';
        } elseif (str_contains($v, 'DANGER') || str_contains($v, 'FLOOD') || str_contains($v, 'SUPPRESS')) {
            $color = 'red';
        } elseif (str_contains($v, 'ABNORMAL') || str_contains($v, 'SPOOF') || str_contains($v, 'REPLAY')) {
            $color = 'orange';
        }

        return $color;
    }

    private function dotColorFor(string $value): string
    {
        $v = strtoupper($value);
        $color = '#198754';

        if (str_contains($v, 'ABNORMAL') || str_contains($v, 'DANGER') || str_contains($v, 'ATTACK')) {
            $color = '#dc3545';
        } elseif (str_contains($v, 'WARNING') || str_contains($v, 'DETECTED') || str_contains($v, 'OPEN')) {
            $color = '#d48806';
        } elseif (str_contains($v, 'OFF')) {
            $color = '#6c757d';
        }

        return $color;
    }
}
