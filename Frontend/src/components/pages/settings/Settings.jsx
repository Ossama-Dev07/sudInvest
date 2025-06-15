import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Check, Monitor, Sun, Moon, Type, Palette, Settings as SettingsIcon, Lightbulb } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTheme } from "@/components/theme-provider";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Veuillez sélectionner un thème.",
  }),
  font: z.enum(["inter", "manrope", "system"], {
    invalid_type_error: "Sélectionnez une police",
    required_error: "Veuillez sélectionner une police.",
  }),
});

const fontPreviews = {
  inter: {
    name: "Inter",
    description: "Police sans-serif moderne et lisible",
    preview: "Portez ce vieux whisky au juge blond qui fume",
    className: "font-inter"
  },
  manrope: {
    name: "Manrope",
    description: "Typographie élégante et professionnelle",
    preview: "Portez ce vieux whisky au juge blond qui fume",
    className: "font-manrope"
  },
  system: {
    name: "Système",
    description: "La police par défaut de votre système",
    preview: "Portez ce vieux whisky au juge blond qui fume",
    className: "font-system"
  }
};

const themeOptions = [
  {
    value: "light",
    label: "Clair",
    description: "Interface propre et lumineuse",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Sombre",
    description: "Repose les yeux en faible luminosité",
    icon: Moon,
  },
  {
    value: "system",
    label: "Système",
    description: "S'adapte aux préférences de votre système",
    icon: Monitor,
  }
];

