<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ZoneController extends Controller
{
    public function index()
    {
        $zones = DB::table('zones')->get();

        $result = $zones->map(function ($zone) {
            $deviceCount = DB::table('devices')->where('zone_id', $zone->zone_id)->count();
            $sensorCount = DB::table('sensors')
                ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
                ->where('devices.zone_id', $zone->zone_id)
                ->count();

            return [
                'zone_id'      => $zone->zone_id,
                'zone_name'    => $zone->zone_name,
                'description'  => $zone->description,
                'device_count' => $deviceCount,
                'sensor_count' => $sensorCount,
            ];
        });

        return response()->json($result->values());
    }
}