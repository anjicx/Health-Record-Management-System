<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class HealthDataReport extends Model
{
    use HasFactory;

    protected $table = 'health_data_report'; // Eksplicitno definišemo ime tabele

    protected $fillable = ['report_id', 'health_data_id'];

    public function report()
    {
        return $this->belongsTo(Report::class, 'report_id');
    }

    public function healthData()
    {
        return $this->belongsTo(HealthData::class, 'health_data_id');
    }
}

