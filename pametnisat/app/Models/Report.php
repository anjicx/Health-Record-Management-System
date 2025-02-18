<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Report extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'creationDate', 'creationTime', 'category'];
    protected $table = 'report'; // Eksplicitno definišemo ime tabele
  
//odnosi se na 1korisnika
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relacija prema HealthData
    public function healthData()
    {
        return $this->belongsToMany(HealthData::class, 'data_report', 'report_id', 'health_data_id');
    }

}

