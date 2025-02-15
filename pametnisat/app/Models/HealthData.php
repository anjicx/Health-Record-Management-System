<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HealthData extends Model
{
    use HasFactory;

    protected $fillable = ['timestamp', 'heart_rate', 'systolic_bp', 'diastolic_bp', 'spo2', 'steps', 'calories_burned', 'sleep_quality', 'stress_level'];

    public function reports()
    {
        return $this->belongsToMany(Report::class, 'health_data_report', 'health_data_id', 'report_id');
    }
}
