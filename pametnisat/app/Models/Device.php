<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'type'];
    protected $table = 'device'; // Eksplicitno definišemo ime tabele

    public function healthData()
    {
        return $this->hasMany(HealthData::class);
    }
    
}
