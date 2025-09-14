import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Jobs from "./Jobs";

import Assessments from "./Assessments";

import StartAssessment from "./StartAssessment";

import Reports from "./Reports";

import Company from "./Company";

import AssessmentDetails from "./AssessmentDetails";

import JobDetails from "./JobDetails";

import ArchivedJobs from "./ArchivedJobs";

import ManageTeam from "./ManageTeam";

import Login from "./Login";

import Login from "./Login";

import Login from "./Login";

import Login from "./Login";

import Login from "./Login";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Jobs: Jobs,
    
    Assessments: Assessments,
    
    StartAssessment: StartAssessment,
    
    Reports: Reports,
    
    Company: Company,
    
    AssessmentDetails: AssessmentDetails,
    
    JobDetails: JobDetails,
    
    ArchivedJobs: ArchivedJobs,
    
    ManageTeam: ManageTeam,
    
    Login: Login,
    
    Login: Login,
    
    Login: Login,
    
    Login: Login,
    
    Login: Login,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Jobs" element={<Jobs />} />
                
                <Route path="/Assessments" element={<Assessments />} />
                
                <Route path="/StartAssessment" element={<StartAssessment />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/Company" element={<Company />} />
                
                <Route path="/AssessmentDetails" element={<AssessmentDetails />} />
                
                <Route path="/JobDetails" element={<JobDetails />} />
                
                <Route path="/ArchivedJobs" element={<ArchivedJobs />} />
                
                <Route path="/ManageTeam" element={<ManageTeam />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}