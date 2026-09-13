<?php

namespace App\Http\Controllers;

use App\Support\SensorStatus;
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
            'securityTimeline'      => $this->securityTimeline(),
            'latestAlerts'    => $this->latestAlerts(),
            'recentActivity'  => $this->recentActivity(),
            'officeStatus'    => $this->zoneStatus('Office'),
            'warehouseStatus' => $this->zoneStatus('Warehouse'),
        ]);
    }

    private const TIMELINE_WINDOW_SECONDS = 600;
    private const TIMELINE_BUCKET_SECONDS = 60;

    private function securityTimeline(): array
    {
        $windowSeconds = self::TIMELINE_WINDOW_SECONDS; // 600 detik (10 menit)
        $bucketSeconds = self::TIMELINE_BUCKET_SECONDS; // 60 detik (1 menit)
        $bucketCount   = (int) ceil($windowSeconds / $bucketSeconds);

        // Titik awal adalah 10 menit yang lalu dari waktu saat ini
        $windowStart = now()->subMinutes($windowSeconds / 60);

        $rows = DB::table('sensor_data')
            ->where('timestamp', '>=', $windowStart)
            ->orderBy('timestamp')
            ->get(['value', 'timestamp']);

        $timeline = [];

        for ($b = 0; $b < $bucketCount; $b++) {
            // PERBAIKAN DI SINI: Gunakan addSeconds, bukan addMinutes!
            $bucketStart = $windowStart->copy()->addSeconds($b * $bucketSeconds);
            $bucketEnd   = $bucketStart->copy()->addSeconds($bucketSeconds);

            $bucketRows = $rows->filter(function ($r) use ($bucketStart, $bucketEnd) {
                $ts = strtotime($r->timestamp);
                return $ts >= $bucketStart->timestamp && $ts < $bucketEnd->timestamp;
            });

            // Set default ke 0 (Normal) agar otomatis kembali turun jika tidak ada serangan
            $level = 0;
            $scenario = null;

            if ($bucketRows->isNotEmpty()) {
                // Ambil level tertinggi/terparah dalam 1 menit tersebut
                $level = $bucketRows->max(fn ($r) => $this->levelFor($r->value));

                $scenarioRow = $bucketRows->first(fn ($r) => $this->scenarioLabel($r->value) !== null);
                if ($scenarioRow) {
                    $scenario = $this->scenarioLabel($scenarioRow->value);
                }
            }

            $timeline[] = [
                'time'     => $bucketStart->format('H:i'), // Format H:i agar lebih rapi di X-axis
                'level'    => $level,
                'status'   => $this->labelForLevel($level),
                'scenario' => $scenario,
            ];
        }

        return $timeline;
    }

    private function levelFor(string $value): int
    {
        return SensorStatus::level(SensorStatus::resolve($value));
    }
 
    private function labelForLevel(int $level): string
    {
        return match ($level) {
            2 => 'Danger',
            1 => 'Warning',
            default => 'Normal',
        };
    }

    private function scenarioLabel(string $value): ?string
    {
        if (preg_match('/SCENARIO[_\s]?(\d+)/i', $value, $m)) {
            return 'Scenario ' . $m[1];
        }

        return null;
    }

    
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
                DB::raw("COALESCE(zones.zone_name, 'Security') as area"),
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

        // Live status: worst severity among each sensor's most recent reading
        // in this zone. This is the exact same query shape SensorController
        // uses for the Monitoring page, so the two pages can never disagree
        // about whether the zone is currently NORMAL/WARNING/DANGER.
        $latestReadingPerSensor = DB::table('sensor_data')
            ->join('sensors', 'sensor_data.sensor_id', '=', 'sensors.sensor_id')
            ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
            ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
            ->where('zones.zone_name', $zoneName)
            ->select('sensors.sensor_id', 'sensor_data.value', 'sensor_data.timestamp')
            ->orderByDesc('sensor_data.timestamp')
            ->get()
            ->groupBy('sensor_id')
            ->map(fn ($rows) => $rows->first());

        $worstLevel = 0;
        foreach ($latestReadingPerSensor as $reading) {
            $worstLevel = max($worstLevel, $this->levelFor($reading->value));
        }

        // Active-alert count / description still come from the alerts log —
        // this is historical "how many logged events today", separate from
        // the live status above.
        $todayAlertCount = DB::table('alerts')
            ->join('sensors', 'alerts.sensor_id', '=', 'sensors.sensor_id')
            ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
            ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
            ->where('zones.zone_name', $zoneName)
            ->whereDate('alerts.timestamp', now()->toDateString())
            ->count();

        return [
            'status'       => match ($worstLevel) {
                2 => 'DANGER',
                1 => 'WARNING',
                default => 'NORMAL',
            },
            'sensors'      => $sensorCount,
            'activeAlerts' => $todayAlertCount,
            'description'  => $worstLevel > 0 ? 'Security event detected' : 'No security event',
        ];
    }

    private function badgeColorFor(string $alertType): string
    {
        $v = strtoupper($alertType);

        // Attack-scenario outcomes are special-cased first: "blocked/defended"
        // is a good outcome (green) and a bare scenario name is informational
        // (purple), regardless of what severity words also appear in it.
        if (str_contains($v, 'ATTACK') && str_contains($v, 'BLOCK')) {
            return 'green';
        }
        if (str_contains($v, 'DEFENSE') || str_contains($v, 'BLOCKED')) {
            return 'green';
        }
        if (str_contains($v, 'SCENARIO')) {
            return 'purple';
        }

        // Everything else — including raw sensor-triggered alerts — uses the
        // same severity classification as the rest of the dashboard, so a
        // "FORCED_OPEN" alert here is red for the same reason it's red on
        // the Monitoring page.
        return SensorStatus::colorForStatus(SensorStatus::resolve($alertType));
    }

    private function dotColorFor(string $value): string
    {
        return SensorStatus::dotColorForStatus(SensorStatus::resolve($value));
    }
}
