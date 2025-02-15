use Illuminate\Database\Seeder;
use App\Models\HealthData;

class HealthDataSeeder extends Seeder
{
    public function run()
    {
        HealthData::factory()->count(30)->create();
    }
}

