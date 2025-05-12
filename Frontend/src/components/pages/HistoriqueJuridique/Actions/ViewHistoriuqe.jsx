import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function ViewHistoriuqe({ data }) {
  const renderAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MAD",
    }).format(amount);
  };
  return (
    <DialogContent className="sm:max-w-[600px]">
      <>
        <DialogHeader>
          <DialogTitle>Détails de l'Historique Juridique</DialogTitle>
          <DialogDescription>
            Informations complètes sur l'entrée sélectionnée
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Nom Complet:</span>
            <span className="col-span-3">
              {data?.client_nom || data?.client_prenom
                ? `${data?.client_nom || ""} ${
                    data?.client_prenom || ""
                  }`.trim()
                : "__________"}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Raison Sociale:</span>
            <span className="col-span-3">
              {data?.raisonSociale ? data.raisonSociale : "__________"}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Date Modification:</span>
            <span className="col-span-3">{data?.date_modification}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Montant:</span>
            <span className="col-span-3">{renderAmount(data?.montant)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Description:</span>
            <span className="col-span-3">{data?.description}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Objet:</span>
            <span className="col-span-3">{data?.objet}</span>
          </div>
        </div>
      </>
    </DialogContent>
  );
}
