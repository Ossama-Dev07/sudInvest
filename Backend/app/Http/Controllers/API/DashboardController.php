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

class DashboardController extends Controller
{
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
                    'total_clients_actifs' => $currentCount,
                    'nouveaux_ce_mois' => $newClientsThisMonth,
                    'pourcentage_changement' => $percentageChange,
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
            
            // AGOs completed this year (all etapes completed)
            $agosTerminees = AGO::whereYear('created_at', $currentYear)
                ->whereDoesntHave('etapes', function($query) {
                    $query->where('statut', 'non');
                })
                ->whereHas('etapes') // Make sure it has etapes
                ->count();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'agos_cette_annee' => $agosCetteAnnee,
                    'agos_annee_precedente' => $agosAnneePrecedente,
                    'agos_terminees' => $agosTerminees,
                    'pourcentage_changement' => $percentageChange,
                    'trend' => $percentageChange >= 0 ? 'up' : 'down',
                    'formatted_change' => ($percentageChange >= 0 ? '+' : '') . $percentageChange . '%'
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
            
            // Format currency in MAD
            $formattedTotal = number_format($revenuTotal, 0, ',', ' ') . ' MAD';
            $formattedMensuel = number_format($revenuCeMois, 0, ',', ' ') . ' MAD';
            
            // Convert to millions for display if needed
            $totalInMillions = $revenuTotal >= 1000000 
                ? round($revenuTotal / 1000000, 2) . 'M'
                : round($revenuTotal / 1000, 0) . 'K';
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'revenu_total' => $revenuTotal,
                    'revenu_total_formate' => $formattedTotal,
                    'revenu_total_display' => $totalInMillions,
                    'revenu_mensuel' => $revenuCeMois,
                    'revenu_mensuel_formate' => $formattedMensuel,
                    'revenu_mois_precedent' => $revenuMoisPrecedent,
                    'pourcentage_changement' => $percentageChange,
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
            // Import required models at the top of the file
            // use App\Models\Etapes_juridique;
            // use App\Models\PaiementFiscal;
            // use App\Models\DeclarationFiscal;
            
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
            
            // Previous period comparison (last 30 days vs current period)
            $previousPeriod = Carbon::now()->subDays(30);
            
            // Get previous period counts (tasks created before 30 days ago)
            $totalEtapesAgoPrecedentes = \App\Models\EtapAgo::whereHas('ago', function($query) use ($previousPeriod) {
                $query->where('created_at', '<=', $previousPeriod);
            })->count();
            
            $etapesAgoTermineesPrecedentes = \App\Models\EtapAgo::where('statut', 'oui')
                ->whereHas('ago', function($query) use ($previousPeriod) {
                    $query->where('created_at', '<=', $previousPeriod);
                })->count();
            
            $totalEtapesJuridiquePrecedentes = \App\Models\Etapes_juridique::whereHas('historiqueJuridique', function($query) use ($previousPeriod) {
                $query->where('created_at', '<=', $previousPeriod);
            })->count();
            
            $etapesJuridiqueTermineesPrecedentes = \App\Models\Etapes_juridique::where('statut', 'oui')
                ->whereHas('historiqueJuridique', function($query) use ($previousPeriod) {
                    $query->where('created_at', '<=', $previousPeriod);
                })->count();
            
            $totalPaiementsFiscauxPrecedents = \App\Models\PaiementFiscal::whereHas('historiqueFiscal', function($query) use ($previousPeriod) {
                $query->where('created_at', '<=', $previousPeriod);
            })->count();
            
            $paiementsFiscauxTerminesPrecedents = \App\Models\PaiementFiscal::where('statut', 'PAYE')
                ->whereHas('historiqueFiscal', function($query) use ($previousPeriod) {
                    $query->where('created_at', '<=', $previousPeriod);
                })->count();
            
            $totalDeclarationsFiscalesPrecedentes = \App\Models\DeclarationFiscal::whereHas('historiqueFiscal', function($query) use ($previousPeriod) {
                $query->where('created_at', '<=', $previousPeriod);
            })->count();
            
