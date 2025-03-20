<?php

namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\HealthData;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportCharController extends Controller
{
    //TRENUTNO CHAR JE KOD STEPS I CALORIES!
    public function getReport(Request $request)
    {//parametar jer sve isto je i za calories
        $period = $request->query('period');
        $startDate = $request->query('startDate'); // Datum iz React-a
        $start = $startDate ? Carbon::parse($startDate) : now()->startOfDay();//ako nema koristi današnji datum
        $reportField = $request->query('field');//koristi query za calories/steps itd

        // Definišemo dozvoljene vrednosti za field
        $allowedFields = ['steps', 'calories_burned', 'heart_rate'];//sql injection sprečen
        if (!in_array($reportField, $allowedFields)) {//ako polje nije odavde greška da bude
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
                ->select('timestamp', $reportField . ' as value')//' kod concat
                ->get();
            $report = $this->groupDataDay($data);

        }

        return response()->json($report);
    }




    private function groupDataDay($data)
    {
        $groupedData = [];

        foreach ($data as $item) {
            $hour = Carbon::parse($item->timestamp)->format('H');//H mi formatira od 00 do 23h
            $hourLabel = $hour . 'h';//labela za sat npr 23h

            if (!isset($groupedData[$hourLabel])) {//ako nema za taj h već podataka INICIJAL na 0
                $groupedData[$hourLabel] = 0;
            }
            //grupiše po satima jer je char grafikon pa od 23-23:59 se sabira kod 23h

            $groupedData[$hourLabel] += $item->value;
        }

        $allHours = [];//ključ(sat) vrednost(koliko ima podataka za taj sat)
        for ($i = 0; $i < 24; $i++) {//od 00 do 23h
            $label = str_pad($i, 2, '0', STR_PAD_LEFT) . 'h';
            $allHours[] = [//lista objekata ključ vrednost slična rečniku
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
        $startOfWeek = Carbon::parse($startDate)->startOfWeek();//početak sedmice
        foreach ($data as $item) {
            $dayIndex = Carbon::parse($item->timestamp)->dayOfWeekIso - 1; // 0 = ponedeljak
            $dayLabel = $daysOfWeek[$dayIndex];

            if (!isset($groupedData[$dayLabel])) {
                $groupedData[$dayLabel] = 0;
            }
            //isto kao za dane samo što se grupišu sati dana sabiraju koji pripadaju danu
            $groupedData[$dayLabel] += $item->value;
        }

        $result = [];
        for ($i = 0; $i < 7; $i++) {//prolaziš kroz 7d i na svaki 
            $date = $startOfWeek->copy()->addDays($i);//za datum kopiraš datum početne sedmice pa na njega dodaješ dane
            //ako ne copy menja početni objekat!
            $dayLabel = $daysOfWeek[$i] . ' (' . $date->format('d.m.') . ')';
            //ključ vrednost dan uk h za taj dan
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
        //broj dani u mesecu=ključ u re
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $groupedData[$day] = 0;
        }

        foreach ($data as $item) {
            $dayNumber = Carbon::parse($item->timestamp)->day;

            if ($dayNumber >= 1 && $dayNumber <= $daysInMonth) {//prođi kroz svaki dan u mesecu
                $groupedData[$dayNumber] += $item->value;//dodaj vr uk za dan
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


}
