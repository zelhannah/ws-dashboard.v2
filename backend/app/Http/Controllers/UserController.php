<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Feeds the Users page. Adjusted to match the real DB structure:
     *  - administrators: everyone in `users` (no status column exists yet,
     *    so we report everyone as Active)
     *  - warehouseAccess: `access_cards` joined to `users`, using expiry_status
     *    as the badge (Valid -> Active, anything else -> Blocked). Note: the
     *    access_cards table has no RFID UID column, only an auto-increment
     *    card_id, so that's what's shown as the "card" identifier.
     */
    public function index()
    {
        return response()->json([
            'administrators'  => $this->administrators(),
            'warehouseAccess' => $this->warehouseAccess(),
        ]);
    }

    private function administrators()
    {
        $rows = DB::table('users')
            ->select('user_id as id', 'name', 'email', 'role')
            ->get();

        return $rows->map(fn ($r) => [
            'id'     => $r->id,
            'name'   => $r->name,
            'email'  => $r->email,
            'role'   => $r->role,
            'status' => 'Active',
        ])->values()->all();
    }

    private function warehouseAccess()
    {
        $rows = DB::table('access_cards')
            ->join('users', 'access_cards.user_id', '=', 'users.user_id')
            ->select(
                'access_cards.card_id',
                'users.name',
                'users.email',
                'users.role',
                'access_cards.expiry_status'
            )
            ->get();

        return $rows->map(fn ($r) => [
            'name'   => $r->name,
            'email'  => $r->email,
            'card'   => 'CARD-' . str_pad((string) $r->card_id, 6, '0', STR_PAD_LEFT),
            'role'   => $r->role,
            'status' => strtolower($r->expiry_status) === 'valid' ? 'Active' : 'Blocked',
        ])->values()->all();
    }
}
