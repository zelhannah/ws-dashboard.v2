<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where(
            'email',
            $request->email
        )->first();

        if (!$user) {

            return response()->json([
                'success' => false,
                'message' => 'Email not found'
            ], 401);

        }

        // password di DB sudah di-hash (bcrypt), jadi harus dicek pakai Hash::check,
        // bukan dibandingkan langsung (itu penyebab login selalu gagal sebelumnya)
        if (!Hash::check($request->password, $user->password)) {

            return response()->json([
                'success' => false,
                'message' => 'Invalid password'
            ], 401);

        }

        DB::table('user_activity_logs')->insert([
            'user_id' => $user->user_id,
            'action_type' => $user->name . ' login',
            'timestamp' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        $userId = $request->user_id;

        $user = User::where(
            'user_id',
            $userId
        )->first();

        if ($user) {

            DB::table('user_activity_logs')->insert([
                'user_id' => $user->user_id,
                'action_type' => $user->name . ' logout',
                'timestamp' => now()
            ]);

        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ], 200);
    }
}