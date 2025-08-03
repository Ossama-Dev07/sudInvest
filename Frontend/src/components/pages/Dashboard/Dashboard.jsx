import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardStats from "./DashboardStats";
import TaskDistributionComponent from "./TaskDistributionComponent";
import AcquisitionClients from "./AcquisitionClients";
import ActivitesRecentes from "./ActivitesRecentes";
import ElementsEnRetard from "./ElementsEnRetard"; // ✅ Import the new component


const Dashboard = () => {

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}

      {/* Dashboard Stats Component */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6 ">
          {/* Client Acquisition Component */}
          <div className="">
            <AcquisitionClients />
          </div>
          {/* ✅ REPLACED: Overdue Items Section with new component */}
          <ElementsEnRetard />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Task Distribution Component */}
          <TaskDistributionComponent />

          {/* Recent Activities Component */}
          <ActivitesRecentes
            maxHeight="h-96"
            showHeader={true}
            showViewAllButton={true}
            maxActivities={5}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
