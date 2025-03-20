<?php

namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\HealthData;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportLineController extends Controller
{//IZMENITI NA LINE DEO GRUPISANJE OVOGA
    public function getReport(Request $request)
    {//parametar jer sve isto je i za calories
        $period = $request->query('period', 'day');
        $startDate = $request->query('startDate'); // Datum iz React-a
        $start = $startDate ? Carbon::parse($startDate) : now()->startOfDay();
        $reportField = $request->query('field');

        // Definišemo dozvoljene vrednosti za field
        $allowedFields = ['steps', 'calories_burned', 'heart_rate'];//sql injection sprečen
        if (!in_array($reportField, $allowedFields)) {
            return response()->json(['error' => 'Invalid field'], 400);
        }
        if ($period === 'week') {
            $start = $start->startOfWeek(); // Prikazuje celu nedelju
            $data = HealthData::whereBetween('timestamp', [$start, $start->copy()->endOfWeek()])
                ->select('timestamp', $reportField . ' as value')
                ->get();
            $report = $this->groupDataWeek($data, $startDate);
        } elseif ($period === 'month') {
            $start = $start->startOfMonth(); // Početak meseca
            $data = HealthData::whereBetween('timestamp', [$start, $start->copy()->endOfMonth()])
                ->select('timestamp', $reportField . ' as value')
                ->get();
            $report = $this->groupDataMonth($data, $startDate);
        } else {
            $data = HealthData::whereBetween('timestamp', [$start, $start->copy()->endOfDay()])
                ->select('timestamp', $reportField . ' as value')
                ->get();
            $report = $this->groupDataDay($data);

        }

        return response()->json($report);
    }




    private function groupDataDay($data)
    {
        $groupedData = [];

        foreach ($data as $item) {
            $hour = Carbon::parse($item->timestamp)->format('H');
            $hourLabel = $hour . 'h';

            if (!isset($groupedData[$hourLabel])) {
                $groupedData[$hourLabel] = 0;
            }

            $groupedData[$hourLabel] += $item->value;
        }

        $allHours = [];
        for ($i = 0; $i < 24; $i++) {
            $label = str_pad($i, 2, '0', STR_PAD_LEFT) . 'h';
            $allHours[] = [
                'label' => $label,
                'value' => $groupedData[$label] ?? 0
            ];
        }

        return $allHours;
    }

    private function groupDataWeek($data, $startDate)
    {
        $groupedData = [];
        $daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Počinje od ponedeljka
        $startOfWeek = Carbon::parse($startDate)->startOfWeek();

        foreach ($data as $item) {
            $dayIndex = Carbon::parse($item->timestamp)->dayOfWeekIso - 1; // 0 = ponedeljak
            $dayLabel = $daysOfWeek[$dayIndex];

            if (!isset($groupedData[$dayLabel])) {
                $groupedData[$dayLabel] = 0;
            }

            $groupedData[$dayLabel] += $item->value;
        }

        $result = [];
        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);
            $dayLabel = $daysOfWeek[$i] . ' (' . $date->format('d.m.') . ')';

            $result[] = [
                'label' => $dayLabel,
                'value' => $groupedData[$daysOfWeek[$i]] ?? 0
            ];
        }

        return $result;
    }
    private function groupDataMonth($data, $startDate)
    {
        $groupedData = [];
        $startOfMonth = Carbon::parse($startDate)->startOfMonth();
        $daysInMonth = $startOfMonth->daysInMonth;

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $groupedData[$day] = 0;
        }

        foreach ($data as $item) {
            $dayNumber = Carbon::parse($item->timestamp)->day;

            if ($dayNumber >= 1 && $dayNumber <= $daysInMonth) {
                $groupedData[$dayNumber] += $item->value;
            }
        }

        $result = [];
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = $startOfMonth->copy()->addDays($i - 1);
            $result[] = [
                'label' => $date->format('d.m.'),
                'value' => $groupedData[$i] ?? 0
            ];
        }

        return $result;
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
