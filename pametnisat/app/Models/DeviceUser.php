<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceUser extends Model
{
    

    use HasFactory;

    protected $table = 'device_user';  // Eksplicitno definiraj ime tabele

    protected $fillable = [
        'device_id',
        'user_id',
        'started_at',
        'ended_at',
    ];

    // Relacija prema korisniku
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relacija prema uređaju
    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}

