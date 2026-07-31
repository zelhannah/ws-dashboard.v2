<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Top summary cards: total zones / devices / sensors / active alerts.
     * Was previously hardcoded — now pulled straight from the DB.
     */
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

    /**
     * Everything else the Dashboard page needs: chart, latest alerts,
     * recent activity, per-zone status, and the last reading per sensor
     * for Office and Warehouse.
     */
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

    /** Sensor event count grouped by hour, for today. */
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

    /** Latest 6 raw sensor_data rows across both zones, as a generic activity feed. */
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
            ->limit(6)
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

        if (str_contains($v, 'ATTACK') && str_contains($v, 'BLOCK')) return 'green';
        if (str_contains($v, 'DEFENSE') || str_contains($v, 'BLOCKED')) return 'green';
        if (str_contains($v, 'SCENARIO')) return 'purple';
        if (str_contains($v, 'DANGER') || str_contains($v, 'FLOOD') || str_contains($v, 'SUPPRESS')) return 'red';
        if (str_contains($v, 'ABNORMAL') || str_contains($v, 'SPOOF') || str_contains($v, 'REPLAY')) return 'orange';

        return 'yellow';
    }

    private function dotColorFor(string $value): string
    {
        $v = strtoupper($value);

        if (str_contains($v, 'ABNORMAL') || str_contains($v, 'DANGER') || str_contains($v, 'ATTACK')) {
            return '#dc3545';
        }
        if (str_contains($v, 'WARNING') || str_contains($v, 'DETECTED') || str_contains($v, 'OPEN')) {
            return '#d48806';
        }
        if (str_contains($v, 'OFF')) {
            return '#6c757d';
        }

        return '#198754';
    }
}
