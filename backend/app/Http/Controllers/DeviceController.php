<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class DeviceController extends Controller
{
    /** Feeds the Management -> Device tab. */
    public function index()
    {
        $devices = DB::table('devices')
            ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
            ->select(
                'devices.device_id',
                'devices.device_type',
                'devices.status',
                'zones.zone_name'
            )
            ->get();

        return $devices->map(function ($d) {
            $sensors = DB::table('sensors')
                ->where('device_id', $d->device_id)
                ->pluck('sensor_type');

            $lastSeen = DB::table('sensor_data')
                ->join('sensors', 'sensor_data.sensor_id', '=', 'sensors.sensor_id')
                ->where('sensors.device_id', $d->device_id)
                ->orderByDesc('sensor_data.timestamp')
                ->value('sensor_data.timestamp');

            return [
                'name'        => $d->device_type,
                'zone'        => $d->zone_name,
                'status'      => $d->status === 'Active' ? 'Online' : 'Offline',
                'sensorCount' => $sensors->count(),
                'sensors'     => $sensors->values()->all(),
                'lastSeen'    => $lastSeen ? date('Y-m-d H:i:s', strtotime($lastSeen)) : 'No data yet',
            ];
        })->values()->all();
    }
}
