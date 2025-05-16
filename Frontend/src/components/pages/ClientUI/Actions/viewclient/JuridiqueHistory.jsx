import AjouterHistorique from "@/components/pages/HistoriqueJuridique/Actions/AjouterHistorique";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import useHistoriqueJuridiqueStore from "@/store/HistoriqueJuridiqueStore";
import { Calendar, LoaderCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";

const Juridique = ({idClient}) => {
    const {getHistoriqueByClientId,loading} = useHistoriqueJuridiqueStore();
    const [historiqueJuridique, setHistoriqueJuridique] = useState([]);
    useEffect(()=>{
        const fetchHistorique = async () => {
            try {
                const historiquedata=await getHistoriqueByClientId(idClient);
                setHistoriqueJuridique(historiquedata);
            } catch (error) {
                console.error("Error fetching historique data:", error);
            }
        };
        fetchHistorique();
    }, [idClient]);

  
    const addNewHistorique = () => {
      // This would open a modal or navigate to a form to add new juridique history
      console.log("Add new juridique history");
    };
  
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
          <AjouterHistorique/>
        </div>
  
        {historiqueJuridique.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-gray-500">Aucun historique juridique disponible</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {historiqueJuridique.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-lg">{item.objet}</h3>
                  {/* <Badge
                    variant="outline"
                    className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      item.status === "completed"
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-yellow-50 text-yellow-600 border-yellow-200"
                    )}
                  >
                    {item.status === "completed" ? "Complété" : "En cours"}
                  </Badge> */}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  {formatDate(item.date_modification)}
                </div>
                <p className="text-gray-700">{item.description}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };
  export default Juridique;