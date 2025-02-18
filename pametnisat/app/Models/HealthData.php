<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HealthData extends Model
{
    use HasFactory;
    public static $deviceTimestamps = [];


    protected $fillable = ['timestamp', 'heart_rate', 'systolic_bp', 'diastolic_bp', 'spo2', 'steps', 'calories_burned', 'sleep_quality', 'stress_level','device_id','user_id'];

    public function reports()
    {
        return $this->belongsToMany(Report::class, 'data_report', 'health_data_id', 'report_id')
                    ->withTimestamps(); // Prati kada je podatak dodat u report
    }

    public function device()
    {
        return $this->belongsTo(Device::class, 'device_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
}
