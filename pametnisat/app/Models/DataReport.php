<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class DataReport extends Pivot
{
    use HasFactory;
    protected $table = 'data_report'; // Naziv tabele u bazi

    protected $fillable = [
        'health_data_id',
        'report_id',
    ];

    public $timestamps = true; // Pivot tabela ima timestamps

    public function healthData()
    {
        return $this->belongsTo(HealthData::class);
    }

    public function report()
    {
        return $this->belongsTo(Report::class);
    }
}
