<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Report extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'creationDate', 'creationTime', 'category'];
    protected $table = 'report'; // Eksplicitno definišemo ime tabele
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function healthData()
    {
        return $this->belongsToMany(HealthData::class, 'health_data_report', 'report_id', 'health_data_id');
    }
}