export default function Settings() {
  const { theme, setTheme, font, setFont } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set up form with current values
  const form = useForm({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: theme,
      font: font || "inter",
    },
  });

  // Update form values when context changes
  useEffect(() => {
    form.reset({
      theme: theme,
      font: font || "inter",
    });
  }, [theme, font, form]);

  async function onSubmit(data) {
    setIsSubmitting(true);
    
    try {
      console.log("Mise à jour des préférences:", data);

      // Simulate API call with delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      if (data.theme !== theme) {
        setTheme(data.theme);
      }

      if (data.font !== font) {
        setFont(data.font);
      }

      toast.success("Préférences mises à jour avec succès !");
    } catch (error) {
      toast.error("Échec de la mise à jour des préférences");
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentFont = form.watch("font");
  const currentTheme = form.watch("theme");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Paramètres</h1>
              <p className="text-sm text-muted-foreground">
                Personnalisez l'apparence et les préférences de votre application
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Main Settings Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Theme Selection */}
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Préférence de thème</CardTitle>
                    </div>
                    <CardDescription>
                      Choisissez l'apparence de l'interface. Vous pouvez basculer entre clair, sombre ou suivre les préférences système.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormMessage />
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                          >
                            {themeOptions.map((option) => {
                              const Icon = option.icon;
                              const isSelected = field.value === option.value;
                              
                              return (
                                <FormItem key={option.value}>
                                  <FormLabel className="cursor-pointer">
                                    <FormControl>
                                      <RadioGroupItem value={option.value} className="sr-only" />
                                    </FormControl>
                                    <div className={cn(
                                      "relative rounded-lg border-2 p-4 transition-all hover:bg-accent/50",
                                      isSelected 
                                        ? "border-primary bg-primary/5 shadow-sm" 
                                        : "border-muted hover:border-border"
                                    )}>
                                      {isSelected && (
                                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                          <Check className="h-3 w-3 text-primary-foreground" />
                                        </div>
                                      )}
                                      
                                      <div className="flex flex-col items-center space-y-3 text-center">
                                        <div className={cn(
                                          "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
                                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        )}>
                                          <Icon className="h-5 w-5" />
                                        </div>
                                        
                                        <div>
                                          <div className="font-medium text-foreground">{option.label}</div>
                                          <div className="text-xs text-muted-foreground">{option.description}</div>
                                        </div>
                                      </div>

                                      {/* Theme Preview */}
                                      <div className="mt-4">
                                        {option.value === "light" && (
                                          <div className="space-y-2 rounded-md bg-white p-3 shadow-sm ring-1 ring-gray-200">
                                            <div className="h-2 w-16 rounded bg-gray-200" />
                                            <div className="h-2 w-20 rounded bg-gray-300" />
                                            <div className="flex space-x-1">
                                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                              <div className="h-1.5 w-12 rounded bg-gray-200" />
                                            </div>
                                          </div>
                                        )}
                                        
                                        {option.value === "dark" && (
                                          <div className="space-y-2 rounded-md bg-gray-900 p-3 shadow-sm ring-1 ring-gray-800">
                                            <div className="h-2 w-16 rounded bg-gray-700" />
                                            <div className="h-2 w-20 rounded bg-gray-600" />
                                            <div className="flex space-x-1">
                                              <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                              <div className="h-1.5 w-12 rounded bg-gray-700" />
                                            </div>
                                          </div>
                                        )}
                                        
                                        {option.value === "system" && (
                                          <div className="space-y-2 rounded-md bg-gradient-to-r from-white to-gray-900 p-3 shadow-sm ring-1 ring-gray-300">
                                            <div className="h-2 w-16 rounded bg-gradient-to-r from-gray-200 to-gray-700" />
                                            <div className="h-2 w-20 rounded bg-gradient-to-r from-gray-300 to-gray-600" />
                                            <div className="flex space-x-1">
                                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                              <div className="h-1.5 w-12 rounded bg-gradient-to-r from-gray-200 to-gray-700" />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </FormLabel>
                                </FormItem>
                              );
                            })}
                          </RadioGroup>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Font Selection */}
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Type className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Typographie</CardTitle>
                    </div>
                    <CardDescription>
                      Sélectionnez la famille de polices qui sera utilisée dans toute l'application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="font"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormMessage />
                          <div className="space-y-3">
                            {Object.entries(fontPreviews).map(([key, fontData]) => {
                              const isSelected = field.value === key;
                              
                              return (
                                <div
                                  key={key}
                                  className={cn(
                                    "cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-accent/50",
                                    isSelected 
                                      ? "border-primary bg-primary/5" 
                                      : "border-muted hover:border-border"
                                  )}
                                  onClick={() => field.onChange(key)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3">
                                        <div className={cn(
                                          "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        )}>
                                          <Type className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">{fontData.name}</span>
                                            {isSelected && <Badge variant="secondary" className="text-xs">Actif</Badge>}
                                          </div>
                                          <p className="text-sm text-muted-foreground">{fontData.description}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-3 rounded-md bg-muted/50 p-3">
                                        <p className={cn(
                                          "text-sm text-foreground transition-all",
                                          fontData.className
                                        )}>
                                          {fontData.preview}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {isSelected && (
                                      <div className="ml-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="min-w-[180px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Application...
                      </>
                    ) : (
                      "Mettre à jour les préférences"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Settings Preview Sidebar */}
          <div className="space-y-6">
            
            {/* Current Settings */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Paramètres actuels</CardTitle>
                <CardDescription>Aperçu de vos préférences actuelles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Thème</span>
                  <Badge variant="outline" className="capitalize">
                    {currentTheme === "light" ? "Clair" : currentTheme === "dark" ? "Sombre" : "Système"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Police</span>
                  <Badge variant="outline" className="capitalize">
                    {fontPreviews[currentFont]?.name}
                  </Badge>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Aperçu en direct</h4>
                  <div className={cn(
                    "rounded-lg border border-border p-4 transition-all",
                    fontPreviews[currentFont]?.className
                  )}>
                    <h5 className="mb-2 text-base font-semibold text-foreground">Contenu d'exemple</h5>
                    <p className="text-sm text-muted-foreground">
                      Voici comment votre texte apparaîtra avec la combinaison de police et de thème sélectionnée.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <div className="h-6 w-6 rounded bg-primary"></div>
                      <div className="h-6 w-6 rounded bg-secondary"></div>
                      <div className="h-6 w-6 rounded bg-muted"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-border bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Conseils utiles</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="text-blue-800 dark:text-blue-200">
                  <strong>Thème système :</strong> Bascule automatiquement entre clair et sombre selon les paramètres de votre OS.
                </div>
                <div className="text-blue-800 dark:text-blue-200">
                  <strong>Choix de police :</strong> Inter et Manrope sont optimisées pour la lisibilité, tandis que Système utilise la police par défaut de votre OS.
                </div>
                <div className="text-blue-800 dark:text-blue-200">
                  <strong>Performance :</strong> Les modifications sont appliquées instantanément et persistent d'une session à l'autre.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}