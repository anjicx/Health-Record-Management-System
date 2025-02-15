<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class HealthDataReport extends Model
{
    use HasFactory;

    protected $table = 'health_data_report'; // Eksplicitno definišemo ime tabele

    protected $fillable = [
        'report_id',
        'health_data_id',
        'summary',
        'risk_level',
        'average_heart_rate',
        'max_heart_rate',
        'min_heart_rate',
        'average_bp',
        'spo2_trend',
        'steps_total',
        'calories_burned_total',
        'sleep_quality_avg',
        'stress_level_avg'
    ];
    

    public function report()
    {
        return $this->belongsTo(Report::class, 'report_id');
    }

    public function healthData()
    {
        return $this->belongsTo(HealthData::class, 'health_data_id');
    }
}

