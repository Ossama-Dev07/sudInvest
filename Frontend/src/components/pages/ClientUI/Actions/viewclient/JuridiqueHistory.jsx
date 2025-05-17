import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useHistoriqueJuridiqueStore from "@/store/HistoriqueJuridiqueStore";
import { Calendar, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import AjouterHistorique from "./AjouterHistorique";

const Juridique = ({ idClient }) => {
  const { getHistoriqueByClientId, loading, historiques } = useHistoriqueJuridiqueStore();
  const [clientHistoriques, setClientHistoriques] = useState([]);

  // Sync local state with store and filter by client
  useEffect(() => {
    const filtered = historiques.filter(h => h.id_client == idClient);
    setClientHistoriques(filtered);
  }, [historiques, idClient]);

  // Initial data load
  useEffect(() => {
    const fetchData = async () => {
      if (idClient) {
        try {
          await getHistoriqueByClientId(idClient);
        } catch (error) {
          console.error("Error fetching historiques:", error);
        }
      }
    };
    fetchData();
  }, [idClient, getHistoriqueByClientId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading && clientHistoriques.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Historique Juridique</h2>
        <AjouterHistorique />
      </div>

      {clientHistoriques.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-gray-500">
            Aucun historique juridique disponible
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientHistoriques.map((item) => (
            <Card
              key={item.id}
              className="p-6 hover:shadow-md transition-shadow flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-lg">{item.objet}</h3>
                  <Badge
                    variant="outline"
                    className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-600 border-green-200"
                  >
                    Complété
                  </Badge>
                </div>

                <div className="text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  {formatDate(item.date_modification)}
                </div>

                <p className="text-gray-700 break-words mb-4">
                  {item.description}
                </p>
              </div>

              <div className="mt-auto text-right font-semibold text-[#3A72EC] dark:text-[#eb9108]">
                Montant: {item.montant} MAD
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Juridique;