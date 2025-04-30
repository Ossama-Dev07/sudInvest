import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Shield,
  User,
  Settings,
  Clock,
} from "lucide-react";

export default function Veiw() {
  // Mock user data - in a real application, this would come from props or context
  const userData = {
    id: "12345",
    name: "Alex Johnson",
    username: "alexj",
    email: "alex.johnson@example.com",
    avatar: "https://api.placeholder.com/400/320",
    role: "Administrator",
    status: "Active",
    lastActive: "Today at 2:45 PM",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinDate: "March 15, 2023",
    subscription: "Premium",
    activityStats: {
      logins: 247,
      postsCreated: 42,
      commentsLeft: 128,
    },
  };

  return (
    <div className="w-full max-w-md mx-auto py-3">
      <SheetHeader className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <SheetTitle className="text-xl font-bold">User Profile</SheetTitle>
            <SheetDescription>
              Viewing detailed user information
            </SheetDescription>
          </div>
          <Badge
            className={
              userData.status === "Active" ? "bg-green-500" : "bg-gray-400"
            }
          >
            {userData.status}
          </Badge>
        </div>
      </SheetHeader>

      {/* User Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src="/api/placeholder/400/320" alt={userData.name} />
          <AvatarFallback className="bg-blue-500 text-white text-lg">
            {userData.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-lg">{userData.name}</h3>
          <div className="flex items-center text-sm text-gray-500">
            <User className="mr-1 h-3 w-3" /> @{userData.username}
          </div>
          <div className="flex items-center mt-1">
            <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
              {userData.role}
            </Badge>
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-800 border-purple-200"
            >
              {userData.subscription}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs for organized data */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium mr-2">Email:</span>
                  <span className="text-sm text-gray-600">
                    {userData.email}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium mr-2">Phone:</span>
                  <span className="text-sm text-gray-600">
                    {userData.phone}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium mr-2">Location:</span>
                  <span className="text-sm text-gray-600">
                    {userData.location}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium mr-2">Joined:</span>
                  <span className="text-sm text-gray-600">
                    {userData.joinDate}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium mr-2">Last active:</span>
                <span className="text-sm text-gray-600">
                  {userData.lastActive}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-semibold">
                    {userData.activityStats.logins}
                  </p>
                  <p className="text-xs text-gray-500">Logins</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-semibold">
                    {userData.activityStats.postsCreated}
                  </p>
                  <p className="text-xs text-gray-500">Posts</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-semibold">
                    {userData.activityStats.commentsLeft}
                  </p>
                  <p className="text-xs text-gray-500">Comments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <Shield className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium mr-2">Account ID:</span>
                <span className="text-sm text-gray-600">{userData.id}</span>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Two-factor authentication</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Enabled
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Recovery email</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Verified
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    <span className="text-sm">Password strength</span>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    Medium
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SheetFooter className="mt-6 flex space-x-2">
        <SheetClose asChild>
          <Button variant="outline">Close</Button>
        </SheetClose>
        <SheetClose asChild>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </SheetClose>
      </SheetFooter>
    </div>
  );
}
