<?php

namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\HealthData;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportLineController extends Controller
{//RACUNA NA SVAKIH SAT PROSECNE VREDNOSTI PARAMETRA
    public function getReport(Request $request)
    {//parametar jer sve isto je i za calorie
        $period = $request->query('period', 'day');
        $startDate = $request->query('startDate'); // Datum iz React-a
        $start = $startDate ? Carbon::parse($startDate) : now()->startOfDay();
        $reportField = $request->query('field');

        // Definišemo dozvoljene vrednosti za field
        $allowedFields = ['steps', 'sleep_quality', 'heart_rate', 'stress_level'];//sql injection sprečen
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
        $countData = [];

        foreach ($data as $item) {
            $hour = Carbon::parse($item->timestamp)->format('H');
            $hourLabel = $hour . 'h';

            // Ako još nema podataka za taj sat, inicijalizuj
            if (!isset($groupedData[$hourLabel])) {
                $groupedData[$hourLabel] = 0;
                $countData[$hourLabel] = 0; // Brojač vrednosti
            }

            // Dodaj vrednost i povećaj brojač
            $groupedData[$hourLabel] += $item->value;
            $countData[$hourLabel] += 1;
        }

        // Kreiranje prosečnih vrednosti
        $allHours = [];
        for ($i = 0; $i < 24; $i++) {
            $label = str_pad($i, 2, '0', STR_PAD_LEFT) . 'h';

            // Ako postoje podaci za taj sat, izračunaj prosečnu vrednost
            if (isset($groupedData[$label])) {
                $avgValue = $groupedData[$label] / $countData[$label];
            } else {
                $avgValue = 0;
            }

            $allHours[] = [
                'label' => $label,
                'value' => $avgValue
            ];
        }

        return $allHours;
    }


    private function groupDataWeek($data, $startDate)
    {
        $groupedData = [];
        $countData = [];
        $daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Počinje od ponedeljka
        $startOfWeek = Carbon::parse($startDate)->startOfWeek();

        // Grupisanje podataka po danu i broj dana se računa
        foreach ($data as $item) {
            $dayIndex = Carbon::parse($item->timestamp)->dayOfWeekIso - 1; // 0 = ponedeljak
            $dayLabel = $daysOfWeek[$dayIndex];

            if (!isset($groupedData[$dayLabel])) {
                $groupedData[$dayLabel] = 0;
                $countData[$dayLabel] = 0; // Brojač podataka za taj dan
            }

            // Dodaj vrednost za dan
            $groupedData[$dayLabel] += $item->value;
            $countData[$dayLabel] += 1; // Povećaj brojač podataka za taj dan
        }

        // Kreiranje prosečnih vrednosti za svaki dan u nedelji
        $result = [];
        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);
            $dayLabel = $daysOfWeek[$i] . ' (' . $date->format('d.m.') . ')';

            // Prosečna vrednost za dan (ako postoji podatak za taj dan)
            if (isset($groupedData[$daysOfWeek[$i]])) {
                $avgValue = $groupedData[$daysOfWeek[$i]] / $countData[$daysOfWeek[$i]]; // Prosečna vrednost
            } else {
                $avgValue = 0;
            }

            // Dodavanje rezultata u listu obj ključ vr
            $result[] = [
                'label' => $dayLabel,
                'value' => $avgValue // Prosečna vrednost za taj dan
            ];
        }

        return $result;
    }
    private function groupDataMonth($data, $startDate)
    {
        $groupedData = [];
        $countData = []; // Za praćenje broja podataka po danu
        $startOfMonth = Carbon::parse($startDate)->startOfMonth();
        $daysInMonth = $startOfMonth->daysInMonth;

        // Inicijalizacija vrednosti za svaki dan u mesecu
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $groupedData[$day] = 0;
            $countData[$day] = 0; // Inicijalizacija brojača podataka za svaki dan
        }

        // Grupisanje podataka i brojanje vrednosti
        foreach ($data as $item) {
            $dayNumber = Carbon::parse($item->timestamp)->day;

            if ($dayNumber >= 1 && $dayNumber <= $daysInMonth) {
                $groupedData[$dayNumber] += $item->value; // Sabiranje vrednosti
                $countData[$dayNumber] += 1; // Brojanje broja podataka za taj dan
            }
        }

        // Računanje prosečnih vrednosti za svaki dan
        $result = [];
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = $startOfMonth->copy()->addDays($i - 1);

            // Ako postoji podatak za taj dan, računamo prosečnu vrednost
            if ($countData[$i] > 0) {
                $avgValue = $groupedData[$i] / $countData[$i]; // Prosečna vrednost za dan
            } else {
                $avgValue = 0; // Ako nema podataka, postavljamo prosečnu vrednost na 0
            }

            // Dodavanje rezultata u listu
            $result[] = [
                'label' => $date->format('d.m.'),
                'value' => $avgValue // Prosečna vrednost za dan
            ];
        }

        return $result;
    }

}
