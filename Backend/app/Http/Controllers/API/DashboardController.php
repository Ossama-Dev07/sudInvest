<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\AGO;
use App\Models\EtapAgo;
use App\Models\HistoriqueJuridique;
use App\Models\Etapes_juridique;
use App\Models\HistoriqueFiscal;
use App\Models\PaiementFiscal;
use App\Models\DeclarationFiscal;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get Active Clients Count
     * Returns the total number of active clients
     */
  /**
 * Get Active Clients Count
 * Returns the total number of active clients
 */
public function getClientsActifs()
{
    try {
        $currentCount = Client::where('statut_client', 'actif')->count();
        
        // Calculate previous month for comparison
        $previousMonthCount = Client::where('statut_client', 'actif')
            ->where('created_at', '<', Carbon::now()->startOfMonth())
            ->count();
        
        $newClientsThisMonth = $currentCount - $previousMonthCount;
        $percentageChange = $previousMonthCount > 0 
            ? round(($newClientsThisMonth / $previousMonthCount) * 100, 1)
            : 100;
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'value' => $currentCount,
                'total' => $currentCount,
                'nouveaux_ce_mois' => $newClientsThisMonth,
                'change' => $percentageChange,
                'trend' => $percentageChange >= 0 ? 'up' : 'down',
                'formatted_change' => ($percentageChange >= 0 ? '+' : '') . $percentageChange . '%'
            ]
        ], 200);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Erreur lors du calcul des clients actifs',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get AGO Count for Current Year
 * Returns AGOs created this year with comparison to previous year
 */
public function getAGODuMois()
{
    try {
        $currentYear = Carbon::now()->year;
        $previousYear = Carbon::now()->subYear()->year;
        
        // AGOs created this year
        $agosCetteAnnee = AGO::whereYear('created_at', $currentYear)->count();
        
        // AGOs created previous year
        $agosAnneePrecedente = AGO::whereYear('created_at', $previousYear)->count();
        
        $percentageChange = $agosAnneePrecedente > 0 
            ? round((($agosCetteAnnee - $agosAnneePrecedente) / $agosAnneePrecedente) * 100, 1)
            : ($agosCetteAnnee > 0 ? 100 : 0);
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'value' => $agosCetteAnnee,
                'total' => $agosCetteAnnee,
                'agos_annee_precedente' => $agosAnneePrecedente,
                'change' => $percentageChange,
                'trend' => $percentageChange >= 0 ? 'up' : 'down',
                'formatted_change' => ($percentageChange >= 0 ? '+' : '') . $percentageChange . '%',
                'label' => 'AGO de l\'Année'
            ]
        ], 200);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Erreur lors du calcul des AGO de l\'année',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get Revenue Statistics
 * Returns total revenue and monthly revenue with calculations
 */
public function getRevenus()
{
    try {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        $previousMonth = Carbon::now()->subMonth();
        
        // Calculate total revenue (sum of all AGO amounts)
        $revenuTotal = AGO::sum(DB::raw('COALESCE(ran_amount, 0) + COALESCE(tpa_amount, 0) + COALESCE(dividendes_nets, 0)'));
        
        // Revenue for current month
        $revenuCeMois = AGO::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->sum(DB::raw('COALESCE(ran_amount, 0) + COALESCE(tpa_amount, 0) + COALESCE(dividendes_nets, 0)'));
        
        // Revenue for previous month
        $revenuMoisPrecedent = AGO::whereMonth('created_at', $previousMonth->month)
            ->whereYear('created_at', $previousMonth->year)
            ->sum(DB::raw('COALESCE(ran_amount, 0) + COALESCE(tpa_amount, 0) + COALESCE(dividendes_nets, 0)'));
        
        $percentageChange = $revenuMoisPrecedent > 0 
            ? round((($revenuCeMois - $revenuMoisPrecedent) / $revenuMoisPrecedent) * 100, 1)
            : ($revenuCeMois > 0 ? 100 : 0);
        
        // Format display values
        $totalInMillions = $revenuTotal >= 1000000 
            ? round($revenuTotal / 1000000, 2) . 'M'
            : round($revenuTotal / 1000, 0) . 'K';
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'value' => $totalInMillions,
                'total_display' => $totalInMillions,
                'total' => $revenuTotal,
                'mensuel' => $revenuCeMois,
                'change' => $percentageChange,
                'trend' => $percentageChange >= 0 ? 'up' : 'down',
                'formatted_change' => ($percentageChange >= 0 ? '+' : '') . $percentageChange . '%'
            ]
        ], 200);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Erreur lors du calcul des revenus',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get Task Completion Rate
 * Calculates completion rate based on AGO etapes, juridique etapes, and fiscal tasks
 */
