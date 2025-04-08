
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import JobsAllList from "./JobsAllList";
import JobsGroupedList from "./JobsGroupedList";

const JobsRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/jobs/all" replace />} />
      <Route path="/all" element={<JobsAllList />} />
      <Route path="/grouped" element={<JobsGroupedList />} />
    </Routes>
  );
};

export default JobsRouter;
