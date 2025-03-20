<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;
    protected $table = 'profile'; // Eksplicitno definišemo ime tabele

    protected $fillable = ['user_id', 'name', 'surname', 'age', 'height', 'weight'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
//age height weight