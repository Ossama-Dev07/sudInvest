import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import useHistoriqueJuridiqueStore from "@/store/HistoriqueJuridiqueStore";
import { Calendar, LoaderCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import AjouterHistorique from "./AjouterHistorique";

const Juridique = ({ idClient }) => {
  const { getHistoriqueByClientId, loading } = useHistoriqueJuridiqueStore();

  const [historiqueJuridique, setHistoriqueJuridique] = useState([]);
  useEffect(() => {
    console.log("Juridique component mounted/updated with client ID:", idClient);
    
    // Define an async function to fetch data
    const loadData = async () => {
      if (idClient) {
        console.log("Fetching historique data for client:", idClient);
        try {
          await getHistoriqueByClientId(idClient);
        } catch (error) {
          console.error("Error in useEffect when fetching historique:", error);
        }
      }
    };
    
    // Call the async function
    loadData();
    
    // Cleanup function
    return () => {
      console.log("Juridique component unmounting");
    };
  }, [idClient, getHistoriqueByClientId]);
  console.log("i'm in historique ",historiqueJuridique);
  


  // Format date helper
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
  if (loading)
    return (
      <div className="flex items-start justify-center h-screen">
        <LoaderCircle className="animate-spin transition" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Historique Juridique</h2>
        <AjouterHistorique />
      </div>

      {historiqueJuridique.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-gray-500">
            Aucun historique juridique disponible
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {historiqueJuridique.map((item) => (
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

              {/* Montant at the bottom */}
              <div className="mt-auto text-right font-semibold text-green-700">
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