            $declarationsFiscalesTermineesPrecedentes = \App\Models\DeclarationFiscal::where('statut_declaration', 'DEPOSEE')
                ->whereHas('historiqueFiscal', function($query) use ($previousPeriod) {
                    $query->where('created_at', '<=', $previousPeriod);
                })->count();
            
            $totalTachesPrecedentes = $totalEtapesAgoPrecedentes + $totalEtapesJuridiquePrecedentes + $totalPaiementsFiscauxPrecedents + $totalDeclarationsFiscalesPrecedentes;
            $tachesTermineesPrecedentes = $etapesAgoTermineesPrecedentes + $etapesJuridiqueTermineesPrecedentes + $paiementsFiscauxTerminesPrecedents + $declarationsFiscalesTermineesPrecedentes;
            
            $tauxPrecedent = $totalTachesPrecedentes > 0 
                ? round(($tachesTermineesPrecedentes / $totalTachesPrecedentes) * 100, 1)
                : 0;
            
            $changementTaux = $tauxCompletion - $tauxPrecedent;
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'taux_completion' => $tauxCompletion,
                    'taux_precedent' => $tauxPrecedent,
                    'changement_taux' => $changementTaux,
                    'total_taches' => $totalTaches,
                    'taches_terminees' => $tachesTerminees,
                    'taches_en_cours' => $totalTaches - $tachesTerminees,
                    
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
                    ],
                    
                    'trend' => $changementTaux >= 0 ? 'up' : 'down',
                    'formatted_change' => ($changementTaux >= 0 ? '+' : '') . $changementTaux . '%'
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
    public function getDashboardStats()
    {
        try {
            $currentMonth = Carbon::now()->month;
            $currentYear = Carbon::now()->year;
            $previousMonth = Carbon::now()->subMonth();
            $previousYear = Carbon::now()->subYear()->year;
            
            // Calculate all stats in one go for efficiency
            
            // 1. Clients Actifs
            $totalClientsActifs = Client::where('statut_client', 'actif')->count();
            $previousMonthClients = Client::where('statut_client', 'actif')
                ->where('created_at', '<', Carbon::now()->startOfMonth())
                ->count();
            $newClientsThisMonth = $totalClientsActifs - $previousMonthClients;
            $clientsPercentageChange = $previousMonthClients > 0 
                ? round(($newClientsThisMonth / $previousMonthClients) * 100, 1)
                : 100;
            
            // 2. AGO de l'Année (changed from month to year)
            $agosCetteAnnee = AGO::whereYear('created_at', $currentYear)->count();
            $agosAnneePrecedente = AGO::whereYear('created_at', $previousYear)->count();
            $agosPercentageChange = $agosAnneePrecedente > 0 
                ? round((($agosCetteAnnee - $agosAnneePrecedente) / $agosAnneePrecedente) * 100, 1)
                : ($agosCetteAnnee > 0 ? 100 : 0);
            
            // 3. Revenus
            $revenuTotal = AGO::sum(DB::raw('COALESCE(ran_amount, 0) + COALESCE(tpa_amount, 0) + COALESCE(dividendes_nets, 0)'));
            $revenuCeMois = AGO::whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->sum(DB::raw('COALESCE(ran_amount, 0) + COALESCE(tpa_amount, 0) + COALESCE(dividendes_nets, 0)'));
            $revenuMoisPrecedent = AGO::whereMonth('created_at', $previousMonth->month)
                ->whereYear('created_at', $previousMonth->year)
                ->sum(DB::raw('COALESCE(ran_amount, 0) + COALESCE(tpa_amount, 0) + COALESCE(dividendes_nets, 0)'));
            $revenusPercentageChange = $revenuMoisPrecedent > 0 
                ? round((($revenuCeMois - $revenuMoisPrecedent) / $revenuMoisPrecedent) * 100, 1)
                : ($revenuCeMois > 0 ? 100 : 0);
            
            // 4. Taux Completion (updated to include all task types)
            // Count all task types
            $totalEtapesAgo = EtapAgo::count();
            $etapesAgoTerminees = EtapAgo::where('statut', 'oui')->count();
            
            $totalEtapesJuridique = Etapes_juridique::count();
            $etapesJuridiqueTerminees = Etapes_juridique::where('statut', 'oui')->count();
            
            $totalPaiementsFiscaux = PaiementFiscal::count();
            $paiementsFiscauxTermines = PaiementFiscal::where('statut', 'PAYE')->count();
            
            $totalDeclarationsFiscales = DeclarationFiscal::count();
            $declarationsFiscalesTerminees = DeclarationFiscal::where('statut_declaration', 'DEPOSEE')->count();
            
            $totalTaches = $totalEtapesAgo + $totalEtapesJuridique + $totalPaiementsFiscaux + $totalDeclarationsFiscales;
            $tachesTerminees = $etapesAgoTerminees + $etapesJuridiqueTerminees + $paiementsFiscauxTermines + $declarationsFiscalesTerminees;
            
            $tauxCompletion = $totalTaches > 0 
                ? round(($tachesTerminees / $totalTaches) * 100, 1)
                : 0;
            
            // Format display values
            $totalInMillions = $revenuTotal >= 1000000 
                ? round($revenuTotal / 1000000, 2) . 'M'
                : round($revenuTotal / 1000, 0) . 'K';
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'clients_actifs' => [
                        'total' => $totalClientsActifs,
                        'value' => $totalClientsActifs,
                        'change' => $clientsPercentageChange,
                        'formatted_change' => ($clientsPercentageChange >= 0 ? '+' : '') . $clientsPercentageChange . '%',
                        'trend' => $clientsPercentageChange >= 0 ? 'up' : 'down'
                    ],
                    'ago_du_mois' => [
                        'total' => $agosCetteAnnee,
                        'value' => $agosCetteAnnee,
                        'change' => $agosPercentageChange,
                        'formatted_change' => ($agosPercentageChange >= 0 ? '+' : '') . $agosPercentageChange . '%',
                        'trend' => $agosPercentageChange >= 0 ? 'up' : 'down',
                        'label' => 'AGO de l\'Année' // Updated label
                    ],
                    'revenus' => [
                        'total' => $revenuTotal,
                        'total_display' => $totalInMillions,
                        'value' => $totalInMillions,
                        'mensuel' => $revenuCeMois,
                        'change' => $revenusPercentageChange,
                        'formatted_change' => ($revenusPercentageChange >= 0 ? '+' : '') . $revenusPercentageChange . '%',
                        'trend' => $revenusPercentageChange >= 0 ? 'up' : 'down'
                    ],
                    'taux_completion' => [
                        'taux' => $tauxCompletion,
                        'value' => $tauxCompletion . '%',
                        'total_taches' => $totalTaches,
                        'taches_terminees' => $tachesTerminees,
                        'change' => 0, // Can be calculated if needed
                        'formatted_change' => '0%',
                        'trend' => 'up',
                        // Detailed breakdown
                        'breakdown' => [
                            'ago_etapes' => [
                                'total' => $totalEtapesAgo,
                                'terminees' => $etapesAgoTerminees
                            ],
                            'juridique_etapes' => [
                                'total' => $totalEtapesJuridique,
                                'terminees' => $etapesJuridiqueTerminees
                            ],
                            'fiscal_paiements' => [
                                'total' => $totalPaiementsFiscaux,
                                'termines' => $paiementsFiscauxTermines
                            ],
                            'fiscal_declarations' => [
                                'total' => $totalDeclarationsFiscales,
                                'terminees' => $declarationsFiscalesTerminees
                            ]
                        ]
                    ],
                    'updated_at' => Carbon::now()->toISOString()
                ]
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des statistiques du tableau de bord',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}