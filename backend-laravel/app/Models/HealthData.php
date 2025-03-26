<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HealthData extends Model
{
    use HasFactory;
    public static $deviceTimestamps = [];//uredjaj koje vreme poslednje azurirano za podatke 
    // od tog vremena da krene


    protected $fillable = ['timestamp', 'heart_rate', 'systolic_bp', 'diastolic_bp', 'steps', 'calories_burned', 'sleep_quality', 'stress_level', 'device_id', 'user_id'];



    public function device()
    {
        return $this->belongsTo(Device::class, 'device_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

}
