
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Assessment } from '@/api/entities';
import { Job } from '@/api/entities';
import { User } from '@/api/entities';
import { PdsDocument } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  ArrowLeft, 
  FileText, 
  Calendar, 
  User as UserIcon, 
  Building, 
  MapPin, 
  Phone, 
  Mail,
  Cpu,
  Image as ImageIcon,
  Paperclip,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  HardHat
} from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function AssessmentDetailsPage() {
  const location = useLocation();
  const [assessment, setAssessment] = useState(null);
  const [job, setJob] = useState(null);
  const [assessor, setAssessor] = useState(null);
  const [pdsDocument, setPdsDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to check if an ID looks like a valid database ID
  const isValidId = (id) => {
    if (!id || typeof id !== 'string') return false;
    // Valid IDs should be alphanumeric and at least 8 characters (typical database ID length)
    // This will filter out obvious test IDs like "jacob-user-id" or "job-sample-4"
    return /^[a-zA-Z0-9]{8,}$/.test(id);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const assessmentId = params.get('id');
        if (!assessmentId) {
          setLoading(false);
          return;
        }

        const assessmentData = await Assessment.get(assessmentId);
        setAssessment(assessmentData);

        // Safely load job data - only if ID looks valid
        if (assessmentData.job_id) {
          if (isValidId(assessmentData.job_id)) {
            try {
              const jobData = await Job.get(assessmentData.job_id);
              setJob(jobData);
            } catch (e) {
              console.warn(`Job with id ${assessmentData.job_id} not found. Job details will be unavailable.`, e);
              setJob(null);
            }
          } else {
            console.warn(`Invalid job ID format: ${assessmentData.job_id}. Skipping fetch.`);
            setJob(null);
          }
        }

        // Safely load assessor data - only if ID looks valid
        if (assessmentData.assessor_id) {
          if (isValidId(assessmentData.assessor_id)) {
            try {
              const assessorData = await User.get(assessmentData.assessor_id);
              setAssessor(assessorData);
            } catch (e) {
              console.warn(`Assessor with id ${assessmentData.assessor_id} not found. Assessor details will be unavailable.`, e);
              setAssessor(null);
            }
          } else {
            console.warn(`Invalid assessor ID format: ${assessmentData.assessor_id}. Skipping fetch.`);
            setAssessor(null);
          }
        }
        
        // Safely load PDS document - only if ID looks valid
        if (assessmentData.pds_document_id) {
          if (isValidId(assessmentData.pds_document_id)) {
            try {
              const pdsData = await PdsDocument.get(assessmentData.pds_document_id);
              setPdsDocument(pdsData);
            } catch (e) {
              console.warn(`PDS document with id ${assessmentData.pds_document_id} not found. Document details will be unavailable.`, e);
              setPdsDocument(null);
            }
          } else {
            console.warn(`Invalid PDS document ID format: ${assessmentData.pds_document_id}. Skipping fetch.`);
            setPdsDocument(null);
          }
        }

      } catch (error) {
        console.error("Error fetching assessment details:", error);
        setAssessment(null); // Ensure assessment is null if the main fetch fails
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [location.search]);

  const getStatusColor = (status) => {
    const colors = {
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      pending_review: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'proceed':
        return <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />;
      case 'additional_info_needed':
        return <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />;
      case 'refer_to_insurer':
        return <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />;
      default:
        return <HelpCircle className="w-6 h-6 text-slate-500 flex-shrink-0" />;
    }
  };

  const getRecommendationText = (recommendation) => {
    switch (recommendation) {
      case 'proceed':
        return 'Proceed with Claim';
      case 'additional_info_needed':
        return 'Additional Information Required';
      case 'refer_to_insurer':
        return 'Refer to Insurer';
      default:
        return 'No Recommendation';
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'proceed':
        return 'text-green-800 bg-green-50 border-green-200';
      case 'additional_info_needed':
        return 'text-yellow-800 bg-yellow-50 border-yellow-200';
      case 'refer_to_insurer':
        return 'text-red-800 bg-red-50 border-red-200';
      default:
        return 'text-slate-800 bg-slate-50 border-slate-200';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!assessment) {
    return <div className="text-center p-8">Assessment not found.</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center animate-fade-in-up">
        <Button variant="ghost" asChild>
          <a href={createPageUrl('Assessments')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Assessments
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Assessment Card */}
          <Card className="animate-fade-in-up">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    Assessment Details
                  </CardTitle>
                  <p className="text-slate-500">Report for claim #{job?.claim_number || 'Unknown'}</p>
                </div>
                <Badge className={`${getStatusColor(assessment.status)} border-0 capitalize`}>
                  {assessment.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50/80 rounded-lg">
                    <p className="font-medium text-slate-500 mb-0.5">Event Type</p>
                    <p className="text-slate-800 capitalize">{assessment.event_details?.event_type?.replace(/_/g, ' ') || 'Not specified'}</p>
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-lg">
                    <p className="font-medium text-slate-500 mb-0.5">Date of Assessment</p>
                    <p className="text-slate-800">{new Date(assessment.assessment_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50/80 rounded-lg">
                  <p className="font-medium text-slate-500 mb-0.5">Damage Description</p>
                  <p className="text-slate-800">{assessment.event_details?.damage_description || 'No description available'}</p>
                </div>
                 <div className="p-3 bg-slate-50/80 rounded-lg">
                  <p className="font-medium text-slate-500 mb-0.5">Stated Cause</p>
                  <p className="text-slate-800">{assessment.event_details?.cause_description || 'No cause specified'}</p>
                </div>
            </CardContent>
          </Card>
          
          {/* AI Policy Analysis */}
          {assessment.ai_analysis && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Cpu className="w-6 h-6 text-indigo-500" />
                  AI Policy Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className={`p-4 rounded-lg border ${getRecommendationColor(assessment.ai_analysis.recommendation)}`}>
                  <div className="flex items-center gap-3">
                    {getRecommendationIcon(assessment.ai_analysis.recommendation)}
                    <h3 className="text-lg font-semibold">
                      {getRecommendationText(assessment.ai_analysis.recommendation)}
                    </h3>
                  </div>
                </div>
                <div className="p-3 bg-slate-50/80 rounded-lg">
                  <p className="font-medium text-slate-500 mb-0.5">Reasoning</p>
                  <p className="text-slate-800">{assessment.ai_analysis.reasoning}</p>
                </div>
                {pdsDocument && (
                    <div className="p-3 bg-slate-50/80 rounded-lg">
                        <p className="font-medium text-slate-500 mb-0.5">PDS Document Analyzed</p>
                        <p className="text-slate-800">{pdsDocument.name} (v{pdsDocument.version})</p>
                    </div>
                )}
                {assessment.ai_analysis.pds_citations && assessment.ai_analysis.pds_citations.length > 0 && (
                    <div className="p-3 bg-slate-50/80 rounded-lg">
                        <p className="font-medium text-slate-500 mb-2">Relevant PDS Clauses</p>
                        <div className="space-y-2">
                        {assessment.ai_analysis.pds_citations.map((citation, index) => (
                            <div key={index} className="text-xs p-2 bg-white rounded">
                                <p className="font-semibold">{citation.clause}</p>
                                <p className="text-slate-600">{citation.relevance}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Damage Areas */}
          {assessment.damage_areas && assessment.damage_areas.length > 0 && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <HardHat className="w-6 h-6 text-orange-500" />
                  Damaged Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assessment.damage_areas.map((area, index) => (
                  <div key={index} className="p-3 bg-slate-50/80 rounded-lg">
                    <p className="font-semibold text-slate-800">{area.area} - <span className="font-normal">{area.damage_type}</span></p>
                    <p className="text-sm text-slate-600 mt-1">{area.description}</p>
                    {area.photos && area.photos.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {area.photos.map((photo, pIndex) => (
                          <a key={pIndex} href={photo} target="_blank" rel="noopener noreferrer">
                            <img src={photo} className="w-16 h-16 object-cover rounded-md border" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Paperclip className="w-6 h-6 text-sky-500" />
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><span className="font-semibold">{assessment.photos?.length || 0}</span> photos and <span className="font-semibold">{assessment.documents?.length || 0}</span> documents attached.</p>
              </CardContent>
            </Card>
        </div>

        {/* Side Panel with Job Info */}
        <div className="space-y-6">
          <Card className="bg-white animate-slide-in-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-3"><FileText className="w-5 h-5 text-slate-500"/>Job Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><strong>Claim Number:</strong> {job?.claim_number || 'Not available'}</p>
              <p><strong>Insurer:</strong> {job?.insurer || 'Not available'}</p>
              <p><strong>Policy Number:</strong> {job?.policy_number || 'Not available'}</p>
              {job?.date_of_loss && <p><strong>Date of Loss:</strong> {new Date(job.date_of_loss).toLocaleDateString()}</p>}
            </CardContent>
          </Card>
          <Card className="bg-white animate-slide-in-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-3"><UserIcon className="w-5 h-5 text-slate-500"/>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><strong>Name:</strong> {job?.customer_name || 'Not available'}</p>
              <p><strong>Address:</strong> {job?.property_address || 'Not available'}</p>
              {job?.customer_phone && <p><strong>Phone:</strong> {job.customer_phone}</p>}
              {job?.customer_email && <p><strong>Email:</strong> {job.customer_email}</p>}
            </CardContent>
          </Card>
          <Card className="bg-white animate-slide-in-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-3"><Building className="w-5 h-5 text-slate-500"/>Assessor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><strong>Name:</strong> {assessor?.full_name || 'Not available'}</p>
              <p><strong>Email:</strong> {assessor?.email || 'Not available'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
