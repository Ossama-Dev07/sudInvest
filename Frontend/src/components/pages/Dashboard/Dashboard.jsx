// import React from 'react'

// export default function Dashboard() {
//   return (
//     <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
//       <div className="grid auto-rows-min gap-4 md:grid-cols-3">
//         <div className="aspect-video rounded-xl bg-muted/50" />
//         <div className="aspect-video rounded-xl bg-muted/50" />
//         <div className="aspect-video rounded-xl bg-muted/50" />
//       </div>
//       <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
//     </div>
//   );
// }
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

// Define form schema with Zod
const formSchema = z.object({
  account: z.object({
    username: z.string().min(3, {
      message: "Username must be at least 3 characters",
    }),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
  }),
  profile: z.object({
    password: z.string().min(8, {
      message: "Password must be at least 8 characters",
    }),
    age: z.coerce.number().min(18, {
      message: "You must be at least 18 years old",
    }),
  }),
});

export default function MultiStepFormDemo() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account: {
        username: "",
        email: "",
      },
      profile: {
        password: "",
        age: "",
      },
    },
    mode: "onBlur",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { id: "account", title: "Account" },
    { id: "profile", title: "Profile" },
    { id: "review", title: "Review" },
  ];

  const nextStep = async () => {
    if (currentStep === 0) {
      const accountValid = await form.trigger("account");
      if (!accountValid) return;
    } else if (currentStep === 1) {
      const profileValid = await form.trigger("profile");
      if (!profileValid) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    alert("Account created successfully!");
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                index < currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : index === currentStep
                  ? "border-primary text-primary"
                  : "border-muted-foreground text-muted-foreground"
              }`}
            >
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <div className="mt-2 text-center">
              <div
                className={`text-sm font-medium ${
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-20 h-0.5 mx-4 ${
                index < currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Create Your Account
          </CardTitle>
          <p className="text-muted-foreground">
            Follow the steps below to set up your account
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <StepIndicator />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="account.username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="account.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end pt-4">
                    <Button type="button" onClick={nextStep}>
                      Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="profile.password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profile.age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                    </Button>
                    <Button type="button" onClick={nextStep}>
                      Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Review Your Information</h3>
                    <p className="text-muted-foreground">
                      Please review your details before creating your account.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Account Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Username:</span>
                          <span className="font-medium">
                            {form.getValues("account.username")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">
                            {form.getValues("account.email")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Profile Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Password:</span>
                          <span className="font-medium">••••••••</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age:</span>
                          <span className="font-medium">
                            {form.getValues("profile.age")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      <Check className="w-4 h-4 mr-2" /> Create Account
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}