public function getTauxCompletion()
{
    try {
        // 1. Count AGO etapes
        $totalEtapesAgo = \App\Models\EtapAgo::count();
        $etapesAgoTerminees = \App\Models\EtapAgo::where('statut', 'oui')->count();
        
        // 2. Count Juridique etapes
        $totalEtapesJuridique = \App\Models\Etapes_juridique::count();
        $etapesJuridiqueTerminees = \App\Models\Etapes_juridique::where('statut', 'oui')->count();
        
        // 3. Count Fiscal Paiements
        $totalPaiementsFiscaux = \App\Models\PaiementFiscal::count();
        $paiementsFiscauxTermines = \App\Models\PaiementFiscal::where('statut', 'PAYE')->count();
        
        // 4. Count Fiscal Declarations  
        $totalDeclarationsFiscales = \App\Models\DeclarationFiscal::count();
        $declarationsFiscalesTerminees = \App\Models\DeclarationFiscal::where('statut_declaration', 'DEPOSEE')->count();
        
        // Calculate totals
        $totalTaches = $totalEtapesAgo + $totalEtapesJuridique + $totalPaiementsFiscaux + $totalDeclarationsFiscales;
        $tachesTerminees = $etapesAgoTerminees + $etapesJuridiqueTerminees + $paiementsFiscauxTermines + $declarationsFiscalesTerminees;
        
        // Calculate completion rate as percentage
        $tauxCompletion = $totalTaches > 0 
            ? round(($tachesTerminees / $totalTaches) * 100, 1)
            : 0;
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'value' => $tauxCompletion . '%',
                'taux' => $tauxCompletion,
                'total_taches' => $totalTaches,
                'taches_terminees' => $tachesTerminees,
                'change' => 0, // Can be calculated if needed
                'trend' => 'up',
                'formatted_change' => '0%',
                
                // Breakdown by category
                'breakdown' => [
                    'ago_etapes' => [
                        'total' => $totalEtapesAgo,
                        'terminees' => $etapesAgoTerminees,
                        'pourcentage' => $totalEtapesAgo > 0 ? round(($etapesAgoTerminees / $totalEtapesAgo) * 100, 1) : 0
                    ],
                    'juridique_etapes' => [
                        'total' => $totalEtapesJuridique,
                        'terminees' => $etapesJuridiqueTerminees,
                        'pourcentage' => $totalEtapesJuridique > 0 ? round(($etapesJuridiqueTerminees / $totalEtapesJuridique) * 100, 1) : 0
                    ],
                    'fiscal_paiements' => [
                        'total' => $totalPaiementsFiscaux,
                        'termines' => $paiementsFiscauxTermines,
                        'pourcentage' => $totalPaiementsFiscaux > 0 ? round(($paiementsFiscauxTermines / $totalPaiementsFiscaux) * 100, 1) : 0
                    ],
                    'fiscal_declarations' => [
                        'total' => $totalDeclarationsFiscales,
                        'terminees' => $declarationsFiscalesTerminees,
                        'pourcentage' => $totalDeclarationsFiscales > 0 ? round(($declarationsFiscalesTerminees / $totalDeclarationsFiscales) * 100, 1) : 0
                    ]
                ]
            ]
        ], 200);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Erreur lors du calcul du taux de complétion',
            'error' => $e->getMessage()
        ], 500);
    }
}
    /**
     * Get All Dashboard Stats at Once
     * Combines all four stats in a single API call for efficiency
     */
    public function getTaskDistribution(): JsonResponse
    {
        try {
            // Get HistoriqueFiscal statistics
            $historiqueFiscalStats = $this->getHistoriqueFiscalStats();
            
            // Get AGO statistics
            $agoStats = $this->getAgoStats();
            
            // Combine and format the data
            $taskDistribution = [
                'historique_fiscal' => [
                    'name' => 'Historique Fiscal',
                    'data' => [
                        [
                            'name' => 'Terminées',
                            'value' => $historiqueFiscalStats['completed'],
                            'color' => '#22c55e',
                            'percentage' => $this->calculatePercentage($historiqueFiscalStats['completed'], $historiqueFiscalStats['total'])
                        ],
                        [
                            'name' => 'En cours',
                            'value' => $historiqueFiscalStats['in_progress'],
                            'color' => '#f59e0b',
                            'percentage' => $this->calculatePercentage($historiqueFiscalStats['in_progress'], $historiqueFiscalStats['total'])
                        ],
                        [
                            'name' => 'En retard',
                            'value' => $historiqueFiscalStats['overdue'],
                            'color' => '#ef4444',
                            'percentage' => $this->calculatePercentage($historiqueFiscalStats['overdue'], $historiqueFiscalStats['total'])
                        ]
                    ],
                    'total' => $historiqueFiscalStats['total']
                ],
                'ago' => [
                    'name' => 'AGO',
                    'data' => [
                        [
                            'name' => 'Terminées',
                            'value' => $agoStats['completed'],
                            'color' => '#22c55e',
                            'percentage' => $this->calculatePercentage($agoStats['completed'], $agoStats['total'])
                        ],
                        [
                            'name' => 'En cours',
                            'value' => $agoStats['in_progress'],
                            'color' => '#f59e0b',
                            'percentage' => $this->calculatePercentage($agoStats['in_progress'], $agoStats['total'])
                        ],
                        [
                            'name' => 'En retard',
                            'value' => $agoStats['not_started'],
                            'color' => '#ef4444',
                            'percentage' => $this->calculatePercentage($agoStats['not_started'], $agoStats['total'])
                        ]
                    ],
                    'total' => $agoStats['total']
                ],
                'combined' => [
                    'name' => 'Global',
                    'data' => [
                        [
                            'name' => 'Terminées',
                            'value' => $historiqueFiscalStats['completed'] + $agoStats['completed'],
                            'color' => '#22c55e',
                            'percentage' => $this->calculatePercentage(
                                $historiqueFiscalStats['completed'] + $agoStats['completed'],
                                $historiqueFiscalStats['total'] + $agoStats['total']
                            )
                        ],
                        [
                            'name' => 'En cours',
                            'value' => $historiqueFiscalStats['in_progress'] + $agoStats['in_progress'],
                            'color' => '#f59e0b',
                            'percentage' => $this->calculatePercentage(
                                $historiqueFiscalStats['in_progress'] + $agoStats['in_progress'],
                                $historiqueFiscalStats['total'] + $agoStats['total']
                            )
                        ],
                        [
                            'name' => 'En retard',
                            'value' => $historiqueFiscalStats['overdue'] + $agoStats['not_started'],
                            'color' => '#ef4444',
                            'percentage' => $this->calculatePercentage(
                                $historiqueFiscalStats['overdue'] + $agoStats['not_started'],
                                $historiqueFiscalStats['total'] + $agoStats['total']
                            )
                        ]
                    ],
                    'total' => $historiqueFiscalStats['total'] + $agoStats['total']
                ]
            ];

            return response()->json([
                'status' => 'success',
                'data' => $taskDistribution
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des données',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
 * Get Client Acquisition Data by Month
 * Returns monthly client acquisition for the current year (2025)
 */
public function getAcquisitionClients()
{
    try {
        $currentYear = Carbon::now()->year; // 2025
        
        // Initialize array with all months
        $monthlyData = [];
        $monthNames = [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr',
            5 => 'Mai', 6 => 'Jun', 7 => 'Jul', 8 => 'Aoû',
            9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'
        ];
        
        // Get clients count for each month of current year
        for ($month = 1; $month <= 12; $month++) {
            $clientsCount = Client::whereYear('date_collaboration', $currentYear)
                ->whereMonth('date_collaboration', $month)
                ->count();
                
            $monthlyData[] = [
                'month' => $monthNames[$month],
                'month_number' => $month,
                'clients' => $clientsCount
            ];
        }
        
        // Calculate statistics
        $totalClientsThisYear = array_sum(array_column($monthlyData, 'clients'));
        $averagePerMonth = $totalClientsThisYear > 0 ? round($totalClientsThisYear / 12, 1) : 0;
        
        // Get previous year data for comparison
        $previousYear = $currentYear - 1;
        $totalClientsPreviousYear = Client::whereYear('date_collaboration', $previousYear)->count();
        
        $yearlyPercentageChange = $totalClientsPreviousYear > 0 
            ? round((($totalClientsThisYear - $totalClientsPreviousYear) / $totalClientsPreviousYear) * 100, 1)
            : ($totalClientsThisYear > 0 ? 100 : 0);
        
        // Find peak month
        $peakMonth = collect($monthlyData)->sortByDesc('clients')->first();
        $currentMonth = Carbon::now()->month;
        $currentMonthData = $monthlyData[$currentMonth - 1]; // Array is 0-indexed
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'monthly_data' => $monthlyData,
                'statistics' => [
                    'total_this_year' => $totalClientsThisYear,
                    'average_per_month' => $averagePerMonth,
                    'yearly_trend' => $yearlyPercentageChange >= 0 ? 'up' : 'down',
                    'formatted_yearly_change' => ($yearlyPercentageChange >= 0 ? '+' : '') . $yearlyPercentageChange . '%',
                    'peak_month' => [
                        'month' => $peakMonth['month'],
                        'count' => $peakMonth['clients']
                    ],
                    'current_month' => [
                        'month' => $currentMonthData['month'],
                        'count' => $currentMonthData['clients']
                    ]
                ]
            ]
        ], 200);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Erreur lors de la récupération des données d\'acquisition de clients',
            'error' => $e->getMessage()
        ], 500);
    }
}
    /**
     * Get HistoriqueFiscal statistics based on statut_global
     *
     * @return array
     */
    private function getHistoriqueFiscalStats(): array
    {
        $total = HistoriqueFiscal::count();
        $completed = HistoriqueFiscal::where('statut_global', 'COMPLETE')->count();
        $inProgress = HistoriqueFiscal::where('statut_global', 'EN_COURS')->count();
        $overdue = HistoriqueFiscal::where('statut_global', 'EN_RETARD')->count();

        return [
            'total' => $total,
            'completed' => $completed,
            'in_progress' => $inProgress,
            'overdue' => $overdue
        ];
    }

    /**
     * Get AGO statistics based on etapes completion
     * Logic: 
     * - Completed: All etapes have statut = 'oui'
     * - In Progress: Some etapes have statut = 'oui', others = 'non'
     * - Not Started: All etapes have statut = 'non' or no etapes
     *
     * @return array
     */
    private function getAgoStats(): array
    {
        $agos = AGO::with('etapes')->get();
        
        $completed = 0;
        $inProgress = 0;
        $notStarted = 0;
        
        foreach ($agos as $ago) {
            $etapes = $ago->etapes;
            
            if ($etapes->isEmpty()) {
                // No etapes means not started
                $notStarted++;
            } else {
                $totalEtapes = $etapes->count();
                $completedEtapes = $etapes->where('statut', 'oui')->count();
                
                if ($completedEtapes === $totalEtapes) {
                    // All etapes completed
                    $completed++;
                } elseif ($completedEtapes > 0) {
                    // Some etapes completed
                    $inProgress++;
                } else {
                    // No etapes completed
                    $notStarted++;
                }
            }
        }

        return [
            'total' => $agos->count(),
            'completed' => $completed,
            'in_progress' => $inProgress,
            'not_started' => $notStarted
        ];
    }

    /**
     * Calculate percentage with proper handling of division by zero
     *
     * @param int $value
     * @param int $total
     * @return float
     */
    private function calculatePercentage(int $value, int $total): float
    {
        if ($total === 0) {
            return 0.0;
        }
        
        return round(($value / $total) * 100, 1);
    }

    /**
     * Get additional dashboard statistics
     * Can be used for other dashboard widgets
     *
     * @return JsonResponse
     */
   
}