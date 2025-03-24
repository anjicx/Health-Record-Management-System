<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\HealthData;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BloodPressureController extends Controller
{
    public function getReport(Request $request)
    {
        $period = $request->query('period');
        $startDate = $request->query('startDate');
        $start = $startDate ? Carbon::parse($startDate) : now()->startOfDay();

        if ($period === 'week') {
            $start = $start->startOfWeek();
            $data = HealthData::whereBetween('timestamp', [$start, $start->copy()->endOfWeek()])
                ->select('timestamp', 'systolic_bp', 'diastolic_bp')
                ->get();
            $report = $this->groupDataWeek($data, $start);
        } elseif ($period === 'month') {
            $start = $start->startOfMonth();
            $data = HealthData::whereBetween('timestamp', [$start, $start->copy()->endOfMonth()])
                ->select('timestamp', 'systolic_bp', 'diastolic_bp')
                ->get();
            $report = $this->groupDataMonth($data, $start);
        } else {
            $data = HealthData::whereBetween('timestamp', [$start, $start->copy()->endOfDay()])
                ->select('timestamp', 'systolic_bp', 'diastolic_bp')
                ->get();
            $report = $this->groupDataDay($data);
        }

        return response()->json($report);
    }
    public function groupDataDay($data)
    {
        $groupedData = [];
        for ($i = 0; $i < 24; $i++) {
            $hourLabel = str_pad($i, 2, '0', STR_PAD_LEFT) . 'h';
            $groupedData[$hourLabel] = ['systolic' => 0, 'diastolic' => 0, 'count' => 0];
        }

        //sumiranje vr po satu
        foreach ($data as $item) {
            $hour = Carbon::parse($item->timestamp)->format('H') . 'h';
            if (isset($groupedData[$hour])) {
                $groupedData[$hour]['systolic'] += $item->systolic_bp;
                $groupedData[$hour]['diastolic'] += $item->diastolic_bp;
                $groupedData[$hour]['count']++;
            }
        }

        $result = [];
        foreach ($groupedData as $label => $values) {
            $avgSystolic = $values['count'] > 0 ? $values['systolic'] / $values['count'] : 0;
            $avgDiastolic = $values['count'] > 0 ? $values['diastolic'] / $values['count'] : 0;
            $displayLabel = in_array(substr($label, 0, 2), ["00", "06", "12", "18"]) ? $label : "";
            $result[] = [
                'label' => $displayLabel,
                'systolic' => $avgSystolic,
                'diastolic' => $avgDiastolic
            ];
        }
        return $result;
    }

    public function groupDataWeek($data, $start)
    {
        $daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        $groupedData = [];
        foreach ($daysOfWeek as $day) {
            $groupedData[$day] = ['systolic' => 0, 'diastolic' => 0, 'count' => 0];
        }

        foreach ($data as $item) {
            $dayAbbrev = Carbon::parse($item->timestamp)->format('D');
            if (isset($groupedData[$dayAbbrev])) {
                $groupedData[$dayAbbrev]['systolic'] += $item->systolic_bp;
                $groupedData[$dayAbbrev]['diastolic'] += $item->diastolic_bp;
                $groupedData[$dayAbbrev]['count']++;
            }
        }

        $result = [];
        foreach ($daysOfWeek as $index => $day) {
            $date = $start->copy()->addDays($index);
            $label = $day . " (" . $date->format('d.m.') . ")";
            $avgSystolic = $groupedData[$day]['count'] > 0 ? $groupedData[$day]['systolic'] / $groupedData[$day]['count'] : 0;
            $avgDiastolic = $groupedData[$day]['count'] > 0 ? $groupedData[$day]['diastolic'] / $groupedData[$day]['count'] : 0;
            $result[] = [
                'label' => $label,
                'systolic' => $avgSystolic,
                'diastolic' => $avgDiastolic
            ];
        }
        return $result;
    }

    public function groupDataMonth($data, $start)
    {
        $daysInMonth = $start->daysInMonth;
        $groupedData = [];
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $groupedData[$i] = ['systolic' => 0, 'diastolic' => 0, 'count' => 0];
        }

        foreach ($data as $item) {
            $day = Carbon::parse($item->timestamp)->day;
            if (isset($groupedData[$day])) {
                $groupedData[$day]['systolic'] += $item->systolic_bp;
                $groupedData[$day]['diastolic'] += $item->diastolic_bp;
                $groupedData[$day]['count']++;
            }
        }

        $result = [];
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = $start->copy()->addDays($i - 1);
            $label = $date->format('j.n');
            $avgSystolic = $groupedData[$i]['count'] > 0 ? $groupedData[$i]['systolic'] / $groupedData[$i]['count'] : 0;
            $avgDiastolic = $groupedData[$i]['count'] > 0 ? $groupedData[$i]['diastolic'] / $groupedData[$i]['count'] : 0;
            $result[] = [
                'label' => $label,
                'systolic' => $avgSystolic,
                'diastolic' => $avgDiastolic
            ];
        }
        return $result;
    }
}
