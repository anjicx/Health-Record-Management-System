use Illuminate\Database\Seeder;
use App\Models\HealthDataReport;

class HealthDataReportSeeder extends Seeder
{
    public function run()
    {
        HealthDataReport::factory()->count(50)->create();
    }
}
