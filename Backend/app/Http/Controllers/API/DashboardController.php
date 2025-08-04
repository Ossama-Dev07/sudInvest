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
 * Get Completed Declarations Count for Current Year
 * Returns simple count of completed declarations (DEPOSEE) for current year only
 */
public function getDeclarationsTermineesParPeriode()
{
    try {
        $currentYear = Carbon::now()->year;
        
        // Get completed declarations count (DEPOSEE status) - only the 4 main declaration types
        $allowedDeclarationTypes = ['État 9421', 'État 9000', 'État de Synthèse', 'Déclaration TP Optionnelle'];
        
        // Current year count
        $totalCurrentYear = DeclarationFiscal::where('statut_declaration', 'DEPOSEE')
            ->whereIn('type_declaration', $allowedDeclarationTypes)
            ->whereHas('historiqueFiscal', function($query) use ($currentYear) {
                $query->where('annee_fiscal', $currentYear);
            })
            ->count();

        // Previous year count for trend comparison
        $totalPreviousYear = DeclarationFiscal::where('statut_declaration', 'DEPOSEE')
            ->whereIn('type_declaration', $allowedDeclarationTypes)
            ->whereHas('historiqueFiscal', function($query) use ($currentYear) {
                $query->where('annee_fiscal', $currentYear - 1);
            })
            ->count();

        // Calculate yearly change
        $yearlyChange = $totalPreviousYear > 0 
            ? round((($totalCurrentYear - $totalPreviousYear) / $totalPreviousYear) * 100, 1)
            : ($totalCurrentYear > 0 ? 100 : 0);

        return response()->json([
            'status' => 'success',
            'data' => [
                'value' => $totalCurrentYear,
                'total' => $totalCurrentYear,
                'previous_year' => $totalPreviousYear,
                'change' => $yearlyChange,
                'trend' => $yearlyChange >= 0 ? 'up' : 'down',
                'formatted_change' => ($yearlyChange >= 0 ? '+' : '') . $yearlyChange . '%',
                'label' => 'Déclarations Terminées ' . $currentYear
            ]
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Erreur lors du calcul des déclarations terminées',
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
            $clientsCount = Client::whereYear('created_at', $currentYear)
                ->whereMonth('created_at', $month)
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
        $totalClientsPreviousYear = Client::whereYear('created_at', $previousYear)->count();
        
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
 * Get Recent Activities
 * Returns recent activities from all modules (clients, AGO, fiscal, juridique)
 * Combines activities from different models and returns them in chronological order
 */
    public function getActivitesRecentes()
    {
        try {
            $activities = collect();
            $limitPerType = 10; // Limit per activity type to avoid too many queries
            
            // 1. Recent Clients Added (last 7 days)
            $recentClients = Client::where('created_at', '>=', Carbon::now()->subDays(7))
                ->orderBy('created_at', 'desc')
                ->limit($limitPerType)
                ->get();
                
            foreach ($recentClients as $client) {
                $clientDisplay = $client->raisonSociale 
                    ? $client->raisonSociale 
                    : trim(($client->prenom_client ?? '') . ' ' . ($client->nom_client ?? ''));
                    
                $activities->push([
                    'id' => 'client_' . $client->id_client,
                    'type' => 'client',
                    'action' => 'Nouveau client ajouté',
                    'name' => $clientDisplay,
                    'time' => $this->getRelativeTime($client->created_at),
                    'status' => 'success',
                    'created_at' => $client->created_at,
                    'details' => [
                        'client_id' => $client->id_client,
                        'client_type' => $client->type,
                        'ice' => $client->ice
                    ]
                ]);
            }
            
            // 2. Recent AGO Activities (completed etapes or new AGOs)
            $recentAGOs = AGO::with(['client', 'etapes'])
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->orderBy('created_at', 'desc')
                ->limit($limitPerType)
                ->get();
                
            foreach ($recentAGOs as $ago) {
                $clientDisplay = $ago->client->raisonSociale 
                    ? $ago->client->raisonSociale 
                    : trim(($ago->client->prenom_client ?? '') . ' ' . ($ago->client->nom_client ?? ''));
                    
                // Check if AGO is completed (all etapes completed)
                $totalEtapes = $ago->etapes->count();
                $completedEtapes = $ago->etapes->where('statut', 'oui')->count();
                $isCompleted = $totalEtapes > 0 && $completedEtapes === $totalEtapes;
                
                $activities->push([
                    'id' => 'ago_' . $ago->id,
                    'type' => 'ago',
                    'action' => $isCompleted ? 'AGO terminée' : 'Nouvelle AGO créée',
                    'name' => $clientDisplay,
                    'time' => $this->getRelativeTime($ago->created_at),
                    'status' => $isCompleted ? 'success' : 'pending',
                    'created_at' => $ago->created_at,
                    'details' => [
                        'ago_id' => $ago->id,
                        'annee' => $ago->annee,
                        'completion_rate' => $totalEtapes > 0 ? round(($completedEtapes / $totalEtapes) * 100) : 0
                    ]
                ]);
            }
            
            // 3. Recent Completed AGO Etapes (last 7 days)
            $recentCompletedEtapes = EtapAgo::with(['ago.client'])
                ->where('statut', 'oui')
                ->where('updated_at', '>=', Carbon::now()->subDays(7))
                ->orderBy('updated_at', 'desc')
                ->limit($limitPerType)
                ->get();
                
            foreach ($recentCompletedEtapes as $etape) {
                if ($etape->ago && $etape->ago->client) {
                    $clientDisplay = $etape->ago->client->raisonSociale 
                        ? $etape->ago->client->raisonSociale 
                        : trim(($etape->ago->client->prenom_client ?? '') . ' ' . ($etape->ago->client->nom_client ?? ''));
                        
                    $activities->push([
                        'id' => 'etape_ago_' . $etape->id,
                        'type' => 'ago',
                        'action' => 'Étape AGO terminée',
                        'name' => $clientDisplay,
                        'time' => $this->getRelativeTime($etape->updated_at),
                        'status' => 'success',
                        'created_at' => $etape->updated_at,
                        'details' => [
                            'etape_nom' => $etape->nom_etape,
                            'ago_id' => $etape->ago_id
                        ]
                    ]);
                }
            }
            
            // 4. Recent Fiscal Activities (Declarations and Payments)
            $recentDeclarations = DeclarationFiscal::with(['historiqueFiscal.client'])
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->orderBy('created_at', 'desc')
                ->limit($limitPerType)
                ->get();
                
            foreach ($recentDeclarations as $declaration) {
                if ($declaration->historiqueFiscal && $declaration->historiqueFiscal->client) {
                    $client = $declaration->historiqueFiscal->client;
                    $clientDisplay = $client->raisonSociale 
                        ? $client->raisonSociale 
                        : trim(($client->prenom_client ?? '') . ' ' . ($client->nom_client ?? ''));
                        
                    $status = 'pending';
                    $action = 'Nouvelle déclaration fiscale';
                    
                    if ($declaration->statut_declaration === 'DEPOSEE') {
                        $status = 'success';
                        $action = 'Déclaration fiscale déposée';
                    } elseif ($declaration->statut_declaration === 'EN_RETARD') {
                        $status = 'warning';
                        $action = 'Déclaration fiscale en retard';
                    }
                    
                    $activities->push([
                        'id' => 'declaration_' . $declaration->id,
                        'type' => 'fiscal',
                        'action' => $action,
                        'name' => $clientDisplay,
                        'time' => $this->getRelativeTime($declaration->created_at),
                        'status' => $status,
                        'created_at' => $declaration->created_at,
                        'details' => [
                            'type_declaration' => $declaration->type_declaration,
                            'statut' => $declaration->statut_declaration,
                            'montant' => $declaration->montant
                        ]
                    ]);
                }
            }
            
            // 5. Recent Fiscal Payments
            $recentPaiements = PaiementFiscal::with(['historiqueFiscal.client'])
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->orderBy('created_at', 'desc')
                ->limit($limitPerType)
                ->get();
                
            foreach ($recentPaiements as $paiement) {
                if ($paiement->historiqueFiscal && $paiement->historiqueFiscal->client) {
                    $client = $paiement->historiqueFiscal->client;
                    $clientDisplay = $client->raisonSociale 
                        ? $client->raisonSociale 
                        : trim(($client->prenom_client ?? '') . ' ' . ($client->nom_client ?? ''));
                        
                    $status = $paiement->statut === 'PAYE' ? 'success' : 'pending';
                    $action = $paiement->statut === 'PAYE' ? 'Paiement fiscal effectué' : 'Nouveau paiement fiscal';
                    
                    $activities->push([
                        'id' => 'paiement_' . $paiement->id,
                        'type' => 'fiscal',
                        'action' => $action,
                        'name' => $clientDisplay,
                        'time' => $this->getRelativeTime($paiement->created_at),
                        'status' => $status,
                        'created_at' => $paiement->created_at,
                        'details' => [
                            'type_impot' => $paiement->type_impot,
                            'montant' => $paiement->montant,
                            'statut' => $paiement->statut
                        ]
                    ]);
                }
            }
            
            // 6. Recent Juridical Activities
            $recentJuridique = HistoriqueJuridique::with('client')
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->orderBy('created_at', 'desc')
                ->limit($limitPerType)
                ->get();
                
            foreach ($recentJuridique as $juridique) {
                if ($juridique->client) {
                    $clientDisplay = $juridique->client->raisonSociale 
                        ? $juridique->client->raisonSociale 
                        : trim(($juridique->client->prenom_client ?? '') . ' ' . ($juridique->client->nom_client ?? ''));
                        
                    $activities->push([
                        'id' => 'juridique_' . $juridique->id,
                        'type' => 'juridique',
                        'action' => 'Dossier juridique créé',
                        'name' => $clientDisplay,
                        'time' => $this->getRelativeTime($juridique->created_at),
                        'status' => 'info',
                        'created_at' => $juridique->created_at,
                        'details' => [
                            'objet_principal' => $juridique->objet_principal,
                            'type_dossier' => $juridique->type_dossier
                        ]
                    ]);
                }
            }
            
            // 7. Recent Completed Juridical Etapes
            $recentJuridiqueEtapes = \App\Models\Etapes_juridique::with(['historiqueJuridique.client'])
                ->where('statut', 'oui')
                ->where('updated_at', '>=', Carbon::now()->subDays(7))
                ->orderBy('updated_at', 'desc')
                ->limit($limitPerType)
                ->get();
                
            foreach ($recentJuridiqueEtapes as $etape) {
                if ($etape->historiqueJuridique && $etape->historiqueJuridique->client) {
                    $client = $etape->historiqueJuridique->client;
                    $clientDisplay = $client->raisonSociale 
                        ? $client->raisonSociale 
                        : trim(($client->prenom_client ?? '') . ' ' . ($client->nom_client ?? ''));
                        
                    $activities->push([
                        'id' => 'etape_juridique_' . $etape->id,
                        'type' => 'juridique',
                        'action' => 'Étape juridique terminée',
                        'name' => $clientDisplay,
                        'time' => $this->getRelativeTime($etape->updated_at),
                        'status' => 'success',
                        'created_at' => $etape->updated_at,
                        'details' => [
                            'nom_etape' => $etape->nom_etape,
                            'description' => $etape->description
                        ]
                    ]);
                }
            }
            
            // Sort all activities by creation date (most recent first) and limit to 20
            $sortedActivities = $activities->sortByDesc('created_at')->take(20)->values();
            
            // Calculate some statistics
            $totalActivities = $sortedActivities->count();
            $activitiesByType = $sortedActivities->groupBy('type')->map(function ($group) {
                return $group->count();
            });
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'activities' => $sortedActivities,
                    'statistics' => [
                        'total_count' => $totalActivities,
                        'by_type' => $activitiesByType,
                        'period' => 'last_7_days',
                        'generated_at' => Carbon::now()->toISOString()
                    ]
                ]
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des activités récentes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
 * Get Overdue Items for Dashboard
 * Returns incomplete legal files, overdue fiscal items, and overdue AGOs based on completion logic
 */
public function getElementsEnRetard()
{
    try {
        $currentYear = Carbon::now()->year;

        // 1. Dossiers Juridiques Incomplets (HJ)
        // Logic: ANY HistoriqueJuridique where not all etapes are completed (NO YEAR DEPENDENCY)
        $allHistoriqueJuridique = HistoriqueJuridique::with(['client', 'etapes'])->get();
        
        $dossiersJuridiquesIncomplets = $allHistoriqueJuridique->map(function($dossier) {
            $totalEtapes = $dossier->etapes->count();
            $etapesTerminees = $dossier->etapes->where('statut', 'oui')->count();
            $progression = $totalEtapes > 0 ? round(($etapesTerminees / $totalEtapes) * 100) : 0;
            
            // Include if not 100% complete (regardless of year)
            if ($progression < 100) {
                $clientDisplay = $dossier->client->raisonSociale 
                    ? $dossier->client->raisonSociale 
                    : trim(($dossier->client->prenom_client ?? '') . ' ' . ($dossier->client->nom_client ?? ''));
                    
                return [
                    'id' => $dossier->id,
                    'client' => $clientDisplay,
                    'objet' => $dossier->objet ?? 'Dossier juridique',
                    'progression' => $progression,
                    'total_etapes' => $totalEtapes,
                    'etapes_terminees' => $etapesTerminees,
                    'date_creation' => $dossier->created_at->format('d/m/Y'),
                    'date_modification' => $dossier->date_modification 
                        ? Carbon::parse($dossier->date_modification)->format('d/m/Y')
                        : null
                ];
            }
            return null;
        })
        ->filter()
        ->sortBy('progression') // Lowest progression first (most urgent)
        ->take(10)
        ->values();

        // 2. Historique Fiscal en Retard
        $historiqueFiscalRetard = collect();
        
        // Get HistoriqueFiscal records that are still "en cours" from previous years
        $historiqueFiscalEnCours = HistoriqueFiscal::with('client')
            ->where(function($query) {
                $query->where('statut_global', 'EN_COURS')
                      ->orWhere('statut_global', 'EN_RETARD');
            })
            ->where('annee_fiscal', '<', $currentYear) // Use annee_fiscal field for year filtering
            ->orderBy('annee_fiscal', 'asc')
            ->limit(15)
            ->get();
            
        foreach ($historiqueFiscalEnCours as $historique) {
            if ($historique->client) {
                $clientDisplay = $historique->client->raisonSociale 
                    ? $historique->client->raisonSociale 
                    : trim(($historique->client->prenom_client ?? '') . ' ' . ($historique->client->nom_client ?? ''));
                
                $anneesRetard = $currentYear - $historique->annee_fiscal;
                    
                $historiqueFiscalRetard->push([
                    'id' => $historique->id,
                    'type' => 'historique_fiscal',
                    'client' => $clientDisplay,
                    'objet' => 'Historique Fiscal ' . $historique->annee_fiscal,
                    'date_echeance' => $historique->datecreation 
                        ? Carbon::parse($historique->datecreation)->format('d/m/Y')
                        : 'Non définie',
                    'annee' => $historique->annee_fiscal,
                    'annees_retard' => $anneesRetard,
                    'statut' => $historique->statut_global,
                    'sort_date' => $historique->datecreation
                ]);
            }
        }
        
        // Sort fiscal items by years overdue (most overdue first) and take top 10
        $historiqueFiscalRetard = $historiqueFiscalRetard
            ->sortByDesc('annees_retard')
            ->take(10)
            ->values();

        // 3. AGO en Retard
        // Logic: AGO from previous years where decision_type is not completed (not all etapes finished)
        $agoEnRetard = AGO::with(['client', 'etapes'])
            ->where('annee', '<', $currentYear) // AGO from previous years
            ->get()
            ->map(function($ago) use ($currentYear) {
                $totalEtapes = $ago->etapes->count();
                $etapesTerminees = $ago->etapes->where('statut', 'oui')->count();
                $progression = $totalEtapes > 0 ? round(($etapesTerminees / $totalEtapes) * 100) : 0;
                
                // Only include if decision_type/etapes not completed (progression < 100%)
                if ($progression < 100) {
                    $clientDisplay = $ago->client->raisonSociale 
                        ? $ago->client->raisonSociale 
                        : trim(($ago->client->prenom_client ?? '') . ' ' . ($ago->client->nom_client ?? ''));
                    
                    $anneesRetard = $currentYear - $ago->annee;
                        
                    return [
                        'id' => $ago->id,
                        'client' => $clientDisplay,
                        'objet' => 'AGO ' . $ago->annee,
                        'date_echeance' => $ago->ago_date 
                            ? Carbon::parse($ago->ago_date)->format('d/m/Y')
                            : 'Non définie',
                        'annee' => $ago->annee,
                        'annees_retard' => $anneesRetard,
                        'progression' => $progression,
                        'total_etapes' => $totalEtapes,
                        'etapes_terminees' => $etapesTerminees,
                        'decision_type' => $ago->decision_type,
                        'statut' => $ago->statut ?? 'EN_COURS',
                        'sort_date' => $ago->ago_date
                    ];
                }
                return null;
            })
            ->filter()
            ->sortByDesc('annees_retard') // Most overdue years first
            ->take(10)
            ->values();

        // Calculate summary statistics
        $totalRetards = $dossiersJuridiquesIncomplets->count() + 
                       $historiqueFiscalRetard->count() + 
                       $agoEnRetard->count();

        // Calculate urgency levels
        $urgent = $historiqueFiscalRetard->where('annees_retard', '>', 1)->count() +
                 $agoEnRetard->where('annees_retard', '>', 1)->count() +
                 $dossiersJuridiquesIncomplets->where('progression', '<', 25)->count(); // HJ with very low progress
                 
        $critique = $historiqueFiscalRetard->where('annees_retard', '>', 2)->count() +
                   $agoEnRetard->where('annees_retard', '>', 2)->count() +
                   $dossiersJuridiquesIncomplets->where('progression', 0)->count(); // HJ with 0% progress

        // Get most critical items for alerts
        $mostUrgentFiscal = $historiqueFiscalRetard->sortByDesc('annees_retard')->first();
        $mostUrgentAgo = $agoEnRetard->sortByDesc('annees_retard')->first();
        $lowestProgressJuridique = $dossiersJuridiquesIncomplets->sortBy('progression')->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'historique_juridique' => $dossiersJuridiquesIncomplets,
                'historique_fiscal' => $historiqueFiscalRetard,
                'ago' => $agoEnRetard,
                'statistics' => [
                    'total_retards' => $totalRetards,
                    'juridique_count' => $dossiersJuridiquesIncomplets->count(),
                    'fiscal_count' => $historiqueFiscalRetard->count(),
                    'ago_count' => $agoEnRetard->count(),
                    'urgent_count' => $urgent, // Over 1 year overdue (for fiscal/ago) or <25% progress (for juridique)
                    'critique_count' => $critique, // Over 2 years overdue (for fiscal/ago) or 0% progress (for juridique)
                    'current_year' => $currentYear
                ],
                'summary' => [
                    'most_urgent_fiscal' => $mostUrgentFiscal,
                    'most_urgent_ago' => $mostUrgentAgo,
                    'lowest_progress_juridique' => $lowestProgressJuridique
                ],
                'alerts' => [
                    'total_urgent_items' => $urgent + $critique,
                    'requires_immediate_attention' => $critique,
                    'avg_juridique_completion' => $dossiersJuridiquesIncomplets->isNotEmpty() 
                        ? round($dossiersJuridiquesIncomplets->avg('progression'), 1) 
                        : 0,
                    'oldest_overdue_years' => max(
                        $agoEnRetard->max('annees_retard') ?? 0,
                        $historiqueFiscalRetard->max('annees_retard') ?? 0
                    ),
                    'juridique_zero_progress' => $dossiersJuridiquesIncomplets->where('progression', 0)->count()
                ]
            ]
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Erreur lors de la récupération des éléments en retard',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Helper method to calculate relative time
     * Converts timestamp to relative time format (e.g., "2 min", "1h", "2j")
     */
    private function getRelativeTime($datetime)
    {
        $now = Carbon::now();
        $time = Carbon::parse($datetime);
        
        $diffInMinutes = $now->diffInMinutes($time);
        $diffInHours = $now->diffInHours($time);
        $diffInDays = $now->diffInDays($time);
        
        if ($diffInMinutes < 60) {
            return $diffInMinutes . ' min';
        } elseif ($diffInHours < 24) {
            return $diffInHours . 'h';
        } elseif ($diffInDays < 7) {
            return $diffInDays . 'j';
        } else {
            return $time->format('d/m');
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