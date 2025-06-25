import React, { useState } from 'react';
import { Trash2, Check, Plus, Edit, X, Bell } from 'lucide-react';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const Notification = () => {
  // Fake notification data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      description: "User profile updated successfully",
      type: "update",
      date: "2024-12-15T10:30:00Z"
    },
    {
      id: 2,
      description: "New product added to inventory",
      type: "add",
      date: "2024-12-15T09:15:00Z"
    },
    {
      id: 3,
      description: "Order #12345 deleted from system",
      type: "delete",
      date: "2024-12-15T08:45:00Z"
    },
    {
      id: 4,
      description: "Customer information updated",
      type: "update",
      date: "2024-12-14T16:20:00Z"
    },
    {
      id: 5,
      description: "New category created in catalog",
      type: "add",
      date: "2024-12-14T14:10:00Z"
    },
    {
      id: 6,
      description: "Promotional banner removed",
      type: "delete",
      date: "2024-12-14T11:30:00Z"
    },
    {
      id: 7,
      description: "Payment method configuration updated",
      type: "update",
      date: "2024-12-13T17:45:00Z"
    },
    {
      id: 8,
      description: "New admin user account created",
      type: "add",
      date: "2024-12-13T13:25:00Z"
    }
  ]);

  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'add':
        return <Plus className="h-4 w-4" />;
      case 'update':
        return <Edit className="h-4 w-4" />;
      case 'delete':
        return <X className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case 'add':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'add':
        return 'text-green-600 bg-green-50';
      case 'update':
        return 'text-blue-600 bg-blue-50';
      case 'delete':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    } else {
      setSelectedNotifications(new Set());
    }
  };

  const handleSelectNotification = (notificationId, checked) => {
    const newSelected = new Set(selectedNotifications);
    if (checked) {
      newSelected.add(notificationId);
    } else {
      newSelected.delete(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  // Delete handlers
  const handleDeleteNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
    setSelectedNotifications(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(notificationId);
      return newSelected;
    });
  };

  const handleDeleteSelected = () => {
    setNotifications(notifications.filter(n => !selectedNotifications.has(n.id)));
    setSelectedNotifications(new Set());
  };

  const isAllSelected = notifications.length > 0 && selectedNotifications.size === notifications.length;
  const isIndeterminate = selectedNotifications.size > 0 && selectedNotifications.size < notifications.length;

  return (
    <div className=" font-inter">
      <Card className="border-none shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Notifications
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            </CardTitle>
            {selectedNotifications.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedNotifications.size})
              </Button>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                ref={(ref) => {
                  if (ref) ref.indeterminate = isIndeterminate;
                }}
              />
              <label htmlFor="select-all" className="text-sm font-medium text-muted-foreground cursor-pointer">
                Select all notifications
              </label>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-0">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No notifications available</p>
            </div>
          ) : (
            <div className="space-y-0">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div className="flex items-start gap-4 py-4 group hover:bg-accent/50 px-4 -mx-4 rounded-lg transition-colors">
                    <Checkbox
                      id={`notification-${notification.id}`}
                      checked={selectedNotifications.has(notification.id)}
                      onCheckedChange={(checked) => handleSelectNotification(notification.id, checked)}
                      className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                          {notification.description}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getTypeColor(notification.type)}`}>
                          {getTypeIcon(notification.type)}
                          <span className="font-medium capitalize">{notification.type}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {formatDate(notification.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-0" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notification;