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
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const steps = [
  { id: 'account', title: 'Account', description: 'Create your account details' },
  { id: 'profile', title: 'Profile', description: 'Complete your profile' },
  { id: 'review', title: 'Review', description: 'Review your information' }
];

export default function MultiStepFormDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    account: {
      username: '',
      email: ''
    },
    profile: {
      password: '',
      age: ''
    }
  });
  const [errors, setErrors] = useState({});

  const validateStep = (stepIndex) => {
    const newErrors = {};
    
    if (stepIndex === 0) {
      if (!formData.account.username || formData.account.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
      if (!formData.account.email || !/\S+@\S+\.\S+/.test(formData.account.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (stepIndex === 1) {
      if (!formData.profile.password || formData.profile.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!formData.profile.age || parseInt(formData.profile.age) < 18) {
        newErrors.age = 'Age must be at least 18';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setErrors({});
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    alert('Account created successfully!');
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
              index < currentStep 
                ? 'bg-primary border-primary text-primary-foreground' 
                : index === currentStep 
                ? 'border-primary text-primary' 
                : 'border-muted-foreground text-muted-foreground'
            }`}>
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <div className="mt-2 text-center">
              <div className={`text-sm font-medium ${
                index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.title}
              </div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-20 h-0.5 mx-4 ${
              index < currentStep ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const AccountStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.account.username}
          onChange={(e) => handleInputChange('account', 'username', e.target.value)}
          className={errors.username ? 'border-destructive' : ''}
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.account.email}
          onChange={(e) => handleInputChange('account', 'email', e.target.value)}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>
      
      <div className="flex justify-end pt-4">
        <Button onClick={handleNext}>
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const ProfileStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.profile.password}
          onChange={(e) => handleInputChange('profile', 'password', e.target.value)}
          className={errors.password ? 'border-destructive' : ''}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          value={formData.profile.age}
          onChange={(e) => handleInputChange('profile', 'age', e.target.value)}
          className={errors.age ? 'border-destructive' : ''}
        />
        {errors.age && (
          <p className="text-sm text-destructive">{errors.age}</p>
        )}
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handlePrev}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        <Button onClick={handleNext}>
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Review Your Information</h3>
        <p className="text-muted-foreground">Please review your details before creating your account.</p>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username:</span>
              <span className="font-medium">{formData.account.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{formData.account.email}</span>
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
              <span className="font-medium">{formData.profile.age}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handlePrev}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
          <Check className="w-4 h-4 mr-2" /> Create Account
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <AccountStep />;
      case 1:
        return <ProfileStep />;
      case 2:
        return <ReviewStep />;
      default:
        return <AccountStep />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
          <p className="text-muted-foreground">Follow the steps below to set up your account</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <StepIndicator />
          <div className="min-h-96">
            {renderCurrentStep()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}