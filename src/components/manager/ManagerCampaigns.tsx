
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { requestService } from '@/services/requestService';
import { authService, type User } from '@/services/authService';
import { CheckCircle, XCircle, Eye, AlertCircle, Users, Calendar, Clock, Play, CheckCheck, X } from 'lucide-react';

interface CampaignUser {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  application_name: string;
  current_access_level: string;
  access_granted_date: string;
  is_active: boolean;
}

interface AuditResult {
  id: string;
  user_id: string;
  user_email: string;
  manager_name: string;
  decision: 'yes' | 'no' | 'pending';
  comments: string;
  reviewed_at: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  application_name: string;
  application_ids?: string[]; // Support multiple applications
  due_date: string;
  assigned_managers: string[];
  status: string;
  progress: number;
}

export default function ManagerCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignUsers, setCampaignUsers] = useState<CampaignUser[]>([]);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CampaignUser | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'yes' | 'no' | 'pending' | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [editingUser, setEditingUser] = useState<string | null>(null); // Track which user is being edited
  const [showCompleted, setShowCompleted] = useState(false); // Toggle between active and completed campaigns

  useEffect(() => {
    loadData();
  }, []);

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log('🔍 State changed - viewMode:', viewMode, 'selectedCampaign:', selectedCampaign?.id);
  }, [viewMode, selectedCampaign]);

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log('🔍 State changed - viewMode:', viewMode, 'selectedCampaign:', selectedCampaign?.id);
  }, [viewMode, selectedCampaign]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user - wait for the Promise to resolve
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      if (!user) {
        setError('User tidak ditemukan');
        return;
      }

      console.log('🔍 Current user:', user);

      // Load campaigns assigned to this manager
      const allCampaigns = await requestService.getCampaigns();
      console.log('🔍 All campaigns:', allCampaigns);

      // Filter campaigns based on user role and name
      const assignedCampaigns = allCampaigns.filter(campaign => {
        console.log(`🔍 Processing campaign: ${campaign.name}`);
        console.log(`🔍 Campaign assigned_managers:`, campaign.assigned_managers);
        
        // Check if campaign has assigned_managers and it's not null/undefined
        if (!campaign.assigned_managers || !Array.isArray(campaign.assigned_managers)) {
          console.log('⚠️ Campaign has no assigned_managers:', campaign.name);
          return false;
        }

        // Check if current user is assigned to this campaign
        const isAssigned = campaign.assigned_managers.some(manager => {
          // Safety check for manager string
          if (!manager || typeof manager !== 'string') {
            console.log('⚠️ Invalid manager entry:', manager);
            return false;
          }

          const managerLower = manager.toLowerCase();
          const userNameLower = user.name.toLowerCase();
          const userRoleLower = user.role.toLowerCase();
          
          console.log(`🔍 Checking manager: "${manager}" against user: "${user.name}" (${user.role})`);
          
          return managerLower.includes(userNameLower) || 
                 managerLower.includes(userRoleLower) ||
                 (user.role === 'manager' && managerLower.includes('manager'));
        });

        console.log(`🔍 Campaign "${campaign.name}" assigned: ${isAssigned}`);
        return isAssigned;
      });

      console.log('✅ Assigned campaigns:', assignedCampaigns);
      setCampaigns(assignedCampaigns);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const loadCampaignDetails = async (campaignId: string) => {
    try {
      const [users, results] = await Promise.all([
        requestService.getCampaignUsers(campaignId),
        requestService.getAuditResults(campaignId)
      ]);

      setCampaignUsers(users);
      setAuditResults(results);
    } catch (err) {
      console.error('Error loading campaign details:', err);
      setError('Gagal memuat detail campaign');
    }
  };

  const handleViewCampaign = async (campaign: Campaign) => {
    console.log('🔍 handleViewCampaign called with campaign:', campaign);
    console.log('🔍 Current viewMode before:', viewMode);
    
    // Check if campaign is completed - if so, show read-only view
    if (campaign.status === 'completed') {
      console.log('🔍 Viewing completed campaign in read-only mode');
    }
    
    // Set selectedCampaign first
    setSelectedCampaign(campaign);
    console.log('🔍 Set selectedCampaign:', campaign.id);
    
    // Load campaign details first
    await loadCampaignDetails(campaign.id);
    console.log('🔍 Campaign details loaded');
    
    // Then set viewMode to detail
    setViewMode('detail');
    console.log('🔍 Set viewMode to: detail');
    
    console.log('🔍 handleViewCampaign completed');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCampaign(null);
    setCampaignUsers([]);
    setAuditResults([]);
  };

  const handleReviewUser = (user: CampaignUser) => {
    // Prevent editing if campaign is completed
    if (selectedCampaign?.status === 'completed') {
      setError('Campaign sudah selesai dan tidak bisa diedit');
      return;
    }

    console.log('🔍 handleReviewUser called with user:', user);
    console.log('🔍 Current auditResults:', auditResults);
    
    // Set editing mode for this user
    setEditingUser(user.user_id);
    
    // Check if user already has a review
    const existingReview = auditResults.find(r => r.user_id === user.user_id);
    console.log('🔍 Existing review found:', existingReview);
    
    if (existingReview) {
      setReviewDecision(existingReview.decision);
      setReviewComments(existingReview.comments);
      console.log('🔍 Set existing decision:', existingReview.decision);
    } else {
      setReviewDecision(null);
      setReviewComments('');
    }
    
    console.log('🔍 Inline edit mode activated for:', user.user_name);
  };

  const handleInlineDecision = async (user: CampaignUser, decision: 'yes' | 'no' | 'pending') => {
    // Prevent actions if campaign is completed
    if (selectedCampaign?.status === 'completed') {
      setError('Campaign sudah selesai dan tidak bisa diedit');
      return;
    }

    try {
      if (!currentUser) {
        setError('User tidak ditemukan');
        return;
      }

      let comments = '';
      if (decision === 'pending') {
        comments = 'Pending review - manager akan menentukan approve atau revoke di kemudian waktu';
      } else if (decision === 'yes') {
        comments = 'Access approved';
      } else {
        comments = 'Access revoked';
      }

      const auditData = {
        campaign_id: selectedCampaign!.id,
        user_id: user.user_id,
        user_email: user.user_email,
        manager_name: currentUser.name,
        decision: decision,
        comments: comments,
        reviewed_at: new Date().toISOString()
      };

      await requestService.submitAuditResult(auditData);
      
      // Reload campaign details to update the UI
      await loadCampaignDetails(selectedCampaign!.id);
      
      // Auto-exit editing mode
      setEditingUser(null);
      setReviewDecision(null);
      setReviewComments('');
      
      console.log(`✅ Inline decision submitted: ${decision} for ${user.user_name}`);
    } catch (error) {
      console.error('Error submitting inline decision:', error);
      setError('Gagal menyimpan keputusan');
    }
  };

  const handleQuickDecision = async (user: CampaignUser, decision: 'yes' | 'no' | 'pending') => {
    // Prevent actions if campaign is completed
    if (selectedCampaign?.status === 'completed') {
      setError('Campaign sudah selesai dan tidak bisa diedit');
      return;
    }

    try {
      if (!currentUser) {
        setError('User tidak ditemukan');
        return;
      }

      let comments = '';
      if (decision === 'pending') {
        comments = 'Pending review - manager akan menentukan approve atau revoke di kemudian waktu';
      } else if (decision === 'yes') {
        comments = 'Access approved';
      } else {
        comments = 'Access revoked';
      }

      const auditData = {
        campaign_id: selectedCampaign!.id,
        user_id: user.user_id,
        user_email: user.user_email,
        manager_name: currentUser.name,
        decision: decision,
        comments: comments,
        reviewed_at: new Date().toISOString()
      };

      await requestService.submitAuditResult(auditData);
      
      // Reload campaign details to update the UI
      await loadCampaignDetails(selectedCampaign!.id);
      
      console.log(`✅ Quick decision submitted: ${decision} for ${user.user_name}`);
    } catch (error) {
      console.error('Error submitting quick decision:', error);
      setError('Gagal menyimpan keputusan');
    }
  };

  const handleSubmitReview = async () => {
    try {
      if (!currentUser || !selectedUser || !reviewDecision) {
        setError('Data tidak lengkap');
        return;
      }

      const auditData = {
        campaign_id: selectedCampaign!.id,
        user_id: selectedUser.user_id,
        user_email: selectedUser.user_email,
        manager_name: currentUser.name,
        decision: reviewDecision,
        comments: reviewComments,
        reviewed_at: new Date().toISOString()
      };

      await requestService.submitAuditResult(auditData);
      
      // Reload campaign details to update the UI
      await loadCampaignDetails(selectedCampaign!.id);
      
      // Close dialog and reset form
      setShowReviewDialog(false);
      setSelectedUser(null);
      setReviewDecision(null);
      setReviewComments('');
      
      console.log('✅ Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Gagal menyimpan review');
    }
  };

  const handleFinishCampaign = async () => {
    try {
      if (!selectedCampaign) {
        setError('Campaign tidak ditemukan');
        return;
      }

      // Check if all users have been reviewed
      const reviewedCount = auditResults.length;
      const totalUsers = campaignUsers.length;
      
      if (reviewedCount < totalUsers) {
        setError(`Masih ada ${totalUsers - reviewedCount} user yang belum direview`);
        return;
      }

      // Update campaign status to completed
      await requestService.updateCampaign(selectedCampaign.id, {
        status: 'completed',
        progress: 100
      });

      // Reload data
      await loadData();
      await loadCampaignDetails(selectedCampaign.id);
      
      console.log('✅ Campaign finished successfully');
    } catch (error) {
      console.error('Error finishing campaign:', error);
      setError('Gagal menyelesaikan campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Aktif</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-500">Selesai</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'yes':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Diterima
          </Badge>
        );
      case 'no':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">Menunggu Review</Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserReviewStatus = (userId: string) => {
    const result = auditResults.find(ar => ar.user_id === userId);
    return result;
  };

  const getProgressPercentage = () => {
    if (campaignUsers.length === 0) return 0;
    const reviewedCount = auditResults.length;
    return Math.round((reviewedCount / campaignUsers.length) * 100);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter campaigns based on status
  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active');
  const completedCampaigns = campaigns.filter(campaign => campaign.status === 'completed');
  const displayedCampaigns = showCompleted ? completedCampaigns : activeCampaigns;

  // Detail view - must be checked BEFORE Archive section
  if (viewMode === 'detail' && selectedCampaign) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleBackToList} size="sm">
                ← Kembali
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">{selectedCampaign.name}</h1>
              {selectedCampaign.status === 'completed' && (
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Selesai
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mt-2">{selectedCampaign.description}</p>
            {selectedCampaign.status === 'completed' && (
              <p className="text-sm text-blue-600 mt-1">
                📋 Campaign ini sudah selesai dan hanya bisa dilihat (read-only)
              </p>
            )}
          </div>
          {getStatusBadge(selectedCampaign.status)}
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total User</p>
                  <p className="text-2xl font-bold">{campaignUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sudah Direview</p>
                  <p className="text-2xl font-bold">{auditResults.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Progress</p>
                  <p className="text-2xl font-bold">{getProgressPercentage()}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="text-2xl font-bold">{getDaysUntilDue(selectedCampaign.due_date)}</p>
                  <p className="text-xs text-gray-500">hari lagi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Progress Review</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{getProgressPercentage()}% ({auditResults.length}/{campaignUsers.length})</span>
                  {getProgressPercentage() === 100 && selectedCampaign.status !== 'completed' && (
                    <Button
                      onClick={handleFinishCampaign}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Finish Campaign
                    </Button>
                  )}
                  {selectedCampaign.status === 'completed' && (
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Campaign Selesai
                    </Badge>
                  )}
                </div>
              </div>
              <Progress value={getProgressPercentage()} className="w-full h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar User untuk Review</CardTitle>
            <CardDescription>
              Review akses user untuk aplikasi {selectedCampaign.application_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaignUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada User</h3>
                <p className="text-gray-500">Belum ada user yang ditambahkan ke campaign ini</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Level Akses</TableHead>
                    <TableHead>Tanggal Akses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keputusan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignUsers.map((user) => {
                    const review = getUserReviewStatus(user.user_id);
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.user_name}</TableCell>
                        <TableCell>{user.user_email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.current_access_level}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.access_granted_date)}</TableCell>
                        <TableCell>
                          {review ? (
                            <Badge variant="default" className="bg-green-500">
                              Sudah Direview
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Belum Direview
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {review ? (
                            <div className="space-y-1">
                              {getDecisionBadge(review.decision)}
                              {review.comments && (
                                <p className="text-xs text-gray-500">
                                  {review.comments}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline">Menunggu Review</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {selectedCampaign.status === 'completed' ? (
                            <Badge variant="outline" className="text-gray-500">
                              <Eye className="w-3 h-3 mr-1" />
                              Read Only
                            </Badge>
                          ) : !review ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleQuickDecision(user, 'yes')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleQuickDecision(user, 'pending')}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                              >
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Pending
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleQuickDecision(user, 'no')}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Revoke
                              </Button>
                            </div>
                          ) : editingUser === user.user_id ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleInlineDecision(user, 'yes')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleInlineDecision(user, 'pending')}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                              >
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Pending
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleInlineDecision(user, 'no')}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Revoke
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  console.log('🔍 Edit Decision button clicked for:', user.user_name);
                                  handleReviewUser(user);
                                }}
                                className="border-blue-500 text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Edit Decision
                              </Button>
                              {review.decision !== 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQuickDecision(user, review.decision === 'yes' ? 'no' : 'yes')}
                                  className={review.decision === 'yes' ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'}
                                >
                                  {review.decision === 'yes' ? (
                                    <>
                                      <X className="w-4 h-4 mr-1" />
                                      Change to Revoke
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Change to Accept
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickDecision(user, 'pending')}
                                className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                              >
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Set Pending
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Archive section for completed campaigns
  if (showCompleted) {
    return (
      <div className="space-y-6">
        {/* Archive Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📁 Campaign Archive</h1>
              <p className="text-gray-600 mt-2">Riwayat campaign yang telah diselesaikan</p>
              {currentUser && (
                <p className="text-sm text-gray-500 mt-1">
                  Logged in as: {currentUser.name} ({currentUser.role})
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCompleted(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Kembali ke Active
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Archive Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCampaigns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{activeCampaigns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-lg font-bold text-gray-900">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Archive List */}
        {completedCampaigns.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Archive Kosong</h3>
              <p className="text-gray-500 mb-6">
                Belum ada campaign yang telah diselesaikan
              </p>
              <Button
                variant="outline"
                onClick={() => setShowCompleted(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Play className="w-4 h-4 mr-2" />
                Lihat Active Campaigns
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {completedCampaigns.map((campaign) => {
              const daysUntilDue = getDaysUntilDue(campaign.due_date);
              return (
                <Card key={campaign.id} className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl text-gray-900">{campaign.name}</CardTitle>
                          <Badge variant="secondary" className="bg-blue-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                        <CardDescription className="text-base text-gray-700">{campaign.description}</CardDescription>
                      </div>
                      <Button
                        onClick={() => handleViewCampaign(campaign)}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Applications</p>
                          <p className="font-medium text-gray-900">
                            {campaign.application_ids && campaign.application_ids.length > 1 
                              ? `${campaign.application_name} + ${campaign.application_ids.length - 1} others`
                              : campaign.application_name
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Completed Date</p>
                          <p className="font-medium text-gray-900">{formatDate(campaign.due_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CheckCheck className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium text-gray-900">100% Complete</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Clock className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Progress</p>
                          <p className="font-medium text-gray-900">Finished</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Audit</h1>
            <p className="text-gray-600 mt-2">Review akses user untuk campaign yang ditugaskan kepada Anda</p>
          </div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Audit</h1>
            <p className="text-gray-600 mt-2">Review akses user untuk campaign yang ditugaskan kepada Anda</p>
            {currentUser && (
              <p className="text-sm text-gray-500 mt-1">
                Logged in as: {currentUser.name} ({currentUser.role})
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
                Active Campaigns ({activeCampaigns.length})
              </span>
              {completedCampaigns.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompleted(true)}
                  className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <CheckCircle className="w-4 h-4" />
                  📁 Archive ({completedCampaigns.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Campaigns List */}
      {displayedCampaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Tidak ada Campaign Aktif</h3>
            <p className="text-gray-500 mb-6">
              Anda belum ditugaskan untuk campaign audit apapun
            </p>
            <div className="text-sm text-gray-400 space-y-1 max-w-md mx-auto">
              <p>• Pastikan IT Admin telah membuat campaign</p>
              <p>• Pastikan Anda ditugaskan sebagai manager dalam campaign</p>
              <p>• Campaign harus berstatus "active"</p>
            </div>
            {completedCampaigns.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-500 mb-3">
                  💡 Anda memiliki {completedCampaigns.length} campaign yang telah selesai
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowCompleted(true)}
                  className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <CheckCircle className="w-4 h-4" />
                  📁 Lihat Archive
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {displayedCampaigns.map((campaign) => {
            const daysUntilDue = getDaysUntilDue(campaign.due_date);
            return (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{campaign.name}</CardTitle>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <CardDescription className="text-base">{campaign.description}</CardDescription>
                    </div>
                    <Button
                      onClick={() => handleViewCampaign(campaign)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Mulai Review
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Aplikasi</p>
                        <p className="font-medium">
                          {campaign.application_ids && campaign.application_ids.length > 1 
                            ? `${campaign.application_name} + ${campaign.application_ids.length - 1} lainnya`
                            : campaign.application_name
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Due Date</p>
                        <p className="font-medium">{formatDate(campaign.due_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Clock className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sisa Waktu</p>
                        <p className="font-medium">{daysUntilDue} hari</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Progress</p>
                        <p className="font-medium">{campaign.progress}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress Review</span>
                      <span>{campaign.progress}%</span>
                    </div>
                    <Progress value={campaign.progress} className="w-full h-2" />
                  </div>

                  {/* Assigned Managers */}
                  {campaign.assigned_managers && campaign.assigned_managers.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-2">Manager yang Ditugaskan:</p>
                      <div className="flex flex-wrap gap-2">
                        {campaign.assigned_managers.map((manager, index) => (
                          <Badge key={index} variant="outline">{manager}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedUser && auditResults.find(r => r.user_id === selectedUser.user_id) 
                ? 'Edit Keputusan Review' 
                : 'Review Akses User'
              }
            </DialogTitle>
            <DialogDescription>
              {selectedUser && auditResults.find(r => r.user_id === selectedUser.user_id)
                ? 'Ubah keputusan review untuk user ini'
                : 'Evaluasi apakah user masih layak mengakses aplikasi ini'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Informasi User</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nama</p>
                    <p className="font-medium">{selectedUser.user_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedUser.user_email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Aplikasi</p>
                    <p className="font-medium">{selectedUser.application_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Level Akses</p>
                    <p className="font-medium">{selectedUser.current_access_level}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Tanggal Akses</p>
                    <p className="font-medium">{formatDate(selectedUser.access_granted_date)}</p>
                  </div>
                </div>
                
                {/* Show current decision if editing */}
                {auditResults.find(r => r.user_id === selectedUser.user_id) && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Keputusan Saat Ini</h4>
                    <div className="flex items-center gap-2">
                      {getDecisionBadge(auditResults.find(r => r.user_id === selectedUser.user_id)?.decision || '')}
                      <span className="text-sm text-gray-600">
                        {auditResults.find(r => r.user_id === selectedUser.user_id)?.comments}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">Keputusan *</Label>
                <div className="flex gap-3 mt-3">
                  <Button
                    variant={reviewDecision === 'yes' ? 'default' : 'outline'}
                    onClick={() => setReviewDecision('yes')}
                    className="flex items-center gap-2 flex-1 h-12 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Accept
                  </Button>
                  <Button
                    variant={reviewDecision === 'pending' ? 'default' : 'outline'}
                    onClick={() => setReviewDecision('pending')}
                    className="flex items-center gap-2 flex-1 h-12 bg-yellow-600 hover:bg-yellow-700"
                  >
                    <AlertCircle className="w-5 h-5" />
                    Pending
                  </Button>
                  <Button
                    variant={reviewDecision === 'no' ? 'destructive' : 'outline'}
                    onClick={() => setReviewDecision('no')}
                    className="flex items-center gap-2 flex-1 h-12"
                  >
                    <X className="w-5 h-5" />
                    Revoke
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="comments" className="text-base font-medium">Komentar (Opsional)</Label>
                <Textarea
                  id="comments"
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Berikan alasan keputusan Anda..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={handleSubmitReview}
                  disabled={!reviewDecision}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {selectedUser && auditResults.find(r => r.user_id === selectedUser.user_id)
                    ? 'Update Keputusan'
                    : 'Simpan Review'
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

