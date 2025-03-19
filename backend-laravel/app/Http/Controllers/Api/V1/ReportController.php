<?php

namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\HealthData;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function getReport(Request $request)
    {//parametar jer sve isto je i za calories
        $period = $request->query('period', 'day');
        $startDate = $request->query('startDate'); // Datum iz React-a
        $start = $startDate ? Carbon::parse($startDate) : now()->startOfDay();

        if ($period === 'week') {
            $start = $start->startOfWeek(); // Prikazuje celu nedelju
        } elseif ($period === 'month') {
            $start = $start->startOfMonth(); // Početak meseca
        }

        if ($period === 'week') {
            $report = HealthData::whereBetween('timestamp', [$start, $start->copy()->endOfWeek()])
                ->selectRaw('DATE(timestamp) as day, SUM(steps) as steps')
                ->groupBy('day')
                ->orderBy('day')
                ->get()
                ->map(fn($item) => [
                    'timestamp' => Carbon::parse($item->day)->timestamp,
                    'steps' => round($item->steps),
                ]);
        } elseif ($period === 'day') {
            $report = HealthData::whereBetween('timestamp', [$start, $start->copy()->endOfDay()])
                ->selectRaw('HOUR(timestamp) as hour, SUM(steps) as steps')
                ->groupBy('hour')
                ->orderBy('hour')
                ->get()
                ->map(fn($item) => [
                    'timestamp' => Carbon::now()->setHour($item->hour)->setMinute(0)->setSecond(0)->timestamp,
                    'steps' => $item->steps,
                ]);
        } else {//MESEC
            $report = HealthData::whereBetween('timestamp', [$start, $start->copy()->endOfMonth()])
                ->selectRaw('DATE(timestamp) as day, SUM(steps) as steps')
                ->groupBy('day')
                ->orderBy('day')
                ->get()
                ->map(fn($item) => [
                    'timestamp' => Carbon::parse($item->day)->timestamp,
                    'steps' => $item->steps,
                ]);
        }

        return response()->json($report);
    }







    public function index()
    {
        //
    }


    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }


    public function show(HealthData $healthData)
    {
        //
    }

    public function edit(HealthData $healthData)
    {
        //
    }


    public function update(Request $request, HealthData $healthData)
    {
        //
    }


    public function destroy(HealthData $healthData)
    {
        //
    }
}
