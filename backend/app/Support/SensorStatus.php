<?php

namespace App\Support;

/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Before this change, the "is this reading normal/warning/danger?" logic was
 * copy-pasted (slightly differently each time) in four places:
 *   - SensorController::resolveStatus()   (Monitoring page badges)
 *   - DashboardController::levelFor()     (security timeline chart)
 *   - DashboardController::badgeColorFor()(Latest Alerts badge colors)
 *   - DashboardController::dotColorFor()  (Recent Activity dots)
 *   - AlertController::normalActivity()   (its own separate "danger words" list)
 * and again on the frontend in Dashboard.tsx (getPayloadClass()).
 *
 * Because the keyword lists had quietly drifted apart, the exact same raw
 * sensor value could show as "Danger" on one widget and "Normal" on another.
 * Everything below now calls into this one class, so there is exactly one
 * place left to update if a new sensor keyword needs to be classified.
 */
class SensorStatus
{
    private const DANGER = ['ATTACK', 'DANGER', 'ALARM', 'UNAUTHORIZED', 'ABNORMAL', 'FAKE', 'FORCED'];

    private const WARNING = ['WARNING', 'MOTION', 'OPEN', 'SCENARIO', 'SPOOFED', 'REPLAY', 'CONTINUOUS', 'DETECTED'];

    private const SUCCESS = ['NORMAL', 'SAFE', 'ONLINE', 'CLOSED', 'LOCKED', 'ACCEPTED', 'GRANTED', 'READY', 'ACTIVE', 'ON'];

    /**
     * Maps a raw sensor value/payload into: success | warning | danger | off | secondary.
     * This is byte-for-byte the same rule set SensorController used before, it
     * has just moved here so nobody else has to reimplement it.
     */
    public static function resolve(?string $value): string
    {
        $v = strtoupper((string) $value);

        if (str_contains($v, 'OFF')) {
            return 'off';
        }

        foreach (self::DANGER as $needle) {
            if (str_contains($v, $needle)) {
                return 'danger';
            }
        }

        foreach (self::WARNING as $needle) {
            if (str_contains($v, $needle)) {
                // "NO MOTION_DETECTED" / "NO OBJECT_DETECTED" are actually fine, not a warning.
                if (str_contains($v, 'NO ')) {
                    return 'success';
                }
                return 'warning';
            }
        }

        foreach (self::SUCCESS as $needle) {
            if (str_contains($v, $needle)) {
                return 'success';
            }
        }

        return 'secondary';
    }

    /** success/off/secondary -> 0, warning -> 1, danger -> 2 */
    public static function level(string $status): int
    {
        return match ($status) {
            'danger' => 2,
            'warning' => 1,
            default => 0,
        };
    }

    /** Badge color for a status, used wherever a red/orange/green/gray dot or badge is shown. */
    public static function colorForStatus(string $status): string
    {
        return match ($status) {
            'danger' => 'red',
            'warning' => 'orange',
            'off' => 'secondary',
            'success' => 'green',
            default => 'yellow',
        };
    }

    /** Hex dot color variant, used by the Recent Activity feed. */
    public static function dotColorForStatus(string $status): string
    {
        return match ($status) {
            'danger' => '#dc3545',
            'warning' => '#d48806',
            'off' => '#6c757d',
            default => '#198754',
        };
    }
}
