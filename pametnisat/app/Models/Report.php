<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Report extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'creationDate', 'creationTime', 'category'];
    protected $table = 'report'; // Eksplicitno definišemo ime tabele
    protected $casts = [
        'health_data_ids' => 'array',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function healthData()
    {
        return HealthData::whereIn('id', $this->health_data_ids ?? []);
    }

}

